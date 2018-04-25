import { Component } from '@angular/core';
import { StepsNavButtonsService } from '../core/steps-nav-buttons/steps-nav-buttons.service';
import { UgcCustomizationService } from '../../../ugc-shared/http/customization/customization.service';
import { UploadTrackerService } from '../../../ugc-shared/upload-tracker/upload-tracker.service';

@Component({
  selector: 'upload-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss', './progress.component.theme.scss']
})
export class ProgressComponent {
  public get filesList(): File[] {
    return this._uploadFilesTracker.filesList;
  }
  public cancelText: string;
  public pageTitle: string;

  constructor(
    private _buttonsService: StepsNavButtonsService,
    private _customizationService: UgcCustomizationService,
    private _uploadFilesTracker: UploadTrackerService
  ) {
    this.setText();
  }

  private setText() {
    this._buttonsService.primaryButtonState = 'NONE';
    this._buttonsService.primaryButtonText = this._customizationService.locales.current().nextText;
    this.pageTitle = this._customizationService.c11nJson.locales.current().formPageTitle;
    this.cancelText = this._customizationService.c11nJson.locales.current().cancelText;
  }

}
