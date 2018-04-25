import { Component, ChangeDetectionStrategy, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';
import { UgcCustomizationService } from
  '../../../../ugc-shared/http/customization/customization.service';
import { UploadTrackerService } from '../../../../ugc-shared/upload-tracker/upload-tracker.service';
import {
  FormMaterialInputComponent,
  InputValidator,
  ValueEvent
} from '../../../../ugc-shared/form/material-input/material-input.component';
import { StepsNavButtonsService } from '../../core/steps-nav-buttons/steps-nav-buttons.service';
import { FormField } from '../../../../ugc-shared/http/customization/customization.factory';
import { BurstLogService } from '../../../../core/services/logging/log.service';


@Component({
  selector: 'user-info-form',
  templateUrl: './user-info-form.component.html',
  styleUrls: ['./user-info-form.component.scss', './user-info-form.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInfoFormComponent {
  @Output()
  public ButtonStateEmitter: EventEmitter<boolean> = new EventEmitter();
  @ViewChildren(FormMaterialInputComponent)
  public set inputComponents(components: QueryList<FormMaterialInputComponent>) {
    this._inputComponents = components;
    this.checkValid();
  }

  public get formFields(): UserInfoFormField[] {
    return this._formFields;
  }

  public get requiredText(): string {
    return this._requiredText;
  }

  private _formFields: UserInfoFormField[];
  private _requiredText: string;
  private _inputComponents: QueryList<FormMaterialInputComponent>;

  constructor(
    private _customizationService: UgcCustomizationService,
    private _uploadTrackerService: UploadTrackerService,
    private _stepsNavButtonsService: StepsNavButtonsService,
    private _log: BurstLogService
  ) {
    this.setFields();
    this._requiredText = this._customizationService.locales.current().requiredText;
    this._stepsNavButtonsService.primaryButtonState = 'DISABLED';
  }

  public formValidator(validationRegex: string, validationError: string): InputValidator {
    if (!validationRegex) {
      return;
    }

    let regEx: RegExp;

    try {
      regEx = new RegExp(validationRegex);
    } catch (error) {
      this._log.error(`UserInfoFormComponent: could not parse regex given of ${validationRegex}`);

      return;
    }

    return (value: string): string => {
      if (!regEx.test(value)) {
        return validationError;
      }
    };
  }

  public fieldChanged(field: string, value: ValueEvent): void {
    this._uploadTrackerService.setUsersInfoField(field, value.value);
    this.checkValid();
  }

  public fieldSubmitted(fieldIndex: number, field: string, value: ValueEvent): void {

  }

  private setFields(): void {
    let formFields = this._customizationService.locales.current().formFields;
    this._formFields = [];

    Object.keys(formFields).forEach((formKey: string) => {
      this._formFields.push({
        key: formKey,
        value: formFields[formKey],
        startingInputValue: this._uploadTrackerService.getUsersInfoField(formKey)
      });
    });
  }

  private checkValid(): void {
    if (!this._inputComponents) {
      this._stepsNavButtonsService.primaryButtonState = 'DISABLED';

      return;
    }

    let valid: boolean = true;

    this._inputComponents.forEach((component: FormMaterialInputComponent) => {
      if (!component.valid) {
        valid = false;
      }
    });
    if (this._customizationService.locales.current().termsConditionsType === 'CHECKBOX') {
      if (valid) {
        this.ButtonStateEmitter.next(true);
      }
    } else {
      this._stepsNavButtonsService.primaryButtonState = valid ? 'ENABLED' : 'DISABLED';
    }
  }
}

export interface UserInfoFormField {
  key: string;
  value: FormField;
  startingInputValue: string;
}
