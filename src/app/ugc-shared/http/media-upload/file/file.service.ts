import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Headers } from '@angular/http';

import { StaticUtils } from '../../../static-utils';
import { PlatformHttpService } from '../../platform-http.service';
import { FileChunk, FileChunkService, ChunkObserverData, ChunkInstance, ChunkLogging, ChunkLogData, RetriedPartsInfo } from './file-chunk/file-chunk.service';

import { ConfigService } from '../../../../core/services/config/config.service';
import { setTimeout } from 'timers';

export const PARALLEL_CHUNK_UPLOAD_LIMIT = 3;
export const API_RETRY_ATTEMPTS_LIMIT = 3;
export const FILE_RETRY_LIMIT = 3;

@Injectable()
export class FileService {

    public isChunkFileUploadSupported: boolean = true;

    constructor(
        private _platformHttpService: PlatformHttpService,
        private _chunkService: FileChunkService,
        private _configService: ConfigService
    ) {

    }

    public createFile(file: File): MediaFile {
        return new MediaFileInstance(
            file,
            this._platformHttpService,
            this._chunkService,
            this._configService
        );
    }
}

export class MediaFileInstance implements MediaFile {
    blob: File;
    id: string;
    chunks: FileChunk[] = [];
    mediaData: MediaDetails;
    sizeInBytes: number = 0;

    isUploadSuccessful: boolean;
    isUploadInProgress: boolean = false;
    isUploadPaused: boolean = false;
    progressObserver: Observable<MediaFileObserverData>;
    loggingObserver: Observable<FileLogData>;
    pendingQue: string[] = [];
    progressQue: string[] = [];
    finishedQue: string[] = [];
    failedQue: string[] = [];
    successfulQue: string[] = [];
    uploadFileInfo: ApiUploadFileInfo;

    progressObserverHandle: any;

    public get progressInBytes(): number {
        return this._progressInBytes;
    }
    public set progressInBytes(bytes: number) {
        this._progressInBytes = bytes;
    }

    private _progressSubject: Subject<MediaFileObserverData> = new Subject();
    private _loggingSubject: Subject<FileLogData> = new Subject();
    private _progressInBytes: number = 0;

    retryFileAttemptsCount: number = 0;

    private _fileLogData: FileLogData;

    constructor(
        file: File,
        private _http: PlatformHttpService,
        private _chunkService: FileChunkService,
        private _configService: ConfigService
    ) {
        this.blob = file;

        this.progressObserver = this._progressSubject.asObservable();
        this.loggingObserver = this._loggingSubject.asObservable();

        this.id = StaticUtils.createRandomString();
        this.sizeInBytes = this.blob.size;
        this.mediaData = {
            bubbleId: 644950845278800000, // StaticUtils.queryParams.bi,
            noOfBytes: this.sizeInBytes,
            fileOrigin: 'NOT-SET-YET',
            mediaType: StaticUtils.getFileTypeByFileBlob(this.blob),
            capturedTzName: StaticUtils.getTimezoneName((file.lastModifiedDate || (new Date()))),
            capturedTs: file.lastModifiedDate.toISOString() || (new Date()).toISOString(),
            capturedTzOffset: StaticUtils.getTimezoneOffset((file.lastModifiedDate || (new Date())))
        };

        this.createFileLogObject();
    }

