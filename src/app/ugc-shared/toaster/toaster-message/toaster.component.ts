import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, Input, Output, EventEmitter, OnInit,
  ViewChild, AfterViewInit
} from '@angular/core';
import { MediaFile } from '../../http/media-upload/file/file.service';
import { Subscription } from 'rxjs/Subscription';
import { ToasterService, ToasterState } from '../toaster.service';

@Component({
  selector: 'toaster-message',
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.scss', './toaster.component.theme.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToasterMessageComponent implements OnInit, AfterViewInit {
  @ViewChild('ugctoaster') public tosterElement;

  @Output()
  public get toasterMessageText(): string {
    return this._toasterMessageText;
  }
  public get toasterMessageState(): ToasterState {
    return this._toasterMessageState;
  }
  private _toasterMessageText: string;
  private _toasterTextChangeSubscription: Subscription;
  private _toasterStateChangeSubscription: Subscription;
  private _toasterMessageState: ToasterState;
  private _toasterElement: HTMLElement;

  constructor(
    private _changeDetector: ChangeDetectorRef,
    private _toasterService: ToasterService
  ) { }
  public ngAfterViewInit() {
    this._toasterElement = this.tosterElement.nativeElement;
  };

  public ngOnInit(): void {
    this._toasterMessageText = this._toasterService.toasterMessageText;
    this._toasterMessageState = this._toasterService.toasterStateText;

    this._toasterStateChangeSubscription = this._toasterService.onToasterStateChange.subscribe(
      (state: ToasterState) => {
        this._toasterMessageState = state;
        this.setToasterState();
        this._changeDetector.detectChanges();
      }
    );

    this._toasterTextChangeSubscription = this._toasterService.onToasterTextChange.subscribe(
      (text: string) => {
        this._toasterMessageText = text;
        this._changeDetector.detectChanges();
      }
    );

  }

  public setToasterState() {
    if (this._toasterService.toasterStateText === 'SHOW') {
      this._toasterElement.className = 'toaster-container show';

      setTimeout(() => {
        this._toasterService.toasterStateText = 'HIDE';
        this._toasterElement.className = 'toaster-container';
      }, 5000);
    }
  }

}
