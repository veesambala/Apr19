import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';

@Component({
    selector: 'success-prompt',
    templateUrl: './success-prompt.component.html',
    styleUrls: ['./success-prompt.component.scss', './success-prompt.component.theme.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessPromptComponent {
  public successPrompt: string;
  constructor(
    private _customizationService: UgcCustomizationService
  ) {
      this.setText();
  }

  public setText() {
    this.successPrompt = this._customizationService.locales.current().successTextPrompt;
    }
}