    getFailedChunks(): FileChunk[] {
        return;
    }
    getSuccessfulChunks(): FileChunk[] {
        return;
    }
    startUpload(): Observable<MediaFileObserverData> | void {
        this.postMedia();

        // log
        this._fileLogData.tmStarted = Date.now();
        this._fileLogData.uploadStarted = true;
        this._fileLogData.inProgress = true;
        this._fileLogData.fileOrigin = this.mediaData.fileOrigin;
        // EOF Log

        return this.progressObserver;
    }
    pauseUpload(): boolean | void {
        if (this.isUploadPaused) {
            throw 'Upload is already paused.';
        }

        this.isUploadPaused = true;

        for (let i = 0; i < this.progressQue.length; i++) {
            let chunkItem: FileChunk = this.chunks.find((item: FileChunk) => {
                return item.chunkId == this.progressQue[i];
            });

            if (chunkItem) {
                chunkItem.pauseUpload();
            }
        }

        return;
    }
    resumeUpload(): boolean | void {
        if (!this.isUploadPaused) {
            throw 'Upload is not paused.';
        }

        this.isUploadPaused = false;

        for (let i = 0; i < this.progressQue.length; i++) {
            let chunkItem: FileChunk = this.chunks.find((item: FileChunk) => {
                return item.chunkId == this.progressQue[i];
            });

            if (chunkItem) {
                chunkItem.resumeUpload();
            }
        }

        return;
    }
    chunkFile() {
        let iBlobStart: number = 0;
        let iBlobEnd: number = this.uploadFileInfo.chunkSize;

        for (let i = 0; i < this.uploadFileInfo.uploadFileInfo.length; i++) {
            let chunk: FileChunk = this._chunkService.createChunk(this.blob.slice(iBlobStart, iBlobEnd), (i + 1).toString().trim());
            chunk.uploadUrl = this.uploadFileInfo.uploadFileInfo[i].uploadUrl;
            chunk.sizeInBytes = iBlobEnd - iBlobStart;
            chunk.authorizationToken = this.uploadFileInfo.authorizationToken;
            this.chunks.push(chunk);
            iBlobStart = iBlobEnd;
            iBlobEnd += this.uploadFileInfo.chunkSize;
        }

        // log
        this._fileLogData.totalChunks = this.chunks.length;
        this._fileLogData.isChunckUpload = true;
        // EOF Log
    }
    postMedia() {

        // log
        let tmpApiLog: ApiLog = {
            data: { request: this.mediaData },
            dataSize: JSON.stringify(this.mediaData).length,
            endTm: 0,
            isSuccess: null,
            method: 'POST',
            stTm: Date.now(),
            tmTaken: 0,
            url: this.mediaUrl()
        };
        // EOF log

        this._http.post(this.mediaUrl(), this.mediaData)
            .map((response) => {
                return response.json();
            }).retry(API_RETRY_ATTEMPTS_LIMIT)
            .delay(100)
            .subscribe((data: ApiUploadFileInfo) => {
                this.uploadFileInfo = data;
                this.chunkFile();
                this.startChunkUploadProcess();

                // log
                tmpApiLog.dataSize += JSON.stringify(data).length;
                tmpApiLog.data.response = data;
                tmpApiLog.endTm = Date.now();
                tmpApiLog.isSuccess = true;
                this._fileLogData.apiInfo.push(tmpApiLog);
                this._fileLogData.uploadId = this.uploadFileInfo.uploadId;
                this._fileLogData.mediaId = this.uploadFileInfo.mediaId;
                this._fileLogData.avgGfApiSpeed = this.calculateAvgUploadSpeed({ type: 'API', data: this._fileLogData.apiInfo });
                // EOF Log

            }, (error) => {
                // log
                tmpApiLog.endTm = Date.now();
                tmpApiLog.data.response = error;
                tmpApiLog.isSuccess = false;
                this._fileLogData.apiInfo.push(tmpApiLog);
                this._fileLogData.avgGfApiSpeed = this.calculateAvgUploadSpeed({ type: 'API', data: this._fileLogData.apiInfo });
                // EOF Log

                this.updateObserver({
                    observerType: 'UPLOAD-ERROR',
                    isError: true,
                    mediaFileId: this.id,
                    errorMessage: 'POST local-media-file/upload call failed even after ' + API_RETRY_ATTEMPTS_LIMIT + ' attempts.'
                });
            });
    }
    startChunkUploadProcess() {
        if (this.isUploadInProgress) {
            throw 'Upload has already started';
        }

        this.isUploadInProgress = true;

        this.updatePendingQue();

        let limit: number = (PARALLEL_CHUNK_UPLOAD_LIMIT <= this.chunks.length ? PARALLEL_CHUNK_UPLOAD_LIMIT : this.chunks.length);
        for (let i = 0; i < limit; i++) {
            this.uploadNextChunk();
        }

        return this.progressObserver;
    }
    uploadNextChunk() {
        if (this.pendingQue.length) {
            let chunkId: string = this.pendingQue.shift();
            let chunkItem: FileChunk = this.chunks.find((item: FileChunk) => {
                return item.chunkId == chunkId;
            });

            if (chunkItem) {
                this.progressQue.push(chunkItem.chunkId);
                this.updatePendingQue(chunkItem.chunkId);
                chunkItem.startUpload();

                // Log
                chunkItem.logObserverHandle = chunkItem.loggingObserver.subscribe((log: ChunkLogging) => {
                    switch (log.type) {
                        case 'CHUNK-LOG':
                            this._fileLogData.partsInfo.push(<ChunkLogData> log.data);
                            break;
                        case 'RETRIED-CHUNKS':
                            this._fileLogData.retriedPartsInfo.push(<RetriedPartsInfo> log.data);
                            break;
                    }
                });
                // EOF Log

                chunkItem.progressObserverHandle = chunkItem.progressObserver.subscribe((data: ChunkObserverData) => {
                    this.validateNextChunkUpload(data, chunkItem);
                });
            }
            return;
        }

        if (!this.progressQue.length) {
            this.finalizeUpload();
        }
    }

