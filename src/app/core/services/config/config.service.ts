import { Injectable } from '@angular/core';
import {Http, RequestOptionsArgs} from '@angular/http';
import {Observable, Subject, Subscription} from 'rxjs';
import {ObservableInput} from 'rxjs/Observable';
import {noCacheHeaders, randomParam} from '../';

/**
 * @type {number} The min time in milliseconds that must pass before making another config load from server.
 *       Only applies when releasePending in the most recent config loaded is true. Set to thirty seconds.
 */
export const MIN_TIME_BETWEEN_SERVER_REQUESTS: number = 30 * 1000;
/**
 * @type {number} The max time in milliseconds that can pass before making another config load from server.
 *       Only applies when releasePending in the most recent config loaded is false. Set to 10 minutes.
 */
export const MAX_TIME_BETWEEN_SERVER_REQUESTS: number = 10 * 60 * 1000;
/**
 * @type {number} The max time in milliseconds that can pass before making another config load from server.
 *       Only applies when releasePending in the most recent config loaded is true or
 *       a current time is within 1 hour of the last release in case of a roleback. Set to 1 minute.
 *       Set to a shorter time period so that we are actively getting any new release info.
 */
export const RELEASE_MAX_TIME_BETWEEN_SERVER_REQUESTS: number = 60 * 1000;
/**
 * @type {number} The length of time, in milliseconds, that a release can be considered new for. Set to one hour.
 */
export const NEW_RELEASE_LIFETIME: number = 60 * 60 * 1000;
/**
 * @type {string} The url to load a new config file with
 */
export const CONFIG_URL = 'assets/config.json';

/**
 * A service for handling loading and reloading configuration variables.
 * These are meant for variables that are changing as part of a configuration for an environment or other.
 * Config variables are set to their defaults if the params are not changed from the __{NAME}__ value
 *
 * The other purpose of this service is to detect server side upgrades based on comparing the current loaded
 * config with one that has been fetched from the server.
 *
 * Logging service cannot be used here as it is loaded before logging service.
 * All logs and errors are therefore sent to the console.
 */
@Injectable()
export class ConfigService {
  private _config: Config;
  private _manager: ConfigRequestManager;

  private _newConfigEvent: Subject<Config>;
  private _newReleaseEvent: Subject<Config>;

  /**
   * @param _http Class used for making get requests to load the config from the server
   */
  constructor(
    private _http: Http
  ) {
    this._config = null;
    this._manager = new ConfigRequestManager();
    this._manager.nextCheckEvent.subscribe(
      () => {
        this.requestLoad();
      }
    );

    this._newConfigEvent = new Subject();
    this._newReleaseEvent = new Subject();
  }

  /**
   * Force load a new config from the server
   *
   * @param allowCache {boolean} true if caching is allowed for the request, false to force no caching
   * @return {Promise<any>} A promise related to the request to get the config
   */
  public load(allowCache: boolean= true): Promise<any> {
    return this.loadFromServer(allowCache);
  }

  /**
   * Request loading a new config from the server.
   * The service can use its best judgement if it's appropriate to load a new file
   *
   * @param allowCache {boolean} true if caching is allowed for the request, false to force no caching
   * @return {boolean} true if a request is being made, false otherwise
   */
  public requestLoad(allowCache: boolean= true): boolean {
    if (!this._manager.canUpdate) {
      return false;
    }

    this.loadFromServer(allowCache);

    return true;
  }

  /**
   * @return {Observable<Config>} An observable that will receive events anytime a new config is available
   */
  get newConfigEvent(): Observable<Config> {
    return this._newConfigEvent.asObservable();
  }

  /**
   * @return {Observable<Config>} An observable that will receive events anytime a new release is available
   */
  get newReleaseEvent(): Observable<Config> {
    return this._newReleaseEvent.asObservable();
  }

  /**
   * @return {Config} The latest config that has been loaded from the server, or null if one has not been
   */
  get config(): Config {
    return this._config;
  }

  /**
   * Implemented in this way because currently getters and setters must have same visiblity:
   * https://github.com/Microsoft/TypeScript/issues/2845
   *
   * @param value the new config to set for the instance, newly loaded from the config.json
   */
  protected setConfig(value: Config) {
    let oldConfig = this._config;
    this._config = value;

    this._newConfigEvent.next(this._config);

    if (!oldConfig || !this._config) {
      return;
    }

    if (oldConfig.releaseTimestamp != this._config.releaseTimestamp ||
        oldConfig.version != this._config.version) {
      this._newReleaseEvent.next(this._config);
    }
  }

  /**
   * @returns {boolean} True if the config params have been loaded, false otherwise
   */
  public get loaded(): boolean {
    return this._config != null;
  }

  private loadFromServer(allowCache: boolean): Promise<any> {
    this._manager.requesting = true;

    return new Promise((resolve, reject) => {
      let requestParams: RequestOptionsArgs = {};

      if (!allowCache) {
        requestParams['headers'] = noCacheHeaders();
        requestParams['search'] = randomParam();
      }

      this._http.get(CONFIG_URL, requestParams)
        .retry(3)
        .retryWhen((error) => error.delay(100))
        .map((res) => res.json())
        .catch((observableError: any): ObservableInput<Response> => {
          console.error('Error loading config.json: ' + observableError.toString());

          return Observable.of(null);
        })
        .subscribe(
          (data) => {
            try {
              this._config = createConfig(data);
              this._manager.setCurrentConfigState(this._config.releasePending, this._config.releaseTimestamp);
              console.log('loaded new config: ' + this._config.toString());
            } catch (createError) {
              console.error('Error creating config from config.json: ' + createError.toString());
            }

            this._manager.requesting = false;
            resolve(this._config);
          },
          (requestError) => {
            // shouldn't reach here
            console.error('Error loading config.json ' + requestError.toString());
            reject(requestError);
          }
        );
    });
  }
}

