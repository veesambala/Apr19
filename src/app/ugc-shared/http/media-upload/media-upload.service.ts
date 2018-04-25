import { Injectable } from '@angular/core';
import { MediaFile, FileService, MediaFileObserverData, MediaDetails, MediaFileInstance } from './file/file.service';

import { StaticUtils } from '../../static-utils';
import { Observable, Subject } from 'rxjs';

export const PARALLEL_MEDIA_TO_UPLOAD = 1;

@Injectable()
export class MediaUploadService {

    private _mediaUpload: MediaUpload;
    private _extraMediaInfo: MediaDetails;

    public get mediaUpload(): MediaUpload {
        return this._mediaUpload;
    }

    constructor(private _fileService: FileService) {

    }

    /**
     * Creates a local-media-file upload object which does all the file upload handling.
     */
    public createMediaUpload() {
        if (this.mediaUpload && this.mediaUpload.isActive) {
            throw 'local-media-file upload instance already created. Call resetMediaItems() instead.';
        }

        let _progressSubject: Subject<any> = new Subject();
        this._mediaUpload = new MediaUploadInstance(this._fileService);
    }

    /**
     * Clears all the local-media-file files added. Helpful when a new process of file upload begins from landing page.
     */
    public resetMediaItems() {
        if (!this.mediaUpload || !this.mediaUpload.isActive) {
            throw 'reset called on an invalid local-media-file-upload instance';
        }

        this.mediaUpload.mediaItems = [];
    }

    /**
     * Adds a file to the array
     * @param file File list object
     */
    public addMedia(files: any) {
        for (let i = 0; i < files.length; i++) {
            this.mediaUpload.addMedia(files[i]);
        }
    }

    /**
     * Removes a file from the array of files.
     * @param fileId File ID to be deleted.
     */
    public removeMediaById(fileId: string) {
        if (!fileId) {
            throw 'Please pass a fileId to remove a file from the upload list';
        }

        this.mediaUpload.removeMedia(fileId);
    }

    public startUpload() {
        this.mediaUpload.startUpload();
    }
    public pauseUpload() {
        this.mediaUpload.pauseUpload();
    }
    public resumeUpload() {
        this.mediaUpload.resumeUpload();
    }

    public updateLocationInfo(lat: number, lng: number) {
        this.mediaUpload.mediaItems.forEach((media) => {
            media.mediaData.latitude = lat.toString();
            media.mediaData.longitude = lng.toString();
        });
    }
    public updateMediaTitle(title: string) {
        this.mediaUpload.mediaItems.forEach((media) => {
            media.mediaData.title = title;
        });
    }
    public updateUserInfo(email: string, firstName: string, lastName: string) {
        this.mediaUpload.mediaItems.forEach((media) => {
            media.mediaData.email = email;
            media.mediaData.firstName = firstName;
            media.mediaData.lastName = lastName;
        });
    }
    public fileUploadValidator(files): boolean {
        if (files.length > 5) {
          return false;
        }
        let videoCount = 0;
        for (let value of files) {
          if (value.type.indexOf('video') !== -1) {
            videoCount++;
          }
        }
        if (videoCount > 1) {
          return false;
        }else {
          return true;
        }
      }
}

export class MediaUploadInstance implements MediaUpload {
    mediaItems: MediaFile[] = [];
    instanceId: string = StaticUtils.createRandomString();
    isActive: boolean = true;

    progressObserver: Observable<any>;
    pendingQue: string[] = [];
    progressQue: string[] = [];
    finishedQue: string[] = [];
    failedQue: string[] = [];
    successfulQue: string[] = [];

    isUploadInProgress: boolean = false;
    isUploadPaused: boolean = false;
    initTime: number = Date.now();

    private _progressSubject: Subject<any> = new Subject();

    constructor(private _fileService: FileService) {
        this.progressObserver = this._progressSubject.asObservable();
    }

    /**
     * Returns all the failed local-media-file files
     */
    getFailedMediaItems(): MediaFile[] {
        return [];
    }

    /**
     * Returns all the the files which got uploaded successfully
     */
    getSuccessfulMediaItems(): MediaFile[] {
        return [];
    }

    /**
     * Starts the upload process
     */
    startUpload(): Observable<any> | void {
        if (this.isUploadInProgress) {
            throw 'Upload has already started';
        }
        if (!this.mediaItems.length) {
            throw 'Files are not selected.';
        }

        this._progressSubject.next({
            type: 'UPLOAD-PROCESS-STARTED'
        });

        this.isUploadInProgress = true;

        this.updatePendingQue();

        let limit: number = (PARALLEL_MEDIA_TO_UPLOAD <= this.mediaItems.length) ? PARALLEL_MEDIA_TO_UPLOAD : this.mediaItems.length;

        for (let i = 0; i < limit; i++) {
            this.uploadNext();
        }

        return this.progressObserver;
    }

    /**
     * Pauses upload
     */
    pauseUpload(): boolean | void {
        if (this.isUploadPaused) {
            throw 'Upload is already paused.';
        }

        this.isUploadPaused = true;

        this.mediaItems.forEach((mediaItem: MediaFile) => {
            if (this.progressQue.indexOf(mediaItem.id) != -1) {
                mediaItem.pauseUpload();
            }
        });

        return true;
    }

    /**
     * Resumes upload
     */
    resumeUpload(): boolean | void {
        if (!this.isUploadPaused) {
            throw 'Upload is not paused.';
        }

        this.isUploadPaused = false;

        this.mediaItems.forEach((mediaItem: MediaFile) => {
            if (this.progressQue.indexOf(mediaItem.id) != -1) {
                mediaItem.resumeUpload();
            }
        });

        return true;
    }

