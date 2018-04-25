import { Injectable } from '@angular/core';

import { StaticUtils } from '../../static-utils';
import { Observable, Subject } from 'rxjs';

import { LoggingService } from '../../../core/services/logging/logging.service';
import { MediaUploadService } from '../media-upload/media-upload.service';
import { MediaFile, FileLogData, MediaFileObserverData } from '../media-upload/file/file.service';
import { PlatformHttpService } from '../platform-http.service';
import { ConfigService } from '../../..//core/services/config/config.service';
import { window } from 'rxjs/operator/window';

const uuidv4 = require('uuid/v4');

@Injectable()
export class UgcErrorReportService {

    private _subHandle: boolean;

    private _uuid: string;

    private _reportLogs: UgcErrorReport[];

    constructor(
        private _platformHttpService: PlatformHttpService,
        private _loggingService: LoggingService,
        private _mediaUploadService: MediaUploadService,
        private _configService: ConfigService
    ) {

    }

    public captureFileLogs() {
        if (this._subHandle) {
            return;
        }

        this.captureMediaUploadLogs();

        this._subHandle = true;

        this._mediaUploadService.mediaUpload.mediaItems.forEach((mediaItem, index) => {
            mediaItem.loggingObserver.subscribe((data: any) => {
                let report: UgcErrorReport = this.generateErrorReport(data);

                this._reportLogs.push(report);

                this._loggingService.info(data);
            });
        });
    }

    private captureMediaUploadLogs() {
        this._mediaUploadService.mediaUpload.progressObserver.subscribe((data: MediaUploadProcessObserver) => {
            switch (data.type) {
                case 'UPLOAD-PROCESS-STARTED':  // Only 1 UUID for all files in one session
                    this.generateUuId();
                    break;
                case 'FILE-UPLOAD-STARTED':
                    this.sendAutoLog({
                        logType: 'AUTO-LOG-START'
                    });
                    break;
                case 'FILE-UPLOAD-FINISHED':
                    if (data.extra.observerType == 'UPLOAD-SUCCESS') {
                        this.sendAutoLog({
                            logType: 'AUTO-LOG-SUCCESS'
                        });
                    } else {
                        this.sendAutoLog({
                            logType: 'AUTO-LOG-ERROR'
                        });
                    }
                    break;
            }
        });
    }

    public sendAutoLog(data: AutoLogType) {
        let report: UgcErrorReport = this.generateErrorReport(data);

        if (data.logType == 'AUTO-LOG-ERROR') {
            report.extras.push({
                type: 'FILE-UPLOAD-FAILED'
            });
        }
        if (data.logType == 'AUTO-LOG-SUCCESS') {
            report.extras.push({
                type: 'FILE-UPLOAD-SUCCESS'
            });
        }
        if (data.logType == 'AUTO-LOG-START') {
            report.extras.push({
                type: 'FILE-UPLOAD-STARTED'
            });
        }

        this.sendLogs(report);
    }

    public sendLogs(log?: UgcErrorReport) {
        this._platformHttpService
            .post(this._loggingService.settings.url, log || this._reportLogs)
            .subscribe(() => {
                this._loggingService.info('error report sent with uuid: ' + this._uuid);
            }, (error) => {
                this._loggingService.error(error);
            });
    }

    public generateUuId(): string {
        this._reportLogs = [];
        this._uuid = uuidv4();
        return this._uuid;
    }

    private generateErrorReport(data: any) {
        let report: UgcErrorReport = <UgcErrorReport> data;
        report.logId = this._uuid;
        report.userAgent = navigator.userAgent;
        report.url = location.href;
        report.referrer = document.referrer;
        report.isOnline = navigator.onLine;
        report.extras = report.extras || [];

        return report;
    }
}

export interface AutoLogType {
    logType: 'AUTO-LOG-START' | 'AUTO-LOG-SUCCESS' | 'AUTO-LOG-ERROR';
    data?: any;
}

export interface MediaUploadProcessObserver {
    type: 'UPLOAD-PROCESS-STARTED' | 'FILE-UPLOAD-STARTED' | 'FILE-UPLOAD-FINISHED';
    mediaItem?: MediaFile;
    extra?: MediaFileObserverData;
}

export interface UgcErrorReport {
    'logId': string;
    'userAgent': string;
    'url': string;
    'referrer': string;
    'uploadStarted': boolean | null;
    'userAbortedUpload': boolean | null;
    'inProgress': boolean | null;
    'uploadEnded': boolean | null;
    'uploadSuccess': boolean | null;
    'amzCfId': string;
    'serverDt': string;
    'tmStarted': number;
    'tmStartedDateTime': string;
    'tmEnded': number;
    'tmEndedDateTime': string;
    'tmElapsed': number;
    'tmEstRemaining': string;
    'avgChunkUploadSpeedMs': string;
    'avgFullFileUploadSpeed': string;
    'avgGfApiSpeed': string;
    'connectionType': string;
    'isChunckUpload': boolean;
    'isFullFileUpload': boolean;
    'totalChunks': number;
    'totalChunksCompleted': number;
    'uploadId': string;
    'mediaFileId': string;
    'mediaId': string;
    'fileSize': number;
    'isParallelUpload': boolean;
    'parallelThreads': number;
    'fileOrigin': string;
    'jsErrors': any[];
    'retriedPartsInfo': any[];
    'partsInfo': any[];
    'apiInfo': any[];
    'extras': any[];
    'buildVersion': string;
    'isWebView': boolean;
    'mobileOs': string;
    'pageFocus': Array<{ type: 'active' | 'inactive', dateTime: number }>;
    'bubbleId': string;
    'userEmail': string;
    'pageLoadDateTime': number;
    'fullFileStTm': number;
    'fullFileEndTm': number;
    'hasUploadInit': boolean;
    'isOnline': boolean;
}
