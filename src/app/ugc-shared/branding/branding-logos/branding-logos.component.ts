import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UgcCustomizationService } from '../../http/customization/customization.service';
import { BURST_LOGO, Logo } from '../../http/customization/customization.factory';
import { DisplayLogoType } from '../../display/logo/logo.component';
import { BurstLogService } from '../../../core/services/logging/log.service';

@Component({
  selector: 'ugc-branding-logos',
  templateUrl: './branding-logos.component.html',
  styleUrls: ['./branding-logos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Component for displaying logos on the landing page
 * Pulls the logos from the c11n file.
 * It references the landing configuration for the primary and sponsor logo types.
 * Secondary logo is only shown if the primary logo is not burst.
 * Forces the logo to appear circular
 *
 * The possible configurations are:
 *  - account logo - show only the logo image for the account if it is given
 *  - account logo, sponsor logo - show the logo image for the account as well as the ad sponsor logo along side it
 *  - burst logo - default fall back if the above are not given
 */
export class BrandingLogosComponent {
  /**
   * The Logo object to display as the bigger logo
   * If none given, will not display
   */
  public primaryLogo: Logo;

  /**
   * The Logo object to display as the smaller logo, when displaying will overlap with the primaryLogo slightly
   * If none give, will not display
   */
  public sponsorLogo: Logo;

  /**
   * The burst logo, used as a fallback for the primary logo in case it did not successfully load
   *
   * @return {Logo}
   */
  public get burstLogo(): Logo {
    return BURST_LOGO;
  }

  constructor(
    private _customizationService: UgcCustomizationService,
    private _log: BurstLogService
  ) {
    this.setLogos();
  }

  /**
   * Triggered by the primary logo image when it encounters an error loading the image
   * Log the error for records in case it needs to be acted upon
   */
  public primaryLogoError(logoType: DisplayLogoType): void {
    if (logoType === 'DISPLAY') {
      this._log.error({
        error: 'Could not load the primary branding logo',
        logo: this.primaryLogo
      });
    } else if (logoType === 'FALLBACK') {
      this._log.error({
        error: 'Could not load the burst fallback logo in place of the primary branding logo',
        logo: this.burstLogo
      });
    }
  }

  /**
   * Triggered by the sponsor logo image when it encounters an error loading the image
   * Log the error for records in case it needs to be acted upon
   */
  public sponsorLogoError(logoType: DisplayLogoType): void {
    if (logoType === 'DISPLAY') {
      this._log.error({
        error: 'Could not load the sponsor branding logo',
        logo: this.primaryLogo
      });
    }
  }

  private setLogos(): void {
    let primaryKey: string = this._customizationService.ugcC11n.branding.primaryLogo;
    let sponsorKey: string = this._customizationService.ugcC11n.branding.sponsorLogo;
    this.primaryLogo = this._customizationService.ugcC11n.branding.logos.getLogo(primaryKey);
    this.sponsorLogo = this._customizationService.ugcC11n.branding.logos.getLogo(sponsorKey);
  }
}