    /**
     * Adds a file object to the mediaItems array for upload
     * @param file File item
     */
    addMedia(file: File): string {
        let fileItem: MediaFile = this._fileService.createFile(file);
        fileItem.mediaData.fileOrigin = StaticUtils.getFileOrigin(fileItem.blob, '', this.initTime);

        this.mediaItems.push(fileItem);
        return;
    }

    /**
     * Removes a file object from mediaItems array
     * @param fileId File id to be deleted
     */
    removeMedia(fileId: string): boolean | void {
        let mediaItemIndex: number = -1;
        mediaItemIndex = this.mediaItems.findIndex((file, index, mediaItems) => {
            return file.id == fileId;
        });

        if (mediaItemIndex != -1) {
            this.mediaItems.splice(mediaItemIndex, 1);
        }
    }

    /**
     * Starts uploading a pending local-media-file.
     * Also, checks if any file is pending upload, if not than finishes the upload process.
     */
    uploadNext() {
        if (this.isUploadPaused) {
            return null;
        }

        if (this.pendingQue.length) {
            let mediaFileId: string = this.pendingQue.shift();
            let mediaItem: MediaFile = this.mediaItems.find((item: MediaFile) => {
                return item.id == mediaFileId;
            });
            if (mediaItem) {
                this.progressQue.push(mediaItem.id);
                this.updatePendingQue(mediaItem.id);
                mediaItem.startUpload();
                this._progressSubject.next({
                    type: 'FILE-UPLOAD-STARTED',
                    mediaItem,
                    extra: null
                });
                mediaItem.progressObserverHandle = mediaItem.progressObserver.subscribe((data: MediaFileObserverData) => {
                    if (data.observerType == 'UPLOAD-PROGRESS') {
                        return;
                    }

                    this._progressSubject.next({
                        type: 'FILE-UPLOAD-FINISHED',
                        mediaItem,
                        extra: data
                    });

                    this.manageQues(data);
                    this.uploadNext();
                    mediaItem.progressObserverHandle.unsubscribe();
                });
            }
            return true;
        }

        if (!this.progressQue.length) {
            this.uploadFinished();
        }
    }

    /**
     * Updates failed, successful, progress and finished Ques.
     * @param data Data passed from success and error from mediaFile upload
     */
    manageQues(data: MediaFileObserverData) {
        if (data.isError) {
            if (this.failedQue.indexOf(data.mediaFileId) == -1) {
                this.failedQue.push(data.mediaFileId);
            }
        } else {
            if (this.successfulQue.indexOf(data.mediaFileId) == -1) {
                this.successfulQue.push(data.mediaFileId);
            }
        }

        let index: number = this.progressQue.indexOf(data.mediaFileId);
        if (index != -1) {
            this.progressQue.splice(index, 1);
        }

        if (this.finishedQue.indexOf(data.mediaFileId) == -1) {
            this.finishedQue.push(data.mediaFileId);
        }
    }

    /**
     * Manages pendingQue
     * @param mediaFileId MediaFile.id, optional. If passed only that id is removed from the pending que.
     */
    updatePendingQue(mediaFileId?: string): boolean | void {
        if (mediaFileId) {
            let index: number = this.pendingQue.indexOf(mediaFileId);
            if (index != -1) {
                this.pendingQue.splice(index, 1);
            }
            return true;
        }

        this.pendingQue = [];
        for (let i = 0; i < this.mediaItems.length; i++) {
            this.pendingQue.push(this.mediaItems[i].id);
        }
    }

    /**
     * Updates the observer indicating all files have finished uploading.
     */
    uploadFinished() {
        this.isUploadInProgress = false;

        this._progressSubject.next({
            type: 'UPLOAD-FINISHED',
            uploadFinished: true,
            failedFileCount: this.failedQue.length,
            successfulFileCount: this.successfulQue.length
        });
    }
}

/**
 * Interfcae which handles all the file upload process
 */
export interface MediaUpload {
    mediaItems: MediaFile[]; // list of files which are added by user.
    instanceId: string; // in-case in future we want multiple instances of the mediaUPload, than this will identify mediaUpload instance uniquely
    isActive: boolean; // defines if MediaUpload is created and is active
    isUploadInProgress: boolean; // true indicates upload is in progress.
    isUploadPaused: boolean;
    progressObserver: Observable<any>; // overall file upload progress observer
    pendingQue: string[]; // array of mediaFileIDs which have not started yet
    progressQue: string[]; // array of mediaFileIDs which are currently in progress
    finishedQue: string[]; // array of mediaFileIDs which have finished upload. contains both successful upload and failed upload
    failedQue: string[]; // array of mediaFileIDs which have failed to upload.
    successfulQue: string[]; // array of mediaFileIDs which got uploaded successfully.
    initTime: number;  // time when the object was created. Helpful to get fileOrigin
    getFailedMediaItems(): MediaFile[];
    getSuccessfulMediaItems(): MediaFile[];
    startUpload(): Observable<any> | void;
    pauseUpload(): boolean | void;
    resumeUpload(): boolean | void;
    addMedia(file: File): string;
    removeMedia(fileId: string): boolean | void;
    uploadNext(): boolean | void;
    uploadFinished(): boolean | void;
    updatePendingQue(mediaFileId?: string): boolean | void; // sets mediaIds into pending ques. If mediaId is passed than that id is removed from the pendingQue
    manageQues(data: MediaFileObserverData): boolean | void;
}