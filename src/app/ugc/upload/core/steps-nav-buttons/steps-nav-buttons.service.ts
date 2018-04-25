import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class StepsNavButtonsService {
  public get onPrimaryButtonTextChange(): Observable<string> {
    return this._primaryButtonTextChange.asObservable();
  }

  public get onPrimaryButtonStateChange(): Observable<string> {
    return this._primaryButtonStateChange.asObservable();
  }

  public get primaryButtonText(): string {
    return this._primaryButtonText;
  }

  public set primaryButtonText(value: string) {
    this._primaryButtonText = value;
    this._primaryButtonTextChange.next(this._primaryButtonText);
  }
  public get primaryButtonState(): ButtonState {
    return this._primaryButtonState;
  }

  public set primaryButtonState(value: ButtonState) {
    this._primaryButtonState = value;
    this._primaryButtonStateChange.next(this._primaryButtonState);
  }

  private _primaryButtonState: ButtonState = 'NONE';
  private _primaryButtonText: string = '';
  private _primaryButtonTextChange: Subject<string> = new Subject();
  private _primaryButtonStateChange: Subject<string> = new Subject();
}

export type ButtonState = 'NONE' | 'DISABLED' | 'ENABLED';
