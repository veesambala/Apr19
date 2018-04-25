import {
  Component, ChangeDetectionStrategy,
  ChangeDetectorRef, Input, Output,
  EventEmitter
} from '@angular/core';
import { MediaFile } from '../../services/media-upload/file/file.service';
import { DynamicLink } from '../../../ugc/upload/user-info/user-info.component';

@Component({
  selector: 'form-material-checkbox',
  templateUrl: './material-checkbox.component.html',
  styleUrls: ['./material-checkbox.component.scss', './material-checkbox.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormMaterialCheckboxComponent {
  @Output()
  public onValueChangedEvent: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public enabledClickEvent: EventEmitter<boolean> = new EventEmitter();

  @Input()
  public set link(link: DynamicLink) {
    this._link = link;
  }
  public get link(): DynamicLink {
    return this._link;
  }
  @Input()
  public set required(required: boolean) {
    this._required = required;
  }
  @Input()
  public set disabled(disabled: boolean) {
    this._disabled = disabled;
  }
  public get disabled(): boolean {
    return this._disabled;
  }
  @Input()
  public set startingState(startingValue: boolean) {
    this._checkedStatus = startingValue;
  }
  public get checkedState(): boolean {
    return this._checkedStatus;
  }
  @Input()
  public set label(label: string) {
    this._label = label;
  }
  public get label(): string {
    return this._label;
  }
  private _required: boolean;
  private _disabled: boolean;
  private _label: string;
  private _errored: boolean;
  private _id: string = '';
  private _checkedStatus: boolean;
  private _link: DynamicLink;

  constructor(
    private _changeDetector: ChangeDetectorRef
  ) { }

  public onChange($event): void {
    this._checkedStatus = !this._checkedStatus;
    this.onValueChangedEvent.next(this._checkedStatus);
  }

  public onCheckboxClicked(): void {
    if (this._link) {
      this.enabledClickEvent.next(true);
    }
  }
}