    validateNextChunkUpload(data: ChunkObserverData, chunkItem: FileChunk) {
        if (data.observerType == 'UPLOAD-PROGRESS') {
            this.updateProgress();
            return;
        }

        this.manageQues(data);
        this.updateProgress();
        this.uploadNextChunk();

        chunkItem.progressObserverHandle.unsubscribe();
        chunkItem.logObserverHandle.unsubscribe();

        // log
        this._fileLogData.totalChunksCompleted = this.successfulQue.length;
        // EOF log
    }

    /**
     * Updates failed, successful, progress and finished Ques.
     * @param data Data passed from success and error from chunk upload observer
     */
    manageQues(data: ChunkObserverData) {

        if (data.observerType == 'UPLOAD-ERROR') {
            if (this.failedQue.indexOf(data.chunkId) == -1) {
                this.failedQue.push(data.chunkId);
            }
        }
        if (data.observerType == 'UPLOAD-SUCCESS') {
            if (this.successfulQue.indexOf(data.chunkId) == -1) {
                this.successfulQue.push(data.chunkId);
            }
        }

        let index: number = this.progressQue.indexOf(data.chunkId);
        if (index != -1) {
            this.progressQue.splice(index, 1);
        }

        if (this.finishedQue.indexOf(data.chunkId) == -1) {
            this.finishedQue.push(data.chunkId);
        }
    }

    /**
     * Manages pendingQue
     * @param chunkId MediaFile.id, optional. If passed only that id is removed from the pending que.
     */
    updatePendingQue(chunkId?: string): boolean | void {
        if (chunkId) {
            let index: number = this.pendingQue.indexOf(chunkId);
            if (index != -1) {
                this.pendingQue.splice(index, 1);
            }
            return true;
        }

        this.pendingQue = [];
        for (let i = 0; i < this.chunks.length; i++) {
            this.pendingQue.push(this.chunks[i].chunkId);
        }
    }
    mediaUrl(): string {
        return this.mediaBaseUrl() + '/upload';
    }
    finalizeUrl(): string {
        return this.mediaBaseUrl() + '/upload/' + this.uploadFileInfo.uploadId + '/finalize';
    }

    mediaBaseUrl(): string {
        return this._configService.config.platformBaseUrl + 'media';
    }

    updateObserver(data: MediaFileObserverData) {
        this._progressSubject.next(data);
    }
    finalizeUpload() {
        if (this.failedQue.length) {
            if (this.retryFileAttemptsCount < FILE_RETRY_LIMIT) {
                this.retryFileAttemptsCount++;
                this.isUploadInProgress = false;

                this.resetUpload();
                this.postMedia();

                return;
            }

            this.isUploadSuccessful = false;
            this.updateObserver({
                observerType: 'UPLOAD-ERROR',
                mediaFileId: this.id,
                isError: true,
                errorMessage: 'Upload failed even after retrying ' + API_RETRY_ATTEMPTS_LIMIT + ' times.'
            });

            return;
        }

        this.postFinalizeUpload({
            status: 'DONE'
        });
    }

