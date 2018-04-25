import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';

@Component({
    selector: 'user-info-prompt',
    templateUrl: './user-info-prompt.component.html',
    styleUrls: ['./user-info-prompt.component.scss', './user-info-prompt.component.theme.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoPromptComponent {
  public userInfoPrompt: string;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
      this.setText();
  }

  public setText() {
      this.userInfoPrompt = this._customizationService.locales.current().formPageHeadlineText;
  }
}
