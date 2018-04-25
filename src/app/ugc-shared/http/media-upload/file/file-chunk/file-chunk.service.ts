import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { StaticUtils } from '../../../../static-utils';
import { PlatformHttpService } from '../../../platform-http.service';
import { Response, Http, BrowserXhr } from '@angular/http';
import { Event } from '@angular/router/src/events';

export const CHUNK_UPLOAD_RETRY_ATTEMPTS_LIMIT = 3;
export const CHUNK_UPLOAD_TIMEOUT_IN_SECONDS = 180;
export const CHUNK_UPLOAD_CONTENT_TYPE = 'binary/octet-stream';
export const MAX_EARLY_FAILURE_TIME_IN_SECONDS = 10;

@Injectable()
export class FileChunkService {

    constructor(
        private _platformHttpService: PlatformHttpService,
        private _browserXhr: BrowserXhr,
    ) {

    }

    public createChunk(blob: Blob, chunkId: string): FileChunk {
        return new ChunkInstance(blob, this._platformHttpService, this._browserXhr, chunkId);
    }
}

export class ChunkInstance implements FileChunk {
    uploadUrl: string = '';
    blob: Blob = null;
    sizeInBytes: number = 0;
    progressObserver: Observable<ChunkObserverData>;
    loggingObserver: Observable<ChunkLogging>;
    chunkId: string = '';
    isUploadInProgress: boolean = false;
    isUploadSuccessful: boolean = false;
    isUploadPaused: boolean = false;
    isUploadFailed: boolean = false;
    retryAttemptCount: number = 0;
    progressInPercent: number = 0;
    progressInBytes: number = 0;
    progressObserverHandle: any;
    logObserverHandle: any;
    xhr: XMLHttpRequest;
    authorizationToken: string = '';

    private _progressSubject: Subject<ChunkObserverData> = new Subject();
    private _loggingSubject: Subject<ChunkLogging> = new Subject();

    private _tmProgressCheck: number = 0;
    private _clearTimeOfProgressCheck: any;

    private _chunkLogData: ChunkLogData;
    private _chunkRetriedData: RetriedPartsInfo;

    constructor(
        blob: Blob,
        _http: PlatformHttpService,
        private _browserXhr: BrowserXhr,
        chunkId: string
    ) {
        this.chunkId = chunkId;
        this.blob = blob;
        this.progressObserver = this._progressSubject.asObservable();
        this.loggingObserver = this._loggingSubject.asObservable();

        this.createChunkLogObject();
    }

