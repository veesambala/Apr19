import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit,
  ViewChild, Output, EventEmitter
} from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { UgcCustomizationService } from '../../ugc-shared/http/customization/customization.service';
import { StepsProgressBarComponent } from './core/steps-progress-bar/steps-progress-bar.component';
import { StaticUtils } from '../../ugc-shared/static-utils';
import { UploadTrackerService } from '../../ugc-shared/upload-tracker/upload-tracker.service';
import { MediaUploadService, MediaUpload } from '../../ugc-shared/http/media-upload/media-upload.service';

@Component({
  selector: 'ugc-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(StepsProgressBarComponent)
  public progressBar: StepsProgressBarComponent;
  @Output()
  public onPrimaryEventTriggered: EventEmitter<any> = new EventEmitter();

  public get pageTitle(): string {
    return this._pageTitle;
  }

  private _pageTitle: string;
  private _progressStepIndex: number;
  private _progressStepCompletionPercentage: number;
  private _nextRoute: string;
  private _routerSubscription: Subscription;

  constructor(
    private _customizationService: UgcCustomizationService,
    private _uploadTracker: UploadTrackerService,
    private _router: Router,
    private _changeDetector: ChangeDetectorRef,
    private _mediaUpload: MediaUploadService,
  ) {}

  public ngOnInit(): void {
    this._routerSubscription = this._router.events.subscribe(
      (event: Event): void => {
        if (event instanceof NavigationEnd) {
          this.pageChanged(event.url);
        }
      }
    );
    this.pageChanged(this._router.url);
  }

  public ngAfterViewInit(): void {
    this.updateProgressBar();
  }

  public ngOnDestroy(): void {
    if (this._routerSubscription) {
      this._routerSubscription.unsubscribe();
      this._routerSubscription = null;
    }
  }

  public primaryButtonClick(): void {
    this.onPrimaryEventTriggered.emit();
    this._router.navigate([this._nextRoute], { queryParamsHandling: 'merge' });
  }

  public setItemsToUploadMediaService() {
    if (this._mediaUpload.mediaUpload && this._mediaUpload.mediaUpload.isActive) {
      this._mediaUpload.resetMediaItems();
    } else {
      this._mediaUpload.createMediaUpload();
    }
    let firstName = this._uploadTracker.usersInfo['name'].substr(0, this._uploadTracker.usersInfo['name'].indexOf(' '));
    let lastName = this._uploadTracker.usersInfo['name'].substr(this._uploadTracker.usersInfo['name'].indexOf(' ') + 1);
    this._mediaUpload.addMedia(this._uploadTracker.filesList);
    this._mediaUpload.updateMediaTitle(this._uploadTracker.filesTitle);
    this._mediaUpload.updateUserInfo(
      this._uploadTracker.usersInfo['email'],
      firstName,
      lastName);
    this._mediaUpload.startUpload();
    console.log('this._uploadTracker.filesList', this._mediaUpload.mediaUpload);
  }

  private pageChanged(url: string): void {
    if (url.indexOf('upload/add-media') > -1) {
      this._pageTitle = this._customizationService.locales.current().addMediaPageTitle;
      this._progressStepIndex = 1;
      this._progressStepCompletionPercentage = 0;
      this._nextRoute = 'ugc/upload/user-info';
    } else if (url.indexOf('upload/user-info') > -1) {
      this._pageTitle = this._customizationService.locales.current().addMediaPageTitle;
      this._progressStepIndex = 2;
      this._progressStepCompletionPercentage = 0;
      this._nextRoute = this._customizationService.locales.current().termsConditionsType === 'PAGE' ?
      '/ugc/upload/terms-conditions' : '/ugc/upload/progress';
    } else if (url.indexOf('upload/terms-conditions') > -1) {
      this._pageTitle = this._customizationService.locales.current().termsAndConditionsPageTitle;
      this._progressStepIndex = 2;
      this._progressStepCompletionPercentage = 50;
      this._nextRoute = '/ugc/upload/progress';
    } else if (url.indexOf('upload/progress') > -1) {
      this._pageTitle = this._customizationService.locales.current().formPageTitle;
      this._progressStepIndex = 2;
      this._progressStepCompletionPercentage = 100;
      this._nextRoute = '/ugc/upload/success';
      this.setItemsToUploadMediaService();
    } else if (url.indexOf('upload/success') > -1) {
      this._pageTitle = '';
      this._progressStepIndex = 0;
      this._progressStepCompletionPercentage = 0;
    }

    this.updateProgressBar();
    this._changeDetector.detectChanges();
  }

  private updateProgressBar(): void {
    if (!this.progressBar) {
      return;
    }
    this.progressBar.updateStepCompletionPercentage(this._progressStepIndex, this._progressStepCompletionPercentage);
  }
}
