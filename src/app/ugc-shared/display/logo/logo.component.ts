import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Logo } from '../../http/customization/customization.factory';

@Component({
  selector: 'display-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Component for displaying a singular logo from the input
 * If a clickThroughUrl is supplied for the logo, will wrap the image in an anchor for opening in a new page
 * If the image for the logo results in an error, will fall back to the fall back logo
 */
export class DisplayLogoComponent {
  @Output()
  public onLoadError: EventEmitter<DisplayLogoType> = new EventEmitter();

  /**
   * The logo object to display as an image and possibly an anchor for a clickable image
   */
  @Input()
  public set displayLogo(value: Logo) {
    this._displayLogo = value;
    this._displayLogoError = false;
  }

  /**
   * The fallback logo object to use if the logo.imageUrl results in an error
   */
  @Input()
  public set fallbackLogo(value: Logo) {
    this._fallbackLogo = value;
    this._fallbackLogoError = false;
  }

  /**
   * Getter for the logo, used by the html view
   *
   * @return {Logo}
   */
  public get logo(): Logo {
    if (!this._displayLogoError && this._displayLogo) {
      return this._displayLogo;
    }

    if (!this._fallbackLogoError && this._fallbackLogo) {
      return this._fallbackLogo;
    }

    return null;
  }

  private _displayLogo: Logo;
  private _fallbackLogo: Logo;
  private _displayLogoError: boolean;
  private _fallbackLogoError: boolean;

  constructor(
    private _changeDetector: ChangeDetectorRef
  ) {}

  /**
   * Triggered by the image for the logo being shown
   * Go through fallback logic for trying to get an image to display
   * Log the error as well
   */
  public logoError(): void {
    if (!this._displayLogoError && this._displayLogo) {
      this._displayLogoError = true;
      this.onLoadError.next('DISPLAY');
    } else if (!this._fallbackLogoError && this._fallbackLogo) {
      this._fallbackLogoError = true;
      this.onLoadError.next('FALLBACK');
    }

    this._changeDetector.detectChanges();
  }
}

export type DisplayLogoType = 'DISPLAY' | 'FALLBACK';
