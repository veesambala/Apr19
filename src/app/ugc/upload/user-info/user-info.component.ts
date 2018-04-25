import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { StepsNavButtonsService, ButtonState } from '../core/steps-nav-buttons/steps-nav-buttons.service';
import { UgcCustomizationService } from '../../../ugc-shared/http/customization/customization.service';

@Component({
  selector: 'user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss', './user-info.component.theme.scss']
})
export class UserInfoComponent implements OnInit, OnDestroy {
  public get dynamicLink(): DynamicLink {
    return this._dynamicLink;
  }
  public acceptenceText: string;
  public termsConditionsType: string;
  public validForm: boolean;
  public termsConditionsAccepted: boolean;
  public manualAcceptanceText: string;
  public stringManipulation: number;
  public anchoredAcceptanceText: string;
  private _buttonStateChangeSubscription: Subscription;
  private primaryDisabledButtonState: boolean;
  private _dynamicLink: DynamicLink;

  constructor(
    private _buttonsService: StepsNavButtonsService,
    private _customizationService: UgcCustomizationService,
    private _router: Router,
    private _changeDetector: ChangeDetectorRef
  ) { }

  public ngOnInit() {
    this.acceptenceText = this._customizationService.locales.current().termsAndConditionsManualAcceptText;
    this.termsConditionsType = this._customizationService.locales.current().termsConditionsType;
    this.anchoredAcceptanceText = this._customizationService.locales.current().termsAndConditionsPageTitle;
    this._dynamicLink = {
      text: this.anchoredAcceptanceText,
      navigationLink: '/ugc/upload/terms-conditions'
    };
    this.setNextButtonState();

    this._buttonStateChangeSubscription = this._buttonsService.onPrimaryButtonStateChange.subscribe(
      (state: ButtonState) => {
        this.primaryDisabledButtonState = state === 'DISABLED' ? true : false;
        this._changeDetector.detectChanges();
      }
    );

  }

  public ngOnDestroy(): void {
    if (this._buttonStateChangeSubscription) {
      this._buttonStateChangeSubscription.unsubscribe();
      this._buttonStateChangeSubscription = null;
    }
  }

  public valueChanged(value: boolean) {
    if (value) {
      this.termsConditionsAccepted = true;
    }
    if (this.validForm && this.termsConditionsAccepted) {
      this._buttonsService.primaryButtonState = 'ENABLED';
    }
  }
  public setButtonState(value: boolean) {
    if (value) {
      this.validForm = true;
    }
  }
  public enabledlink(value: boolean) {
    console.log('need to implement link further');
  }
  public navigateToTcPage(): void {
    this._router.navigate(['/ugc/upload/terms-conditions'], { queryParamsHandling: 'merge' });
  }
  private setNextButtonState() {
    if (this._customizationService.locales.current().termsConditionsType !== 'PAGE') {
      this._buttonsService.primaryButtonText = this._customizationService.locales.current().uploadText;
    } else {
      this._buttonsService.primaryButtonText = this._customizationService.locales.current().nextText;
    }
  }
}
export interface DynamicLink {
  text: string;
  navigationLink: string;
}
