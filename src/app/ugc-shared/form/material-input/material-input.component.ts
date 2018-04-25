import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter } from '@angular/core';
import { MediaFile } from '../../http/media-upload/file/file.service';

@Component({
  selector: 'form-material-input',
  templateUrl: './material-input.component.html',
  styleUrls: ['./material-input.component.scss', './material-input.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormMaterialInputComponent {
  @Output()
  public onValueChangedEvent: EventEmitter<ValueEvent> = new EventEmitter();

  @Output()
  public onSubmitEvent: EventEmitter<ValueEvent> = new EventEmitter();

  @Input()
  public type: InputTextType = 'text';

  @Input()
  public placeHolder: string = '';

  @Input()
  public set startingValue(value: string) {
    this._value = value;

    if (this.value) {
      // only validate on the starting value if there is already something given
      // otherwise we default to the assumption that the user has not interacted at all
      this.validateValue();
    }
  }

  public get required(): boolean {
    if (this._required) {
      return true;
    }

    return null;
  }

  @Input()
  public set required(required: boolean) {
    this._required = required;
  }

  @Input()
  public requiredText: string = '';

  public get disabled(): boolean {
    if (this._disabled) {
      return true;
    }

    return null;
  }

  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = disabled;
  }

  @Input()
  public disabledText: string = '';

  @Input()
  public includeLogo: boolean;

  @Input()
  public inputValidator: InputValidator;

  public get value(): string {
    return this._value;
  }

  public set value(val: string) {
    this._value = val;
    this.validateValue();
    this.onValueChangedEvent.next({
      value: val,
      error: this._errored
    });
  }

  public get interacted(): boolean {
    return this._interacted;
  }

  public get focused(): boolean {
    return this._focused;
  }

  public get errored(): boolean {
    return this._errored;
  }

  public get error(): string {
    return this._error;
  }

  public get valid(): boolean {
    return !this._errored && (!!this._value || !this._required);
  }

  private _required: boolean;
  private _disabled: boolean;
  private _interacted: boolean;
  private _focused: boolean;
  private _errored: boolean;
  private _error: string = '';
  private _value: string = '';

  constructor(
    private _changeDetector: ChangeDetectorRef
  ) { }

  public onFocus(): void {
    this._interacted = true;
    this._focused = true;
    this._errored = false;
    this._changeDetector.detectChanges();
  }

  public onBlur(): void {
    this._focused = false;
    this.validateValue();
    this._changeDetector.detectChanges();
  }

  public onSubmit(): void {
    this.onSubmitEvent.next({
      value: this._value,
      error: this._errored
    });
  }

  private validateValue(): void {
    if (this.required && !this._value) {
      this._errored = true;
      this._error = this.requiredText.replace('__PLACE_HOLDER__', this.placeHolder);
    } else if (this.inputValidator) {
      let error: string = this.inputValidator(this._value);
      this._errored = !!error;
      this._error = error;
    }

    this._changeDetector.detectChanges();
  }
}

export type InputTextType = 'color' | 'date' | 'datetime-local' | 'email' | 'month' |
  'number' | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week';

export interface InputValidator {
  (value: string): string;
}

export interface ValueEvent {
  value: string;
  error: boolean;
}