    postFinalizeUpload(payLoad: {
        status: 'DONE' | 'CANCELED' | 'ERROR'
    }) {
        let headers = new Headers();
        headers.append('User-Authorization', this.uploadFileInfo.authorizationToken);

        // log
        let tmpApiLog: ApiLog = {
            data: { request: payLoad },
            dataSize: JSON.stringify(payLoad).length,
            endTm: 0,
            isSuccess: null,
            method: 'POST',
            stTm: Date.now(),
            tmTaken: 0,
            url: this.finalizeUrl()
        };
        // EOF Log

        this._http.post(this.finalizeUrl(), payLoad, {
            headers
        }).map((response) => {
            return response.json();
        }).retry(API_RETRY_ATTEMPTS_LIMIT)
            .delay(100)
            .subscribe((data: ApiUploadFileInfo) => {
                // log
                tmpApiLog.dataSize += JSON.stringify(data).length;
                tmpApiLog.data.response = data;
                tmpApiLog.endTm = Date.now();
                tmpApiLog.isSuccess = true;
                this._fileLogData.apiInfo.push(tmpApiLog);
                this._fileLogData.inProgress = false;
                this._fileLogData.uploadEnded = true;
                this._fileLogData.uploadSuccess = true;
                this._fileLogData.tmEnded = Date.now();
                this._fileLogData.tmElapsed = this._fileLogData.tmEnded - this._fileLogData.tmStarted;
                this._fileLogData.avgGfApiSpeed = this.calculateAvgUploadSpeed({ type: 'API', data: this._fileLogData.apiInfo });
                this.postFileLog();
                // EOF Log

                this.isUploadSuccessful = true;
                this.updateObserver({
                    observerType: 'UPLOAD-SUCCESS',
                    mediaFileId: this.id,
                    isError: false,
                    errorMessage: ''
                });
            }, (error) => {

                // log
                tmpApiLog.dataSize += JSON.stringify(error).length;
                tmpApiLog.data.response = error;
                tmpApiLog.endTm = Date.now();
                tmpApiLog.isSuccess = false;
                this._fileLogData.apiInfo.push(tmpApiLog);
                this._fileLogData.uploadSuccess = false;
                this._fileLogData.uploadEnded = true;
                this._fileLogData.inProgress = false;
                this._fileLogData.tmEnded = Date.now();
                this._fileLogData.tmElapsed = this._fileLogData.tmEnded - this._fileLogData.tmStarted;
                this.postFileLog();
                // EOF Log

                this.updateObserver({
                    observerType: 'UPLOAD-ERROR',
                    isError: true,
                    mediaFileId: this.id,
                    errorMessage: 'POST local-media-file/{upload-id}/finalize call failed even after ' + API_RETRY_ATTEMPTS_LIMIT + ' attempts.'
                });
            });

    }

    updateProgress() {
        let total: number = 0;
        for (let i = 0; i < this.chunks.length; i++) {
            total += this.chunks[i].progressInBytes;
        }
        this.progressInBytes = total;

        this.updateObserver({
            observerType: 'UPLOAD-PROGRESS',
            mediaFileId: this.id,
            progressInBytes: this.progressInBytes,
            progressInPercent: Math.round((this.progressInBytes * 100 / this.sizeInBytes))
        });
    }

    resetUpload() {
        this.failedQue = [];
        this.pendingQue = [];
        this.progressQue = [];
        this.finishedQue = [];
        this.successfulQue = [];
        this.chunks = [];
        this.progressInBytes = 0;
    }

    createFileLogObject() {
        this._fileLogData = {
            amzCfId: '',
            apiInfo: [],
            avgChunkUploadSpeedMs: '',
            avgFullFileUploadSpeed: '',
            avgGfApiSpeed: '',
            connectionType: ((<any> navigator).connection && (<any> navigator).connection.type) ? (<any> navigator).connection.type : 'UNKNOWN',
            fileOrigin: 'NOT-SET-YET',
            fileSize: this.blob.size,
            fullFileEndTm: 0,
            fullFileStTm: 0,
            inProgress: null,
            isChunckUpload: null,
            isFullFileUpload: null,
            isParallelUpload: true,
            mediaFileId: '',
            mediaId: 0,
            parallelThreads: PARALLEL_CHUNK_UPLOAD_LIMIT,
            partsInfo: [],
            retriedPartsInfo: [],
            serverDt: '',
            tmElapsed: 0,
            tmEnded: 0,
            tmEndedDateTime: '',
            tmEstRemaining: '',
            tmStarted: 0,
            tmStartedDateTime: '',
            totalChunks: 0,
            totalChunksCompleted: 0,
            uploadEnded: null,
            uploadId: '',
            uploadStarted: null,
            uploadSuccess: null
        };
    }

    calculateAvgUploadSpeed(log: { type: 'CHUNK' | 'API', data: Array<ApiLog | ChunkLogData> }): string {
        let tm: number = 0;
        let size: number = 0;
        let validItems: number = 0;

        switch (log.type) {
            case 'API':
            case 'CHUNK':
                for (let i = 0; i < log.data.length; i++) {
                    if (log.data[i].endTm && log.data[i].stTm) {
                        size += log.data[i].dataSize;
                        tm += log.data[i].endTm - log.data[i].endTm;
                        validItems++;
                    }
                }
                break;
        }

        if (validItems) {
            return (size / validItems).toFixed(2) + 'kbps';
        }

        return '';
    }

    public get fileLogData() {
        return this._fileLogData;
    }

    postFileLog() {
        this._fileLogData.avgChunkUploadSpeedMs = this.calculateAvgUploadSpeed({ type: 'CHUNK', data: this._fileLogData.partsInfo });
        this._loggingSubject.next(this._fileLogData);
    }
}

/**
 * Interface which defines a custom file object which can upload a file with chunks or do full file upload.
 */
