import {Inject, Injectable, InjectionToken} from '@angular/core';
import {Config, ConfigService} from '../config/config.service';
import { GlobalStateService } from '../global-state/global-state.service';
import {Headers, Http, RequestMethod} from '@angular/http';
import {Observable, Subject, Subscription} from 'rxjs';
import { OfflineHttpService } from '../offline-http/offline-http.service';
import {EncapsulatedRouterService, RouteHistoryItem} from '../encapsulated-router/encapsulated-router.service';
import {HttpHistoryItem, HttpService} from '../http/http.service';
import {ClickHistoryItem, ClickTrackingService} from '../click-tracking/click-tracking.service';
import {ErrorHandlerService} from '../error-handler/error-handler.service';
import {PageStateService} from '../page-state/page-state.service';

/**
 * @type {number} An integer value representing the off log level -
 *       The highest possible rank and is intended to turn off logging
 */
export const LOG_LEVEL_OFF: number = 0;
/**
 * @type {string} A string value representing the off log level -
 *       The highest possible rank and is intended to turn off logging
 */
export const LOG_LEVEL_OFF_STRING: string = 'off';
/**
 * @type {number} An integer value representing the fatal log level -
 *       Designates very severe error events that will presumably lead the application to abort
 */
export const LOG_LEVEL_FATAL: number = -1;
/**
 * @type {string} A string value representing the fatal log level -
 *       Designates very severe error events that will presumably lead the application to abort
 */
export const LOG_LEVEL_FATAL_STRING: string = 'fatal';
/**
 * @type {number} An integer value representing the error log level -
 *       Designates error events that might still allow the application to continue running
 */
export const LOG_LEVEL_ERROR: number = -2;
/**
 * @type {string} A string value representing the error log level -
 *       Designates error events that might still allow the application to continue running
 */
export const LOG_LEVEL_ERROR_STRING: string = 'error';
/**
 * @type {number} An integer value representing the warn log level -
 *       Designates potentially harmful situations
 */
export const LOG_LEVEL_WARN: number = -3;
/**
 * @type {number} An integer value representing the warn log level -
 *       Designates potentially harmful situations
 */
export const LOG_LEVEL_WARN_STRING: string = 'warn';
/**
 * @type {number} An integer value representing the info log level -
 *       Designates informational messages that highlight the progress of the application at coarse-grained level
 */
export const LOG_LEVEL_INFO: number = -4;
/**
 * @type {string} A string value representing the info log level -
 *       Designates informational messages that highlight the progress of the application at coarse-grained level
 */
export const LOG_LEVEL_INFO_STRING: string = 'info';
/**
 * @type {number} An integer value representing the debug log level -
 *       Designates fine-grained informational events that are most useful to debug an application
 */
export const LOG_LEVEL_DEBUG: number = -5;
/**
 * @type {string} A string value representing the debug log level -
 *       Designates fine-grained informational events that are most useful to debug an application
 */
export const LOG_LEVEL_DEBUG_STRING: string = 'debug';
/**
 * @type {number} An integer value representing the trace log level -
 *       Designates finer-grained informational events than the DEBUG
 */
export const LOG_LEVEL_TRACE: number = -6;
/**
 * @type {string} A string value representing the trace log level -
 *       Designates finer-grained informational events than the DEBUG
 */
export const LOG_LEVEL_TRACE_STRING: string = 'trace';
/**
 * @type {number} An integer value representing the all log level -
 *       All levels including custom levels
 */
export const LOG_LEVEL_ALL: number = -7;
/**
 * @type {string} A string value representing the all log level -
 *       All levels including custom levels
 */
export const LOG_LEVEL_ALL_STRING: string = 'all';

/**
 * @param level The integer log level to convert to a string log level, reference the LOG_LEVEL_* constants
 * @param deft A default integer log level to convert if level was not a valid value
 * @returns {string} The string representation of log level
 * @throws Error if deft is undefined and level was not a valid log level, reference the LOG_LEVEL_* constants
 */
