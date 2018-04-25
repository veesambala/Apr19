import { ErrorHandler, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {ConfigService} from '../';

/**
 * An instance to override the error handler with a custom error handler.
 * Makes a subject available for subscribers to listen to when errors happen
 */
@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  private _errorEvents: Subject<any>;

  /**
   * Override that passes false to the super class, this does not propagate the exceptions any further than
   * the instance of the class
   */
  constructor() {
    super(false);
    this._errorEvents = new Subject<any>();
  }

  /**
   * @returns {Observable<any>} An observable to subscribe to error events with
   */
  public get events(): Observable<any> {
    return this._errorEvents.asObservable();
  }

  /**
   * Override of the error handler that logs the error to console and triggers errors
   *
   * @param error the error that occurred
   */
  handleError(error: any): void {
    this.triggerErrorEvent(error);
  }

  private triggerErrorEvent(error: any): void {
    this._errorEvents.next(error);
  }
}