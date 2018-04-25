import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit,
  Output
} from '@angular/core';
import { Location } from '@angular/common';
import { ButtonState, StepsNavButtonsService } from './steps-nav-buttons.service';
import { Subscription } from 'rxjs/Subscription';
import { UgcCustomizationService } from '../../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'steps-nav-buttons',
  templateUrl: './steps-nav-buttons.component.html',
  styleUrls: ['./steps-nav-buttons.component.scss', 'steps-nav-buttons.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepsNavButtonsComponent implements OnInit, OnDestroy {
  @Output()
  public onPrimaryButtonClicked: EventEmitter<any> = new EventEmitter();

  public get primaryButtonState(): ButtonState {
    return this._primaryButtonState;
  }

  public get primaryButtonText(): string {
    return this._primaryButtonText;
  }

  public get backButtonText(): string {
    return this._backButtonText;
  }

  public get cancelButtonText(): string {
    return this._cancelButtonText;
  }

  private _primaryButtonState: ButtonState;
  private _primaryButtonText: string;
  private _backButtonText: string;
  private _cancelButtonText: string;
  private _returnUrl: string;
  private _buttonStateChangeSubscription: Subscription;
  private _buttonTextChangeSubscription: Subscription;

  constructor(
    private _buttonsService: StepsNavButtonsService,
    private _customizationService: UgcCustomizationService,
    private _location: Location,
    private _changeDetector: ChangeDetectorRef
  ) {
    this._backButtonText = this._customizationService.locales.current().backText;
    this._cancelButtonText = this._customizationService.locales.current().cancelText;
    this._returnUrl = this._customizationService.ugcC11n.returnUrl;
  }

  public ngOnInit(): void {
    this._primaryButtonState = this._buttonsService.primaryButtonState;
    this._primaryButtonText = this._buttonsService.primaryButtonText;
    this._buttonStateChangeSubscription = this._buttonsService.onPrimaryButtonStateChange.subscribe(
      (state: ButtonState) => {
        this._primaryButtonState = state;
        this._changeDetector.detectChanges();
      }
    );
    this._buttonTextChangeSubscription = this._buttonsService.onPrimaryButtonTextChange.subscribe(
      (text: string) => {
        this._primaryButtonText = text;
        this._changeDetector.detectChanges();
      }
    );
  }

  public ngOnDestroy(): void {
    if (this._buttonStateChangeSubscription) {
      this._buttonStateChangeSubscription.unsubscribe();
      this._buttonStateChangeSubscription = null;
    }

    if (this._buttonTextChangeSubscription) {
      this._buttonTextChangeSubscription.unsubscribe();
      this._buttonTextChangeSubscription = null;
    }
  }

  public primaryButtonClick(): void {
    if (this.primaryButtonState !== 'ENABLED') {
      return;
    }

    this.onPrimaryButtonClicked.next();
  }

  public backButtonClick(): void {
    this._location.back();
  }

  public cancelButtonClick(): void {
    if (!this._returnUrl) {
      return;
    }

    window.location.href = this._returnUrl;
  }
}
