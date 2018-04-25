import {Injectable, Renderer2} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import {ConfigService} from '../';

/**
 * @type {number} The minimum amount of time the last state must have been in to consider a state change
 *        Set to one minute in milliseconds
 */
const MIN_TIME_FOR_STATE_CHANGE = 60 * 1000;
/**
 * @type {number} The interval to run a heartbeat check at, heartbeat function will reoccur at this time rate
 *        Set to 30 seconds in milliseconds
 */
const HEARTBEAT_INTERVAL = 30 * 1000;
/**
 * @type {number} The minimum amount of time to pass since last check to consider a miss for the heart beat
 *        This means that the function was not running for a longer than expected period of time
 *        Set to one minute in milliseconds
 */
const HEARTBEAT_MISSED_THRESHOLD = 60 * 1000;

/**
 * A service for handling the current active state of the page.
 * A page is considered active if the last click a user did was within the UI page.
 * NOTE: this means that the user is able to view-state the page and still be considered inactive -- limitations of focus
 * It does this by hooking into the focus and blur events for the window.
 *
 * Also monitors a heart beat interval to consider activeness of the user.
 * An interval is constantly running, and if the last check in time is much greater than the expected, user was
 * inactive and is now considered active.
 *
 * Properties are made available to check if the user is active or not.
 * An observable is also made available to receive notifications for when the user has become active or inactive
 * A change in state is considered to have happened if the last state is different from the new one and
 * more the time spend in that last state was more than 1 minute.
 */
@Injectable()
export class PageStateService {
  private _renderer: Renderer2;
  private _removeFocusListener: any;
  private _removeBlurListener: any;
  private _removeBeforeUnloadListener: any;

  private _active: boolean;
  private _enteredStateTime: number;
  private _lastHeartBeatTime: number;

  private _activeChangeEvents: Subject<boolean>;
  private _beforeUnloadEvents: Subject<void>;

  /**
   * Setup the window event listeners and kick off the heartbeat interval
   */
  constructor() {
    this._renderer = null;
    this._removeFocusListener = null;
    this._removeBlurListener = null;
    this._removeBeforeUnloadListener = null;

    this._active = true;
    this._enteredStateTime = Date.now();
    this._lastHeartBeatTime = Date.now();

    this._activeChangeEvents = new Subject<boolean>();
    this._beforeUnloadEvents = new Subject<void>();

    let interval = Observable.timer(HEARTBEAT_INTERVAL, HEARTBEAT_INTERVAL);
    interval.subscribe(this.heartBeat);
  }

  /**
   * @param value The injectable Renderer from angular core, used for subscribing to events at the document level
   */
  set renderer(value: Renderer2) {
    this._renderer = value;
    this.dettachListeners();
    this.attachListeners();
  }

  /**
   * @return {Renderer2} The injectable Renderer from angular core, used for subscribing to events at the document level
   */
  get renderer(): Renderer2 {
    return this._renderer;
  }

  /**
   * @return {boolean} True if the user can be currently considered active, false otherwise
   *           User is considered active if their last mouse click was within the page
   */
  public get isActive(): boolean {
    return this._active;
  }

  /**
   * @return {Observable<boolean>} An observable that reports when the active state has changed for a user
   *                 Will only report if the previous state was stayed in for a reasonable time
   */
  public get activeChangeEvents(): Observable<boolean> {
    return this._activeChangeEvents.asObservable();
  }

  /**
   * @return {Observable<void>} An observable that reports when the page is about to be unloaded
   */
  public get beforeUnloadEvents(): Observable<void> {
    return this._beforeUnloadEvents.asObservable();
  }

  private attachListeners(): void {
    this._removeFocusListener = this._renderer.listen('window', 'focus', () => {
      // check because something is getting garbage collected after a long time off the page
      if (this && this.stateChanged) {
        this.stateChanged(true);
      }
    });
    this._removeBlurListener = this._renderer.listen('window', 'blur', () => {
      // check because something is getting garbage collected after a long time off the page
      if (this && this.stateChanged) {
        this.stateChanged(true);
      }
    });
    this._removeBeforeUnloadListener = this._renderer.listen('window', 'beforeunload', () => {
      // check because something is getting garbage collected after a long time off the page
      if (this && this.triggerBeforeUnload) {
        this.triggerBeforeUnload();
      }
    });
  }

  private dettachListeners(): void {
    if (this._removeFocusListener) {
      this._removeFocusListener();
      this._removeFocusListener = null;
    }

    if (this._removeBlurListener) {
      this._removeBlurListener();
      this._removeBlurListener = null;
    }

    if (this._removeBeforeUnloadListener) {
      this._removeBeforeUnloadListener();
      this._removeBeforeUnloadListener = null;
    }
  }

  private stateChanged(focused: boolean) {
    if (focused == this._active) {
      return;
    }

    let currentTime = Date.now();
    let timeInPrevState = currentTime - this._enteredStateTime;
    this._active = focused;
    this._enteredStateTime = currentTime;

    if (timeInPrevState >= MIN_TIME_FOR_STATE_CHANGE) {
      this.triggerActiveChange();
    }
  }

  private triggerActiveChange() {
    this._activeChangeEvents.next(this._active);
  }

  private heartBeat() {
    let currentTime = Date.now();
    let timeSincePrev = currentTime - this._lastHeartBeatTime;

    if (timeSincePrev >= HEARTBEAT_MISSED_THRESHOLD) {
      // check because something is getting garbage collected after a long time off the page
      if (this && this.stateChanged) {
        this.stateChanged(true);
      }
    }

    this._lastHeartBeatTime = currentTime;
  }

  private triggerBeforeUnload() {
    this._beforeUnloadEvents.next();
  }
}
