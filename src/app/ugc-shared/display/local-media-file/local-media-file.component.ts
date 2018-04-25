import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MediaFile } from '../../http/media-upload/file/file.service';

@Component({
  selector: 'display-local-media-file',
  templateUrl: './local-media-file.component.html',
  styleUrls: ['./local-media-file.component.scss', './local-media-file.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DisplayLocalMediaFileComponent {
  @Output()
  public onClose: EventEmitter<File> = new EventEmitter();

  public get file(): File {
    return this._file;
  }

  @Input()
  public set file(value: File) {
    this._file = value;
    this.setFileDetails();
  }
  public get progressCircleVisible(): boolean {
    return this._isProgressCircleVisible;
  }
  @Input()
  public set progressCircleVisible(isVisible: boolean) {
    this._isProgressCircleVisible = isVisible;
  }

  @Input()
  public allowClose: boolean;

  public get fileType(): DisplayFileType {
    return this._fileType;
  }

  public get fileUrl(): SafeResourceUrl {
    return this._fileUrl;
  }

  public get fileSizeDisplay(): string {
    return this._fileSizeDisplay;
  }

  private _file: File;
  private _fileType: DisplayFileType;
  private _fileUrl: SafeResourceUrl;
  private _fileSizeDisplay: string;
  private _isProgressCircleVisible: boolean = false;

  constructor(
    private _domSanitizer: DomSanitizer
  ) {}

  public closeFile(): void {
    this.onClose.next(this._file);
  }

  private setFileDetails(): void {
    this._fileType = null;
    this._fileUrl = null;
    this._fileSizeDisplay = null;

    if (!this._file) {
      return;
    }

    if (this._file.type.indexOf('image') > -1) {
      this._fileType = 'PHOTO';
    } else if (this._file.type.indexOf('video') > -1) {
      this._fileType = 'VIDEO';
    }

    this._fileUrl = this._domSanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.file));
    let sizes: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let sizeIndex: number = this._file.size > 0 ? Math.floor(Math.log(this._file.size) / Math.log(1024)) : 0;
    let sizeSuffix: string = sizes[sizeIndex];
    let size: number = this._file.size > 0 ? this._file.size / Math.pow(1024, sizeIndex) : 0;
    this._fileSizeDisplay = size.toFixed(2) + ' ' + sizeSuffix;
  }
}

export type DisplayFileType = 'PHOTO' | 'VIDEO';