export interface MediaFile {
    blob: File;
    id: string;
    chunks: FileChunk[];
    sizeInBytes: number;
    progressInBytes: number;
    mediaData: MediaDetails;
    isUploadInProgress: boolean;
    isUploadPaused: boolean;
    progressObserver: Observable<MediaFileObserverData>; // overall file upload progress observer
    loggingObserver: Observable<FileLogData>; // overall file upload progress observer
    progressObserverHandle: any;
    pendingQue: string[]; // array of FileChunkIDs which are yet to be uploaded
    progressQue: string[]; // array of FileChunkIDs which are currently in progress
    finishedQue: string[]; // array of FileChunkIDs which have finished upload. contains both successful upload and failed upload
    failedQue: string[]; // array of FileChunkIDs which have failed to upload.
    successfulQue: string[]; // array of FileChunkIDs which got uploaded successfully.
    retryFileAttemptsCount: number;
    isUploadSuccessful: boolean;
    uploadFileInfo: ApiUploadFileInfo;
    chunkFile(): boolean | any;
    getFailedChunks(): FileChunk[];
    getSuccessfulChunks(): FileChunk[];
    startUpload(): Observable<MediaFileObserverData> | void;
    pauseUpload(): boolean | void;
    resetUpload(): boolean | void;
    resumeUpload(): boolean | void;
    uploadNextChunk(): boolean | void;
    validateNextChunkUpload(data: ChunkObserverData, chunk: FileChunk): boolean | void;
    updateObserver(data: MediaFileObserverData): boolean | void;
    finalizeUpload(): boolean | void;
    updatePendingQue(chunkId?: string): boolean | void; // sets chunkId into pending ques. If chunkId is passed than that id is removed from the pendingQue
    postMedia(); // Makes API call for post media
    updateProgress();
}

/**
 * Interface for the object which is sent as a payload for POST meda/upload API
 */
export interface MediaDetails {
    fileOrigin: 'API_CAMERA_CAPTURED_SUBMISSION' | 'API_CAMERA_ROLL_IMPORTED' | 'NOT-SET-YET';
    mediaType: 'photo' | 'video' | 'other';
    noOfBytes: number;
    bubbleId: number;

    title?: string;
    capturedTzName?: string;
    capturedTzOffset?: string;
    fileName?: string;
    capturedTs?: string; //2017-12-12T10:50:12.129Z,
    longitude?: string;
    latitude?: string;
    accountId?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
}

/**
 * Data which is passed to the observer listener of file upload progress.
 */
export interface MediaFileObserverData {
    observerType: 'UPLOAD-PROGRESS' | 'UPLOAD-ERROR' | 'UPLOAD-SUCCESS';
    mediaFileId: string; // media file id
    isError?: boolean; // true indicates error
    errorMessage?: string; // error message
    progressInBytes?: number;
    progressInPercent?: number;
}

/**
 * Response of POST media/upload API
 */
export interface ApiUploadFileInfo {
    mediaId: number;
    uploadId: string;
    chunkSize: number;
    authorizationToken: string;
    uploadFileInfo: Array<{
        partNumber: number,
        uploadUrl: string
    }>;
};

export interface FileLogData {
    uploadStarted: boolean | null;
    inProgress: boolean | null;
    uploadEnded: boolean | null;
    uploadSuccess: boolean | null;
    amzCfId: string;
    serverDt: string;
    tmStarted: number;
    tmStartedDateTime: string;
    tmEnded: number;
    tmEndedDateTime: string;
    tmElapsed: number;
    tmEstRemaining: string;
    avgChunkUploadSpeedMs: string;
    avgFullFileUploadSpeed: string;
    avgGfApiSpeed: string;
    connectionType: string;
    isChunckUpload: boolean;
    isFullFileUpload: boolean;
    totalChunks: number;
    totalChunksCompleted: number;
    uploadId: string;
    mediaFileId: string;
    mediaId: number;
    fileSize: number;
    isParallelUpload: boolean;
    parallelThreads: number;
    fileOrigin: 'API_CAMERA_CAPTURED_SUBMISSION' | 'API_CAMERA_ROLL_IMPORTED' | 'NOT-SET-YET';
    retriedPartsInfo: RetriedPartsInfo[];
    partsInfo: ChunkLogData[];
    apiInfo: ApiLog[];
    fullFileStTm: number;
    fullFileEndTm: number;
}

export interface ApiLog {
    stTm: number;
    dataSize: number;
    method: 'PUT' | 'POST' | 'GET';
    endTm: number;
    isSuccess: boolean | null;
    data: any;
    tmTaken: number;
    url: string;
}