import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'share-media',
  templateUrl: './share-media.component.html',
  styleUrls: ['./share-media.component.scss', './share-media.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareMediaComponent {
  public shareMedia: string;
  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this.setText();
  }

  public setText() {
    this.shareMedia = this._customizationService.locales.current().shareMediaPrompt;
  }
}