export function logLevelToString(level: number, deft?: number): string {
  switch (level) {
    case LOG_LEVEL_OFF:
      return LOG_LEVEL_OFF_STRING;
    case LOG_LEVEL_FATAL:
      return LOG_LEVEL_FATAL_STRING;
    case LOG_LEVEL_ERROR:
      return LOG_LEVEL_ERROR_STRING;
    case LOG_LEVEL_WARN:
      return LOG_LEVEL_WARN_STRING;
    case LOG_LEVEL_INFO:
      return LOG_LEVEL_INFO_STRING;
    case LOG_LEVEL_DEBUG:
      return LOG_LEVEL_DEBUG_STRING;
    case LOG_LEVEL_TRACE:
      return LOG_LEVEL_TRACE_STRING;
    case LOG_LEVEL_ALL:
      return LOG_LEVEL_ALL_STRING;
  }

  if (!deft) {
    throw new Error('unknown level passed in of ' + level);
  }

  try {
    return logLevelToString(deft);
  } catch (err) {
    throw new Error('unknown deft passed in of ' + deft);
  }
}

/**
 * @param level The string level to convert to an integer log level, reference the LOG_LEVEL_*_STRING constants
 * @param deft A default string log level to convert if level was not a valid value
 * @returns {string} The integer representation of log level
 * @throws Error if deft is undefined and level was not a valid log level, reference the LOG_LEVEL_*_STRING constants
 */
export function logLevelFromString(level: string, deft?: string): number {
  switch (level) {
    case LOG_LEVEL_OFF_STRING:
      return LOG_LEVEL_OFF;
    case LOG_LEVEL_FATAL_STRING:
      return LOG_LEVEL_FATAL;
    case LOG_LEVEL_ERROR_STRING:
      return LOG_LEVEL_ERROR;
    case LOG_LEVEL_WARN_STRING:
      return LOG_LEVEL_WARN;
    case LOG_LEVEL_INFO_STRING:
      return LOG_LEVEL_INFO;
    case LOG_LEVEL_DEBUG_STRING:
      return LOG_LEVEL_DEBUG;
    case LOG_LEVEL_TRACE_STRING:
      return LOG_LEVEL_TRACE;
    case LOG_LEVEL_ALL_STRING:
      return LOG_LEVEL_ALL;
  }

  if (!deft) {
    throw new Error('unknown level passed in of ' + level);
  }

  try {
    return logLevelFromString(deft);
  } catch (err) {
    throw new Error('unknown deft passed in of ' + deft);
  }
}

/**
 * Compare two log levels to each other. Compares levelOne to levelTwo.
 * If the levels are the same, returns 0
 * If levelOne is greater than levelTwo (ERROR > INFO), returns 1
 * If levelOne is less than levelTwo (INFO < ERROR), returns -1
 *
 * @param levelOne {number} The first level to compare against
 * @param levelTwo {number} The second level to compare with
 * @return {number} The comparison value as listed in the above doc description
 */
export function logLevelComparison(levelOne: number, levelTwo: number): number {
  if (levelOne == levelTwo) {
    return 0;
  }

  return levelOne < levelTwo ? -1 : 1;
}

/**
 * A universal logging service to be used across the website.
 * Handles logging to the console as well as sending them to an external logging service - currently ELK stack.
 * Takes care of filtering the logs coming in to only report the desired level or more server,
 * also handles throttling, batching, and restricting requests to the log server.
 */
@Injectable()
export class LoggingService {
  private _settings: LogServiceSettings;
  private _consoleRestrictor: LogConsoleRestrictor;
  private _reportRestrictor: LogReportRestrictor;
  private _reportBatchManger: LogBatchManager;
  private _injectors: LogInfoInjector[];

  public get reportBatchManager(){
    return this._reportBatchManger;
  }

  public get settings (): LogServiceSettings {
    return this._settings;
  }

    /**
   * @param _http The http service to send batched log requests through, should not be the HttpService class
   *    as this would create circular error logging logic
   * @param configService The global config service, used to extract configurable log settings such as url
   *    and threshold levels / rates
   */
  constructor(
    private _http: Http,
    public configService: ConfigService
  ) {
    this._settings = createLogServiceSettings(this.configService.config);
    this._consoleRestrictor = new LogConsoleRestrictor(this._settings);
    this._reportRestrictor = new LogReportRestrictor(this._settings);
    this._reportBatchManger = new LogBatchManager(this._settings);

    this._reportBatchManger.batchReadyEvent.subscribe(
      (logs: Log[]): void => {
        this.reportLogs(logs);
      });
    this._injectors = [];
  }

  /**
   * Add a log injector to the the current logging service.
   * Log injectors add information to the logs.
   * The injectors run in order of when they were added.
   * They run on every log before they are sent to console or reported to server
   *
   * @param injector
   */
  public addInjector(injector: LogInfoInjector) {
    this._injectors.push(injector);
  }

