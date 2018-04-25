import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { BURST_LOGO, Logo } from '../../../http/customization/customization.factory';
import { UgcCustomizationService } from '../../../http/customization/customization.service';

@Component({
  selector: 'mobile-header',
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileHeaderComponent {
  @Input()
  public displayType: MobileHeaderDisplayType;

  @Input()
  public pageTitle: string;

  @Input()
  public disableBackgroundPattern: boolean;

  public get backgroundPatternEnabled(): boolean {
    return this._backgroundPatternEnabled && !this.disableBackgroundPattern;
  }

  public get pageLogo(): Logo {
    return this._pageLogo;
  }

  public get burstLogo(): Logo {
    return BURST_LOGO;
  }

  public get closeEnabled(): boolean {
    return !!this._returnUrl;
  }

  private _pageLogo: Logo;
  private _backgroundPatternEnabled: boolean;
  private _returnUrl: string;

  constructor(
    private _customizationService: UgcCustomizationService,
    private _location: Location
  ) {
    let primaryLogoKey: string = this._customizationService.ugcC11n.branding.primaryLogo;
    this._pageLogo = this._customizationService.ugcC11n.branding.logos.getLogo(primaryLogoKey);
    this._backgroundPatternEnabled = this._customizationService.ugcC11n.theme.enableMobileBackgroundPattern;
    this._returnUrl = this._customizationService.ugcC11n.returnUrl;
  }

  public mobileBackClick(): void {
    this._location.back();
  }

  public mobileCloseClick(): void {
    if (!this.closeEnabled) {
      return;
    }

    window.location.href = this._returnUrl;
  }
}

export type MobileHeaderDisplayType = 'PAGE_TITLE' | 'PROJECTED_LARGE' | 'PROJECTED_XLARGE';
