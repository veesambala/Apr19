import { Component } from '@angular/core';
import { StepsNavButtonsService } from '../core/steps-nav-buttons/steps-nav-buttons.service';
import { UgcCustomizationService } from '../../../ugc-shared/http/customization/customization.service';
import { UgcErrorReportService } from '../../../ugc-shared/http/error-report/ugc-error-report.service';

@Component({
  selector: 'terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.scss', './terms-conditions.component.theme.scss']
})
export class TermsAndConditionComponent {
  public backText: string;
  public termsAndConditionAgreementText: string;
  public termsAndConditionText: string;
  public tcAgreePrompt: string;
  public checkboxPrompt: boolean = true;
  public textPrompt: boolean;

  constructor(
    private _buttonsService: StepsNavButtonsService,
    private _customizationService: UgcCustomizationService,
    private _ugcErrorReportService: UgcErrorReportService
  ) {
    this._buttonsService.primaryButtonState = 'DISABLED';
    this.setNextButtonState();
    this.setPromptType();
    this.tcAgreePrompt = this._customizationService.locales.current().termsAndConditionAgreePrompt;
    this.termsAndConditionAgreementText = this._customizationService.locales.current().termsAndConditionsAutoAcceptText;
    console.log(this.termsAndConditionAgreementText);
  }

  public setPromptType() {
    let prompt: string;
    prompt = this._customizationService.locales.current().termsConditionsType;
    if (prompt === 'LINK') {
      this.checkboxPrompt = false;
      this.textPrompt = true;
      this._buttonsService.primaryButtonState = 'ENABLED';
    }

  }
  public valueChanged(value: boolean) {
    console.log(value);
    if (value) {
      this._buttonsService.primaryButtonState = 'ENABLED';
    }
  }
  private setNextButtonState() {
    this._buttonsService.primaryButtonText = this._customizationService.locales.current().uploadText;
  }
}