  /**
   * Designates informational messages that highlight the progress of the application at coarse-grained level
   *
   * @param value The generic value that should be logged, will try to pull stack trace and message out of
   *        it if it is an object
   */
  public trace(value: any): void {
    this.log(value, LOG_LEVEL_TRACE);
  }

  /**
   * Designates fine-grained informational events that are most useful to debug an application
   *
   * @param value The generic value that should be logged, will try to pull stack trace and message out of
   *        it if it is an object
   */
  public debug(value: any): void {
    this.log(value, LOG_LEVEL_DEBUG);
  }

  /**
   * Designates informational messages that highlight the progress of the application at coarse-grained level
   *
   * @param value The generic value that should be logged, will try to pull stack trace and message out of
   *        it if it is an object
   */
  public info(value: any): void {
    this.log(value, LOG_LEVEL_INFO);
  }

  /**
   * Designates potentially harmful situations
   *
   * @param value The generic value that should be logged, will try to pull stack trace and message out of
   *        it if it is an object
   */
  public warn(value: any): void {
    this.log(value, LOG_LEVEL_WARN);
  }

  /**
   * Designates error events that might still allow the application to continue running
   *
   * @param value The generic value that should be logged, will try to pull stack trace and message out of
   *        it if it is an object
   */
  public error(value: any): void {
    this.log(value, LOG_LEVEL_ERROR);
  }

  /**
   * Designates fatal events that might still allow the application to continue running
   *
   * @param value The generic value that should be logged, will try to pull stack trace and message out of
   *        it if it is an object
   */
  public fatal(value: any): void {
    this.log(value, LOG_LEVEL_FATAL);
  }

  /**
   * Force send any current log reports that are pending
   */
  public sendReports(): void {
    this._reportBatchManger.triggerSend();
  }

  /**
   * Log a message to console and server if needed at a specific level.
   * Handles all logic related to restricting, throttling, batching, and sending.
   *
   * @param value The value to log, can be of any format. If object will try to break it up into trace and message
   * @param level The level to log the message at, see LOG_LEVEL_* constants
   */
  protected log(value: any, level: number): void {
    let log: Log;

    try {
      log = createLog(value, level, this._settings);
    } catch (exn) {
      console.error('Error creating log');
      console.error(exn);
    }

    try {
      this._injectors.forEach((injector) => {
        injector.inject(log);
      });
    } catch (exn) {
        console.error('Error injecting into log');
        console.error(exn);
    }

    this.logConsole(log);
    this.logServer(log);
  }

  /**
   * Log a value to the console using the console specific methods for each type of log
   *
   * @param log: {Log} The log value to try to log to the console
   */
  protected logConsole(log: Log): void {
    if (this._consoleRestrictor.isRestricted(log)) {
      return;
    }

    switch (log.levelNum) {
      case LOG_LEVEL_FATAL:
      case LOG_LEVEL_ERROR:
        console.error(log.message + ': ' + log.stackTrace);

        break;
      case LOG_LEVEL_WARN:
        console.warn(log.message + ': ' + log.stackTrace);

        break;
      case LOG_LEVEL_INFO:
        console.info(log.message + ': ' + log.stackTrace);

        break;
      case LOG_LEVEL_DEBUG:
        console.debug(log.message + ': ' + log.stackTrace);

        break;
      case LOG_LEVEL_TRACE:
        console.trace(log.message + ': ' + log.stackTrace);

        break;
    }
  }

  /**
   * Log a value at a specific level to the server.
   * Will check if it should log first, if it should then will put the log into a batch for sending to server.
   *
   *
   * @param log: {Log} The log value to try to report to the server
   */
  protected logServer(log: Log): void {
    if (this._reportRestrictor.isRestricted(log)) {
      return;
    }

    this._reportBatchManger.add(log);
  }

  private reportLogs(logs: Log[]): void {
    if (!logs) {
      console.error('A null logs array was attempted to be sent to the server');

      return;
    }

    this._http.request(
      this._settings.url,
      {
        method: RequestMethod.Post,
        headers: LoggingService.getSendBatchHeaders(),
        body: {
          logs
        }
      }
    )
      .retry(3)
      .subscribe(() => {

      }, (error) => {
        console.error('log send error');
        console.error(error);
      }
    );
  }

  private static getSendBatchHeaders(): Headers {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');

    return headers;
  }
}

