import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MAX_FILES_PER_UPLOAD, UploadTrackerService } from
  '../../../../ugc-shared/upload-tracker/upload-tracker.service';

@Component({
  selector: 'media-adder',
  templateUrl: './media-adder.component.html',
  styleUrls: ['./media-adder.component.scss', './media-adder.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MediaAdderComponent {
  public get filesList(): File[] {
    return this._uploadFilesTracker.filesList;
  }

  public get maxMediaCount(): number {
    return MAX_FILES_PER_UPLOAD;
  }

  constructor(
    private _uploadFilesTracker: UploadTrackerService,
    private _changeDetector: ChangeDetectorRef
  ) {}

  public fileSelected(file: File) {
    this._uploadFilesTracker.addFile(file);
    this._changeDetector.detectChanges();
  }

  public removeFile(file: File) {
    this._uploadFilesTracker.removeFile(file);
    this._changeDetector.detectChanges();
  }
}
