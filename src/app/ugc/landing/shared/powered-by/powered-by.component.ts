import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'powered-by',
  templateUrl: './powered-by.component.html',
  styleUrls: ['./powered-by.component.scss', './powered-by.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Component for displaying the powered by burst text and logo.
 * Pulls the powered by text from the c11n locales.
 * References the poweredByText field.
 * The icon image for the burst logo is kept in the same folder as part of this component and referenced through sass
 */
export class PoweredByComponent {
  public poweredByText: string;
  public poweredByLink: string;

  constructor(
    private _customizationService: UgcCustomizationService
  ) {
    this.setText();
    this.setLinks();
  }

  private setText(): void {
    this.poweredByText = this._customizationService.locales.current().poweredByText;
  }

  private setLinks(): void {
    this.poweredByLink = window.location.origin;
  }
}
