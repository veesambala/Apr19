import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MobileHeaderDisplayType } from '../../ugc-shared/theme/page-layout/mobile-header/mobile-header.component';
import { PromptType } from './shared/submission-prompt/submission-prompt.component';
import { Subscription } from 'rxjs/Subscription';
import { Router } from '@angular/router';
import { FileError, UploadTrackerService } from '../../ugc-shared/upload-tracker/upload-tracker.service';
import { ToasterService } from '../../ugc-shared/toaster/toaster.service';
import { BurstLogService } from '../../core/services/logging/log.service';

@Component({
  selector: 'ugc-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class UgcLandingComponent implements OnInit, OnDestroy {
  public get mobileHeaderDisplayType(): MobileHeaderDisplayType {
    if (this._submissionPromptType === 'IMAGE') {
      return 'PROJECTED_XLARGE';
    }

    return 'PROJECTED_LARGE';
  }

  private _submissionPromptType: PromptType = 'TEXT_ONLY';
  private _errorTrackerSubscription: Subscription;

  constructor(
    private _router: Router,
    private _changeDetector: ChangeDetectorRef,
    private _uploadTracker: UploadTrackerService,
    private _toasterService: ToasterService,
    private _log: BurstLogService
  ) { }

  public ngOnInit() {
    this._uploadTracker.clear();
    this._errorTrackerSubscription = this._uploadTracker.onFileAddError.subscribe(
      (error: FileError) => {
        this.setFileUploadError(error);
      }
    );
  }

  public ngOnDestroy(): void {
    if (this._errorTrackerSubscription) {
      this._errorTrackerSubscription.unsubscribe();
      this._errorTrackerSubscription = null;
    }
  }

  /**
   * Method to inform that the upload button has been clicked
   * On click, will set the selected file in upload tracker and route to the ugc/upload screens
   */
  public uploadSelectedFile(file: File) {
    this._log.debug(`LandingComponet: Setting selected file to upload tracker service`);

    if (this._uploadTracker.addFile(file)) {
      // route only if the file was successfully uploaded
      this._router.navigate(['/ugc/upload'], { queryParamsHandling: 'merge'});
    }
  }

  /**
   * Method to inform that the not now button has been clicked
   * On click, will route to the provided url
   *
   * @param {string} url the external resource location to route the window to
   */
  public notNowClicked(url: string) {
    window.location.href = url;
  }

  /**
   * Method to inform when the prompt type has been changed
   * The prompt type corresponds to the submission prompt
   *
   * @param {PromptType} promptType
   */
  public promptTypeSet(promptType: PromptType): void {
    this._submissionPromptType = promptType;
    this._changeDetector.detectChanges();
  }

  private setFileUploadError(error: FileError): void {
    this._toasterService.toasterStateText = 'SHOW';
    this._toasterService.toasterMessageText =
      error.errorMessage ? error.errorMessage : this._toasterService.toasterMessageText;
  }
}
