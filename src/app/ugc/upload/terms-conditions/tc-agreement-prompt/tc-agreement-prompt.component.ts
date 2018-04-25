import { Component, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';

@Component({
    selector: 'tc-agreement-prompt',
    templateUrl: './tc-agreement-prompt.component.html',
    styleUrls: ['./tc-agreement-prompt.component.scss', './tc-agreement-prompt.component.theme.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TcAgreementTextPromptComponent {
  public termsAndConditionAgreementText: string;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
      this.setText();
  }

  public setText() {
    this.termsAndConditionAgreementText = this._customizationService.locales.current().termsAndConditionAgreementText;
  }
}