/**
 * An interface that defines how log info injectors should work.
 * Log injectors add information to logs before they are sent to the console or server.
 */
export interface LogInfoInjector {
  inject(log: Log): void;
}

/**
 * An interface that defines how the restrictor should work.
 * Restrictors are used to restrict the flow of logs to the console or the server.
 */
export interface Restrictor {
  isRestricted(log: Log): boolean;
}

/**
 * A restrictor that controls the flow of logs to the console.
 * Checks if the log level is at or greater than the current settings for logging to the console.
 */
export class LogConsoleRestrictor implements Restrictor {
  /**
   * @param _settings {LogServiceSettings} Current settings for the log instance
   */
  constructor(
    private _settings: LogServiceSettings
  ) {}

  /**
   * @param log {Log} The log object to check for restriction
   * @return {boolean} True if the log object should be restricted and not sent to console, false otherwise
   */
  public isRestricted(log: Log): boolean {
    if (!log) {
      throw new Error('log must be truthy');
    }

    if (!this._settings.consoleLevel) {
      return false;
    }

    return logLevelComparison(this._settings.consoleLevel, log.levelNum) > -1;
  }
}

/**
 * A restrictor that controls the flow of logs to the server.
 * Checks the rate of logs, total logs sent, as well as if the log level is at or greater than current settings.
 */
export class LogReportRestrictor implements Restrictor {
  private _total: number;
  private _recent: number[];

  /**
   * @param _settings {LogServiceSettings} Current settings for the log instance
   */
  constructor(
    private _settings: LogServiceSettings
  ) {
    this._total = 0;
    this._recent = [];
  }

  /**
   * @param log {Log} The log object to check for restriction
   * @return {boolean} True if the log object should be restricted and not sent to server, false otherwise
   */
  public isRestricted(log): boolean {
    if (!log) {
      throw new Error('log must be truthy');
    }

    if (!this._settings.url) {
      // no url to report to, restrict everything
      return true;
    }

    this._total += 1;

    if (this._total > this._settings.reportMax) {
      // too  many log reports for this instance, restricting
      return true;
    }

    this.cleanRecent();

    if (this._recent.length > this._settings.reportMaxPerMinute) {
      // too many reports in the past minute, restricting
      return true;
    }

    // add here so we rate won't throw away everything when rate limit is exceeded
    this._recent.push(Date.now());

    if (!this._settings.reportLevel && this._settings.reportLevel !== 0) {
      // no report level set, send everything through
      return false;
    }

    return logLevelComparison(this._settings.reportLevel, log.levelNum) > -1;
  }

  private cleanRecent(): void {
    if (!this._settings.reportMaxPerMinute || this._settings.reportMaxPerMinute < 1) {
      // no valid setting for reportMaxPerMinute, clean out the recent array
      this._recent = [];

      return;
    }

    let currentTime = Date.now();
    let oneMinute = 60000;

    while (this._recent.length > 0 && this._recent[0] < currentTime - oneMinute) {
      this._recent.shift();
    }
  }
}

/**
 * A class for batching logs together for later sending to server in a bulk request
 */
export class LogBatchManager {
  private _logs: Log[];
  private _batchStart: number;
  private _batchExpiredTimerSubscription: Subscription;

  private _batchReadyEvent: Subject<Log[]>;

  public get logs() {
    return this._logs;
  }

  /**
   * @param _settings {LogServiceSettings} Current settings for the log instance
   */
  constructor(
    private _settings: LogServiceSettings
  ) {
    this._logs = [];
    this._batchStart = 0;
    this._batchExpiredTimerSubscription = null;

    this._batchReadyEvent = new Subject();
  }

  /**
   * @return {Subject<Array<Log>>} Events that are triggered when a batch is ready to be sent
   */
  get batchReadyEvent(): Subject<Log[]> {
    return this._batchReadyEvent;
  }

  /**
   * @param log {Log} Add the log object to the batch for later sending
   */
  public add(log: Log): void {
    if (!log) {
      throw new Error('log must be truthy');
    }

    if (this._logs.length == 0) {
      this._batchStart = Date.now();
      this.scheduleBatchExpiration();
    }

    this._logs.push(log);
    this.checkSend();
  }

  public triggerSend(): void {
    this.checkSend(true);
  }

