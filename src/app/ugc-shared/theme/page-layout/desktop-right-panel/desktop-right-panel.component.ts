import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UgcCustomizationService } from '../../../http/customization/customization.service';

@Component({
  selector: 'desktop-right-panel',
  templateUrl: './desktop-right-panel.component.html',
  styleUrls: ['./desktop-right-panel.component.scss', './desktop-right-panel.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopRightPanelComponent {
  public get backgroundPatternEnabled(): boolean {
    return this._backgroundPatternEnabled;
  }

  public get backgroundIconsEnabled(): boolean {
    return this._backgroundIconsEnabled;
  }

  private _backgroundPatternEnabled: boolean;
  private _backgroundIconsEnabled: boolean;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this._backgroundPatternEnabled = this._customizationService.ugcC11n.theme.enableDesktopBackgroundPattern;
    this._backgroundIconsEnabled = this._customizationService.ugcC11n.theme.enableDesktopIconBackgrounds;
  }
}
