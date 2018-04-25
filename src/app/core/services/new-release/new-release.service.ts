import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { noCacheHeaders, randomParam } from '../';
import { Http } from '@angular/http';
import {HttpService} from '../http/http.service';

/**
 * A service for handling tracking http requests throughout the application by overriding the default http.
 * Allows the request history to be accessed via the history getter as well as pushes a shortened version to the
 * global service for use in other places that do not need to know about this service.
 * Also allows access for listening to request error events.
 */
@Injectable()
export class NewReleaseService {
  /**
   * @param _http An http service used to make a request to download a non cached version of the new release
   */
  constructor(
    private _http: HttpService
  ) {}

  /**
   * Download a non cached version of the new release
   *
   * @returns {Promise<>} A promise to allow for method chaining on completion of the request
   */
  public download(): Promise<any> {
    return new Promise((resolve, reject) => {
      let requestParams: any = {
        headers: noCacheHeaders(),
        search: randomParam()
      };

      this._http.get(location.href, requestParams)
        .retry(3)
        .retryWhen((error) => error.delay(100))
        .catch((error: any, caught: Observable<any>) => {
          console.error('new release download error occurred: ' + error);

          return Observable.throw(error.json().error || 'Server Error');
        })
        .subscribe((data) => {
          resolve(true);
        }, (error) => {
          reject(error);
        });
    });
  }

  /**
   * Force a reload of the current page, attempts to force the reload from server but not all browsers follow it
   */
  public activate(): void {
    location.reload(true);
  }
}