  private checkSend(force: boolean= false): void {
    if (this._logs.length == 0) {
      return;
    }

    let send: boolean = force;

    if (!send && this._settings.reportBatchingTimeThreshold && this._settings.reportBatchingTimeThreshold > 0) {
      // check restricting based on batching time threshold
      let currentTime = Date.now();
      send = currentTime - this._batchStart >= this._settings.reportBatchingTimeThreshold;
    }

    if (!send && this._settings.reportBatchingCountThreshold && this._settings.reportBatchingCountThreshold > 0) {
      send = this._logs.length >= this._settings.reportBatchingCountThreshold;
    }

    if (send) {
      this.cancelBatchExpiration();
      let logs = this._logs;
      this._logs = [];
      this._batchReadyEvent.next(logs);
    }
  }

  private scheduleBatchExpiration(): void {
    this.cancelBatchExpiration();

    if (this._settings.reportBatchingTimeThreshold && this._settings.reportBatchingTimeThreshold > 0) {
      let timer = Observable.timer(this._settings.reportBatchingTimeThreshold);
      this._batchExpiredTimerSubscription = timer.subscribe(() => {
        this.checkSend();
      });
    }
  }

  private cancelBatchExpiration(): void {
    if (this._batchExpiredTimerSubscription) {
      this._batchExpiredTimerSubscription.unsubscribe();
      this._batchExpiredTimerSubscription = null;
    }
  }
}

/**
 * Create a LogServiceSettings from a config object.
 * If config is null will throw an error.
 * Also verifies that expected standard properties are in the config.
 *
 * @param config {Config} The config instance to create a LogServiceSettings from
 * @return {{logSessionId: string, env: string, version: string, releaseTag: string, url, consoleLevel: number,
 *           reportLevel: number, reportMax: (number|any), reportMaxPerMinute: (number|any),
 *           reportBatchingCountThreshold: (any|number), reportBatchingTimeThreshold: (any|number)}}
 */
export function createLogServiceSettings(config: Config) {
  if (!config) {
    throw new Error('config must be truthy');
  }

  if (!config.hasOwnProperty('log')) {
    throw new Error('log is not provided in config');
  }

  let logConfig = config.log;

  if (!logConfig.hasOwnProperty('url')) {
    throw new Error('url is not provided in log config');
  }

  if (!logConfig.hasOwnProperty('consoleLevel')) {
    throw new Error('consoleLevel is not provided in log config');
  }

  if (!logConfig.hasOwnProperty('reportLevel')) {
    throw new Error('reportLevel is not provided in log config');
  }

  if (!logConfig.hasOwnProperty('reportMax')) {
    throw new Error('reportMax is not provided in log config');
  }

  if (!logConfig.hasOwnProperty('reportMaxPerMinute')) {
    throw new Error('reportMaxPerMinute is not provided in log config');
  }

  if (!logConfig.hasOwnProperty('reportBatchingCountThreshold')) {
    throw new Error('reportBatchingCountThreshold is not provided in log config');
  }

  if (!logConfig.hasOwnProperty('reportBatchingTimeThreshold')) {
    throw new Error('reportBatchingTimeThreshold is not provided in log config');
  }

  return {
    logSessionId: createLogSessionId(),
    env: config.env,
    version: config.version,
    releaseTag: config.releaseTag,
    url: logConfig.url,
    consoleLevel: logLevelFromString(logConfig.consoleLevel),
    reportLevel: logLevelFromString(logConfig.reportLevel),
    reportMax: logConfig.reportMax,
    reportMaxPerMinute: logConfig.reportMaxPerMinute,
    reportBatchingCountThreshold: logConfig.reportBatchingCountThreshold,
    reportBatchingTimeThreshold: logConfig.reportBatchingTimeThreshold
  };
}

/**
 * @returns {string} A random string to be used as the log session id, identifies sessions in the log servers
 */
export function createLogSessionId(): string {
  // method for generating a random hash
  let sessionId: string = '';

  for (let counter = 0; counter < 16; counter++) {
    sessionId += Math.floor(Math.random() * 16).toString(16).toUpperCase();
  }

  return sessionId;
}

/**
 * A type for defining the settings expected to be used with the log service
 *
 * url The url to send logs to a server at
 * consoleLevel The log level a message must be at or more severe than to be logged to console
 * reportLevel The log level a message must be at or more severe than to be reported to server
 * reportMax The maximum number of logs that can be sent to the server per load of the webpage
 * reportMaxPerMinute The maximum number of logs that can be sent to the server per minute
 * reportBatchingCountThreshold The maximum number of logs that can be batched before sending to server
 * reportBatchingTimeThreshold The maximum amount of time a batch can live for before sending to server
 */