    startUpload(): boolean | void {
        this.xhr = this._browserXhr.build();

        this.xhr.timeout = CHUNK_UPLOAD_TIMEOUT_IN_SECONDS * 1000;
        this.xhr.open('PUT', this.uploadUrl, true);
        this.xhr.setRequestHeader('Content-Type', CHUNK_UPLOAD_CONTENT_TYPE);
        this.xhr.setRequestHeader('x-amz-acl', 'bucket-owner-full-control');

        this._tmProgressCheck = 0;

        this._clearTimeOfProgressCheck = setTimeout(() => {
            if (this._tmProgressCheck === 0 && !this.isUploadPaused) {
                this.informEarlyFailure();
                clearTimeout(this._clearTimeOfProgressCheck);
            }
        }, MAX_EARLY_FAILURE_TIME_IN_SECONDS * 1000);

        this.xhr.upload.onprogress = (e) => {

            if (e.lengthComputable) {
                this.progressInBytes = e.loaded;
                this._progressSubject.next({
                    observerType: 'UPLOAD-PROGRESS',
                    chunkId: this.chunkId,
                    progressInBytes: e.loaded
                });
                this._tmProgressCheck = Date.now();
            }
        };

        this.xhr.onload = (ev: any) => {
            if (ev.currentTarget.status == 200) {
                this.isUploadInProgress = false;
                this.isUploadSuccessful = true;
                this.isUploadFailed = false;

                if (this._chunkLogData.isRetry) {
                    this._chunkLogData.retrySuccess = true;
                }

                this._chunkLogData.endTm = Date.now();
                this.postChunkLog();

                this._progressSubject.next({
                    observerType: 'UPLOAD-SUCCESS',
                    chunkId: this.chunkId
                });

                return;
            }

            this.handleRetry();
        };

        this.xhr.onerror = (e) => {
            this.handleRetry();
        };

        this.xhr.ontimeout = (e) => {
            this.handleRetry();
        };

        this.xhr.onabort = (e) => {
            this.handleRetry();
        };

        this.xhr.send(this.blob);

        this._chunkLogData.stTm = Date.now();

        return;
    }
    pauseUpload(): boolean | void {
        this.isUploadPaused = true;

        this.xhr.abort();
        return;
    }
    resumeUpload() {
        this.isUploadPaused = false;

        this.startUpload();
        return;
    }
    resetUpload(): boolean | void {
        this.progressInBytes = 0;
        this.progressInPercent = 0;
        return;
    }
    handleRetry() {
        if (this.isUploadPaused) {
            return false;
        }

        if (this.retryAttemptCount < CHUNK_UPLOAD_RETRY_ATTEMPTS_LIMIT) {
            this.resetUpload();
            this.startUpload();

            this.retryAttemptCount++;

            this._chunkLogData.isRetry = true;
            this._chunkRetriedData.retryCount = this.retryAttemptCount;

            return null;
        }

        this._chunkLogData.retrySuccess = false;

        this.postChunkLog();

        this._progressSubject.next({
            observerType: 'UPLOAD-ERROR',
            chunkId: this.chunkId,
            isError: true,
            errorMessage: 'Upload failed even after retrying ' + CHUNK_UPLOAD_RETRY_ATTEMPTS_LIMIT + ' times'
        });
    }
    informEarlyFailure() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }

    createChunkLogObject() {
        this._chunkLogData = {
            dataSize: this.blob.size,
            stTm: 0,
            tmTaken: 0,
            endTm: 0,
            isRetry: null,
            retrySuccess: null,
            part: this.chunkId
        };
        this._chunkRetriedData = {
            part: this.chunkId,
            retryCount: 0
        };
    }

    postChunkLog() {
        if (this._chunkLogData.isRetry) {
            this._loggingSubject.next({
                type: 'RETRIED-CHUNKS',
                data: this._chunkRetriedData
            }); // send the log data for subscriber
        }
        this._loggingSubject.next({
            type: 'CHUNK-LOG',
            data: this._chunkLogData
        }); // send the log data for subscriber
    }

    public get chunkLogData() {
        return this._chunkLogData;
    }
}

/**
 * File chunk object.
 */
export interface FileChunk {
    uploadUrl: string;
    blob: Blob;
    sizeInBytes: number;
    progressObserver: Observable<ChunkObserverData>;
    loggingObserver: Observable<ChunkLogging>;
    chunkId: string;
    isUploadInProgress: boolean;
    isUploadPaused: boolean;
    isUploadSuccessful: boolean;
    isUploadFailed: boolean;
    retryAttemptCount: number;
    progressInPercent: number;
    progressInBytes: number;
    xhr: XMLHttpRequest;
    progressObserverHandle: any;
    logObserverHandle: any;
    authorizationToken?: any;
    startUpload(): boolean | void;
    pauseUpload(): boolean | void;
    resetUpload(): boolean | void;
    handleRetry(): boolean | void;
    resumeUpload(): boolean | void;
    informEarlyFailure(): boolean | void;
}

/**
 * Data which is passed to the observer listener of chunk upload progress.
 */
export interface ChunkObserverData {
    observerType: 'UPLOAD-PROGRESS' | 'UPLOAD-ERROR' | 'UPLOAD-SUCCESS';
    chunkId: string; // chunk file id
    isError?: boolean; // true indicates error
    errorMessage?: string; // error message
    progressInBytes?: number;
    progressInPercent?: number;
}

/**
 * Chunk log are specific for a chunk upload. These logs are more specifc for UGC file upload and
 * not general application logs.
 */
export interface ChunkLogData {
    dataSize: number;
    stTm: number;
    tmTaken: number;
    endTm: number;
    isRetry: boolean | null;
    retrySuccess: boolean | null;
    part: string | number | any;
}
export interface RetriedPartsInfo {
    part: string | number | any;
    retryCount: number;
}

export interface ChunkLogging {
    type: 'CHUNK-LOG' | 'RETRIED-CHUNKS';
    data: ChunkLogData | RetriedPartsInfo;
}