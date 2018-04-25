import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ToasterService {
  public get onToasterTextChange(): Observable<string> {
    return this._toasterTextChange.asObservable();
  }
  public get onToasterStateChange(): Observable<string> {
    return this._toasterStateChange.asObservable();
  }

  public get toasterMessageText(): string {
    return this._toasterText;
  }

  public set toasterMessageText(value: string) {
    this._toasterText = value;
    this._toasterTextChange.next(this._toasterText);
  }

  public get toasterStateText(): ToasterState {
    return this._toasterMessageState;
  }
  public set toasterStateText(value: ToasterState) {
    this._toasterMessageState = value;
    this._toasterStateChange.next(this._toasterMessageState);
  }

  private _toasterMessageState: ToasterState = 'HIDE';
  private _toasterText: string = 'Something went wrong !';
  private _toasterTextChange: Subject<string> = new Subject();
  private _toasterStateChange: Subject<string> = new Subject();
}
export type ToasterState = 'HIDE' | 'SHOW';