/**
 * A class to handle the lifecycle of making requests for a config.
 * Handles tracking the state of the requests, enforcing only one is made at a time, and scheduling timers for new requests.
 */
export class ConfigRequestManager {
  private _requesting: boolean;
  private _firstLoad: boolean;
  private _lastCheck: number;

  private _nextCheckEvent: Subject<any>;
  private _nextCheckTimerSubscription: Subscription;

  private _pendingRelease: boolean;
  private _releaseTimestamp: number;

  constructor() {
    this._requesting = false;
    this._firstLoad = true;
    this._lastCheck = 0;

    this._nextCheckEvent = new Subject();
    this._nextCheckTimerSubscription = null;

    this._pendingRelease = false;
    this._releaseTimestamp = 0;
  }

  /**
   * @return {Observable<any>} Triggered when a new check event should be made
   */
  get nextCheckEvent(): Observable<any> {
    return this._nextCheckEvent.asObservable();
  }

  /**
   * @return {boolean} True if a config request can be made, false otherwise
   */
  public get canUpdate(): boolean {
    if (this._requesting) {
      return false;
    }

    if (this._firstLoad) {
      return true;
    }

    let currentTime = Date.now();

    return (currentTime - this._lastCheck) >= MIN_TIME_BETWEEN_SERVER_REQUESTS;
  }

  /**
   * @param value True if the service is currently requesting a new config, false otherwise
   */
  public set requesting(value: boolean) {
    this._requesting = value;

    if (this._requesting) {
      this._firstLoad = false;
      this._lastCheck = Date.now();
    } else {
      this.scheduleNextCheck();
    }
  }

  /**
   * @return {boolean} True if the service is currently requesting a new config, false otherwise
   */
  public get requesting(): boolean {
    return this._requesting;
  }

  /**
   * @param pendingRelease {boolean} Pulled from the config, true if there is currently a release about to happen
   * @param releaseTimestamp {number} The timestamp the last release was pushed out at
   */
  public setCurrentConfigState(pendingRelease: boolean, releaseTimestamp: number) {
    this._pendingRelease = pendingRelease;
    this._releaseTimestamp = releaseTimestamp;

    this.scheduleNextCheck();
  }

  private scheduleNextCheck(): void {
    if (this._nextCheckTimerSubscription) {
      this._nextCheckTimerSubscription.unsubscribe();
      this._nextCheckTimerSubscription = null;
    }

    let releaseCheck: boolean = this._pendingRelease ||
        (this._releaseTimestamp && Date.now() - this._releaseTimestamp >= NEW_RELEASE_LIFETIME);

    let timer = Observable.timer(releaseCheck ? RELEASE_MAX_TIME_BETWEEN_SERVER_REQUESTS :
        MAX_TIME_BETWEEN_SERVER_REQUESTS);
    this._nextCheckTimerSubscription = timer.subscribe(() => {
      this._nextCheckEvent.next(null);
    });
  }
}

/**
 * Create a Config from a javascript object
 * If configObject is null will throw an error.
 * Also verifies that expected standard properties are in the config.
 *
 * @param configObject The javascript object to convert into a Config
 * @return {Config}
 */
export function createConfig(configObject: any): Config {
  if (!configObject) {
    throw new Error('configObject must be truthy');
  }

  let config: Config = configObject;

  if (!config.hasOwnProperty('env')) {
    throw new Error('env is not provided in config');
  }

  if (!config.hasOwnProperty('version')) {
    throw new Error('version is not provided in config');
  }

  if (!config.hasOwnProperty('releaseTimestamp')) {
    throw new Error('releaseTimestamp is not provided in config');
  }

  if (!config.hasOwnProperty('releaseTag')) {
    throw new Error('releaseTag is not provided in config');
  }

  if (!config.hasOwnProperty('releasePending')) {
    throw new Error('releasePending is not provided in config');
  }

  config.toString = (): string => {
    return 'env: ' + config.env + ' version: ' + config.version + ' releaseTimestamp: ' + config.releaseTimestamp +
          ' releaseTag: ' + config.releaseTag + ' releasePending: ' + config.releasePending;
  };
  config.isDev = (): boolean => {
    return config.env == 'dev';
  };
  config.isStage = (): boolean => {
    return config.env == 'stage';
  };
  config.isProd = (): boolean => {
    return config.env == 'prod';
  };

  return config;
}

/***
 * Interface that defines the type expected for a config
 *
 * env is the current environment the code is running on
 * version is the current version the code is running as
 * releaseTimestamp is the time in milliseconds since the unix epoch the code was released at
 * releasePending is a boolean flag, true if there is a release about to happen, false otherwise
 * key represents all other parameters that could be listed in the params
 */
export interface Config {
  env: string;
  version: string;
  releaseTimestamp: number;
  releaseTag: string;
  releasePending: boolean;
  [key: string]: any;
  toString(): string;
  isDev(): boolean;
  isStage(): boolean;
  isProd(): boolean;
}
