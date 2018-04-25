import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { BurstLogService } from '../../core/services/logging/log.service';
import { UgcCustomizationService } from '../http/customization/customization.service';

export const MAX_FILES_PER_UPLOAD: number = 5;
export const MAX_VIDEOS_PER_UPLOAD: number = 1;

export const SUPPORTED_IMAGE_FORMATS =
  ['tif', 'jpeg', 'tiff', 'bmp', 'ico', 'png', 'pix', 'pict', 'jpg', 'svg', 'nef', 'dng', 'cr2'];
export const SUPPORTED_VIDEO_FORMATS =
  ['mts', '3gpp', 'mpg', 'ts', 'gif', 'mpe', 'tp', 'ogv', 'ogm', '3gp', 'pcx', 'x3f', 'webm', 'ogg', 'avi', 'arw',
    'mpeg', 'divx', 'wmv', 'mod', 'mkv', 'nsv', 'mov', 'dat', 'asf', 'exr', 'm4v', 'flv', 'xcf', 'flac', '3ivx',
    'tod', 'dv', '3vx', 'mp4', 'vob', 'orf', '3g2', 'asx', 'mpeg4', 'mrw', 'mxf', 'dvx', 'tga', 'qt', 'f4v',
    'mat', 'crw', 'dcr', 'm2ts'];

@Injectable()
export class UploadTrackerService {
  public get onFilesChanged(): Observable<any> {
    return this._onFilesChanged;
  }

  public get onFileAddError(): Observable<FileError> {
    return this._onFileAddError;
  }

  public get onFilesTitleChanged(): Observable<string> {
    return this._onFilesTitleChanged;
  }

  public get onUsersInfoChanged(): Observable<{}> {
    return this._usersInfoChanged;
  }

  public get filesList(): File[] {
    return this._filesList;
  }

  public get maxFiles(): boolean {
    return this._filesList.length >= MAX_FILES_PER_UPLOAD;
  }

  public get videoFilesCount(): number {
    let count: number = 0;

    this._filesList.forEach((file: File) => {
      if (isSupportedVideoFile(file)) {
        count++;
      }
    });

    return count;
  }

  public get imageFilesCount(): number {
    let count: number = 0;

    this._filesList.forEach((file: File) => {
      if (isSupportedImageFile(file)) {
        count++;
      }
    });

    return count;
  }

  public get filesTitle(): string {
    return this._filesTitle;
  }

  public set filesTitle(val: string) {
    this._log.debug(`UploadTrackerService: Setting files title to ${val}`);
    this._filesTitle = val;
    this._onFilesTitleChangedEvent.next(val);
  }

  public get usersInfo(): {} {
    return this._usersInfo;
  }

  private _onFilesChangedEvent: Subject<any> = new Subject();
  private _onFilesChanged: Observable<any> = this._onFilesChangedEvent.asObservable();
  private _onFileAddErrorEvent: Subject<FileError> = new Subject();
  private _onFileAddError: Observable<FileError> = this._onFileAddErrorEvent.asObservable();
  private _onFilesTitleChangedEvent: Subject<string> = new Subject();
  private _onFilesTitleChanged: Observable<string> = this._onFilesTitleChangedEvent.asObservable();
  private _usersInfoChangedEvent: Subject<{}> = new Subject();
  private _usersInfoChanged: Observable<{}> = this._usersInfoChangedEvent.asObservable();

  private _filesList: File[];
  private _filesTitle: string;
  private _usersInfo: {};

  constructor(
    private _log: BurstLogService,
    private _customizationService: UgcCustomizationService
  ) {
    this.clear();
  }

  public clear(): void {
    this._log.debug('UploadTrackerService: Clearing out files in files list');
    this._filesList = [];
    this._filesTitle = '';
    this._usersInfo = {};
  }

