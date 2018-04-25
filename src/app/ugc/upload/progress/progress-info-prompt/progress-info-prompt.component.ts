import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'progress-info-prompt',
  templateUrl: './progress-info-prompt.component.html',
  styleUrls: ['./progress-info-prompt.component.scss', './progress-info-prompt.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressInfoPromptComponent {
  public ProgressInfoPrompt: string;
  public emailHelper: string;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this.setText();
  }

  public setText() {
    this.ProgressInfoPrompt = this._customizationService.c11nJson.locales.current().progressIssuePrompt
    this.emailHelper = this._customizationService.c11nJson.locales.current().emailHelpPrompt;
  }
}
