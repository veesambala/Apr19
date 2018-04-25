import { Component, OnDestroy, OnInit } from '@angular/core';
import { StepsNavButtonsService } from '../core/steps-nav-buttons/steps-nav-buttons.service';
import { UgcCustomizationService } from '../../../ugc-shared/http/customization/customization.service';
import {
  FileAddErrors, FileError, MAX_FILES_PER_UPLOAD, MAX_VIDEOS_PER_UPLOAD,
  UploadTrackerService
} from '../../../ugc-shared/upload-tracker/upload-tracker.service';
import { Subscription } from 'rxjs/Subscription';
import { ValueEvent } from '../../../ugc-shared/form/material-input/material-input.component';
import { ToasterService } from '../../../ugc-shared/toaster/toaster.service';
@Component({
  selector: 'add-media',
  templateUrl: './add-media.component.html',
  styleUrls: ['./add-media.component.scss', './add-media.component.theme.scss']
})
export class AddMediaComponent implements OnInit, OnDestroy {
  public get filesList(): File[] {
    return this._uploadFilesTracker.filesList;
  }

  public get hasFiles(): boolean {
    return this._uploadFilesTracker.filesList.length > 0;
  }

  public get startingMediaTitle(): string {
    return this._startingMediaTitle;
  }

  public get mediaTitleText(): string {
    return this._mediaTitleText;
  }

  private _trackerSubscription: Subscription;
  private _errorTrackerSubscription: Subscription;
  private _startingMediaTitle: string;
  private _mediaTitleText: string;

  constructor(
    private _uploadFilesTracker: UploadTrackerService,
    private _buttonsService: StepsNavButtonsService,
    private _customizationService: UgcCustomizationService,
    private _toasterService: ToasterService
  ) {
    this._buttonsService.primaryButtonState = 'DISABLED';
    this._buttonsService.primaryButtonText = this._customizationService.locales.current().nextText;
    this._mediaTitleText = this._customizationService.locales.current().mediaTitleText;
  }

  public ngOnInit(): void {
    this._startingMediaTitle = this._uploadFilesTracker.filesTitle;
    this._trackerSubscription = this._uploadFilesTracker.onFilesChanged.subscribe(
      () => {
        this.setMediaSelectionState();
      }
    );
    this._errorTrackerSubscription = this._uploadFilesTracker.onFileAddError.subscribe(
      (error: FileError) => {
        this.setFileUploadError(error);
      }
    );
    this.setMediaSelectionState();
  }

  public ngOnDestroy(): void {
    if (this._trackerSubscription) {
      this._trackerSubscription.unsubscribe();
      this._trackerSubscription = null;
    }

    if (this._errorTrackerSubscription) {
      this._errorTrackerSubscription.unsubscribe();
      this._errorTrackerSubscription = null;
    }
  }

  public mediaTitleChanged(value: ValueEvent): void {
    this._uploadFilesTracker.filesTitle = value.value;
  }

  private setMediaSelectionState(): void {
    this._buttonsService.primaryButtonState = this._uploadFilesTracker.filesList.length > 0 ? 'ENABLED' : 'DISABLED';
  }

  private setFileUploadError(error: FileError): void {
    this._toasterService.toasterStateText = 'SHOW';
    this._toasterService.toasterMessageText =
      error.errorMessage ? error.errorMessage : this._toasterService.toasterMessageText;
  }
}