  public addFile(addFile: File): boolean {
    this._log.debug(`UploadTrackerService: Adding file to files list: ${addFile.name}`);

    if (!addFile) {
      this._log.error('UploadTrackerService: Rejecting empty file from user');
      this.setFileUploadError('EMPTY', addFile);

      return false;
    }

    if (this.fileExists(addFile)) {
      this._log.info(`UploadTrackerService: Rejecting file from user as duplicate: ${addFile.name}`);
      this.setFileUploadError('DUPLICATE', addFile);

      return false;
    }

    if (this.maxFiles) {
      this._log.info(`UploadTrackerService: Rejecting file from user, max files reached: ${addFile.name}`);
      this.setFileUploadError('MAXIMUM_REACHED', addFile);

      return false;
    }

    if (!isSupportedImageFile(addFile) && !isSupportedVideoFile(addFile)) {
      this._log.info(`UploadTrackerService: Rejecting file from user, unsupported file type: ${addFile.name}`);
      this.setFileUploadError('UNSUPPORTED_FILE_TYPE', addFile);

      return false;
    }

    if (this.videoFilesCount >= MAX_VIDEOS_PER_UPLOAD && isSupportedVideoFile(addFile)) {
      this._log.info(`UploadTrackerService: Rejecting file from user, max video files reached: ${addFile.name}`);
      this.setFileUploadError('MAXIMUM_VIDEOS_REACHED', addFile);

      return false;
    }

    this._filesList.push(addFile);
    this._onFilesChangedEvent.next();

    return true;
  }

  public removeFile(removeFile: File): void {
    this._log.debug(`UploadTrackerService: Removing file from files list: ${removeFile.name}`);
    let index: number = this._filesList.indexOf(removeFile);
    this._filesList.splice(index, 1);
    this._onFilesChangedEvent.next();
  }

  public getUsersInfoField(field: string): string {
    if (!(field in this._usersInfo)) {
      return '';
    }

    return this._usersInfo[field];
  }

  public setUsersInfoField(field: string, value: string): void {
    this._log.debug(`UploadTrackerService: Setting users info field ${field} to ${value}`);
    this._usersInfo[field] = value;
  }

  private fileExists(file: File): boolean {
    for (let index: number = 0; index < this._filesList.length; index++) {
      if (this._filesList[index].name === file.name) {
        return true;
      }
    }

    return false;
  }

  private setFileUploadError(errorType: FileAddErrors, addFile: File ): void {
    let fileName: string = getFileName(addFile);
    let message = this._customizationService.locales.current().emptyMediaError;

    if (errorType === 'MAXIMUM_REACHED') {
      message = this._customizationService.locales.current().maxMediaError
        .replace('__MAX__', MAX_FILES_PER_UPLOAD.toString());
    } else if (errorType === 'MAXIMUM_VIDEOS_REACHED') {
      message = this._customizationService.locales.current().maxVideosError
        .replace('__MAX_VIDEOS__', MAX_VIDEOS_PER_UPLOAD.toString());
    } else if (errorType === 'DUPLICATE') {
      message = this._customizationService.locales.current().duplicateMediaError;
    } else if (errorType === 'UNSUPPORTED_FILE_TYPE') {
      message = this._customizationService.locales.current().unsupportedMediaError;
    }

    message = message.replace('__NAME__', fileName);
    let error: FileError = {
      error: errorType,
      errorMessage: message,
      file: addFile
    };
    this._onFileAddErrorEvent.next(error);
  }
}

export function getFileName(file: File): string {
  return file && file.name ? file.name : '';
}

export function getFileExtension(file: File): string {
  let name: string = getFileName(file);

  return name.split('.').pop().toLowerCase();
}

export function isSupportedVideoFile(file: File): boolean {
  let extension: string = getFileExtension(file);

  return SUPPORTED_VIDEO_FORMATS.indexOf(extension) > -1;
}

export function isSupportedImageFile(file: File): boolean {
  let extension: string = getFileExtension(file);

  return SUPPORTED_IMAGE_FORMATS.indexOf(extension) > -1;
}

export interface FileError {
  error: FileAddErrors;
  errorMessage: string;
  file: File;
}

export type FileAddErrors = 'EMPTY' | 'DUPLICATE' | 'MAXIMUM_REACHED' |
  'MAXIMUM_VIDEOS_REACHED' | 'UNSUPPORTED_FILE_TYPE';
