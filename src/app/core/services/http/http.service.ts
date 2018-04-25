import { Injectable } from '@angular/core';
import { RequestOptions, Request, RequestOptionsArgs, Response, Http, XHRBackend } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import {ConfigService} from '../';

/**
 * @type {number} The max number of requests to keep in history array, once exceeded will keep the latest
 */
const MAX_HISTORY_COUNT = 32;

/**
 * A service for handling tracking http requests throughout the application by overriding the default http.
 * Allows the request history to be accessed via the history getter, keeps MAX_HISTORY_COUNT as length of array
 * Also allows access for listening to request error events.
 */
@Injectable()
export class HttpService extends Http {
  private _history: HttpHistoryItem[];
  private _requestErrorEvents: Subject<any>;

  /**
   * @param backend passed to the super class
   * @param defaultOptions passed to the super class
   */
  constructor(
    backend: XHRBackend,
    defaultOptions: RequestOptions
  ) {
    super(backend, defaultOptions);
    this._history = [];
    this._requestErrorEvents = new Subject<any>();
  }

  /**
   * Override of the super request class that hooks into the request to subscribe for errors
   * Triggers an error event if an error occurs.
   *
   * @param url The url to make the request to
   * @param options The options to us along with the request
   * @returns {Observable<>} An observable to hook into the result or error responses when called
   */
  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    this.addRequestHistory(url, options);
    let sharableRequest = super.request(url, options).share();
    sharableRequest.subscribe(
      null,
      (error: any) => {
        this.handleError(error);
      }
    );

    return sharableRequest;
  }

  /**
   * @returns {Array<HttpHistoryItem>} The current history of requests that have occurred up to the NUM_MAX_HISTORY.
   *          The latest will be at the beginning of the array and the oldest at the end.
   */
  public get history(): HttpHistoryItem[] {
    return this._history;
  }

  /**
   * @returns {Observable<Response>} The observable to listen for request error events
   */
  public get requestErrorEvents(): Observable<any> {
    return this._requestErrorEvents.asObservable();
  }

  /**
   * Add an item to the request history, generally only used internally
   *
   * @param url The request url, either string or request class
   * @param options The options that went along with the request
   */
  public addRequestHistory(url: string|Request, options?: RequestOptionsArgs): void {
    let item: HttpHistoryItem = createHttpHistoryItem(url);

    if (!item) {
      return;
    }

    this._history.unshift(item);

    if (this._history.length > MAX_HISTORY_COUNT) {
      // only pop one off since we check the length of every add -- length array can't go over MAX_HISTORY_COUNT + 1
      this._history.pop();
    }
  }

  /**
   * Handle an error that happened for a request, generally only used internally
   *
   * @param error The error that occurred while making a request
   */
  public handleError(error: Response): void {
    this._requestErrorEvents.next(error);
  }
}

/**
 * Create a HttpHistoryItem from a request url and the option args used with it.
 * If the url is null, will return null
 *
 * @param url The request url, either string or request class
 * @param options The options that went along with the request
 * @return {HttpHistoryItem}
 */
export function createHttpHistoryItem(url: string|Request, options?: RequestOptionsArgs): HttpHistoryItem {
  if (!url) {
    return null;
  }

  let item: HttpHistoryItem = {
    url: typeof url !== 'string' ? url.url : url,
    options: {}
  };

  if (options) {
    if (options.hasOwnProperty('url') && options.url) {
      item.url = options.url;
    }

    if (options.hasOwnProperty('method') && options.method) {
      item.options['method'] = options.method.toString();
    }

    if (options.hasOwnProperty('params') && options.params) {
      item.options['params'] = options.params.toString();
    }

    if (options.hasOwnProperty('headers') && options.headers) {
      item.options['headers'] = JSON.stringify(options.headers.toJSON());
    }
  }

  return item;
}

/**
 * A type to define the structure of an item stored in the history for a request.
 *
 * url is the url that the request was made on
 * options is made up of any options used with the request such as headers and params
 */
export type HttpHistoryItem = {
  url: string,
  options: Object
};