export interface LogServiceSettings {
  logSessionId: string;
  env: string;
  version: string;
  releaseTag: string;
  url: string;
  consoleLevel: number;
  reportLevel: number;
  reportMax: number;
  reportMaxPerMinute: number;
  reportBatchingCountThreshold: number;
  reportBatchingTimeThreshold: number;
}

/**
 * Create a Log object from a value, level, and current LogServiceSettings
 *
 * @param value {any} The value that is being logged, can be one of many different types including string and object
 * @param level {number} The level assiged with the value, see LOG_LEVEL constants
 * @param settings {LogServiceSettings} The current settings that contain info such as session id, env, etc
 * @return {{logSessionId: string, levelNum: number, level: string, message: string, stackTrace: string, url: string,
 *           env: string, version: string, releaseTag: string, locale: string, timezone: string, timestamp: string,
 *           userAgent: string, navHistory: null, reqHistory: null, clickHistory: null}}
 */
export function createLog(value: any, level: number, settings: LogServiceSettings) {
  let message: string = value;
  let stackTrace: string = null;

  if (value && typeof value === 'object') {
    if ('stacktrace' in value) {
      stackTrace = value['stacktrace'];
    } else if ('stackTrace' in value) {
      stackTrace = value['stackTrace'];
    } else if ('stack_trace' in value) {
      stackTrace = value['stack_trace'];
    }  else if ('stack' in value) {
      stackTrace = value['stack'];
    } else if ('trace' in value) {
      stackTrace = value['trace'];
    }

    if ('message' in value) {
      message = value['message'];
    } else if ('msg' in value) {
      message = value['msg'];
    } else if ('value' in value) {
      message = value['value'];
    } else if ('val' in value) {
      message = value['val'];
    }
  }

  if (message && typeof message !== 'string') {
    try {
      message = JSON.stringify(message);
    } catch (exception) {
      console.error('Could not stringify a log message object');
      console.error(exception);
      message = 'UNKNOWN - error in stringify';
    }
  }

  if (stackTrace && typeof stackTrace !== 'string') {
    try {
      stackTrace = JSON.stringify(stackTrace);
    } catch (exception) {
      console.error('Could not stringify a log stackTrace object');
      console.error(exception);
      stackTrace = 'UNKNOWN - error in stringify';
    }
  }

  return {
    logSessionId: settings.logSessionId,
    levelNum: level,
    level: logLevelToString(level),
    message,
    stackTrace,
    url: location.href,
    env: settings.env,
    version: settings.version,
    releaseTag: settings.releaseTag,
    locale: navigator.language,
    timezone: new Date().toString().match(/([A-Z]+[+-][0-9]+.*)/)[1],
    timestamp: (new Date()).toString(),
    userAgent: navigator.userAgent,
    navHistory: null,
    reqHistory: null,
    clickHistory: null
  };
}

/**
 * An interface for defining what a log that is sent to the server is made up of.
 *
 * logSessionId Unique random string per website load, used for matching logs in browser to logs on server
 *              or finding sessions on the server
 * level The log level string of the message recorded
 * message The message value of the log
 * stack_trace The stack trace of the error that happened as a string
 * url The current url when the message was logged
 * version The current version of the of the code, semantic version ie ##.##.##
 * revision The current revision of the code, uniquely identifies the code
 * release_tag The current release tag that is applied to the code, displayed to the user
 * locale The current locale of the browser the page is loaded in, ie en-US
 * timezone The current timezone of the browser the page is loaded in
 * timestamp The timestamp that the log was sent and processed at
 * user_agent The current user agent when the message was logged, contains info about browser used and more
 * nav_history An array of the recent navigation for the user before the message was logged, newest first
 * req_history An array of the recent http requests for the site before the message was logged, newest first
 * click_history An array of the recent clicks for the user before the message was logged, newest first
 */
export interface Log {
  logSessionId: string;
  levelNum: number;
  level: string;
  message: string;
  stackTrace: string;
  url: string;
  env: string;
  version: string;
  releaseTag: string;
  locale: string;
  timezone: string;
  timestamp: string;
  userAgent: string;
  navHistory: RouteHistoryItem[];
  reqHistory: HttpHistoryItem[];
  clickHistory: ClickHistoryItem[];
}
