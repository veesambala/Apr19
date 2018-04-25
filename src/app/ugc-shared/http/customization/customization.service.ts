import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http } from '@angular/http';
import { StaticUtils } from '../../static-utils';
import { ObservableInput } from 'rxjs/Observable';
import { UgcC11nJson, CustomizationFactory, UgcC11n, Locales } from './customization.factory';
import { PageParamsService } from '../../utils/page-params/page-params.service';

/**
 * @type {boolean} only applies if IS_LOCALHOST = true; true if it should load the bubble customization,
 *                 false to load the master (gives invalid bubble)
 */
const LOAD_LOCALHOST_BUBBLE = location.host.indexOf('localhost') > -1;

/**
 * UgcCustomizationService handles UGC C11N JSON and its validation
 */
@Injectable()
export class UgcCustomizationService {
  public static masterUrl(): string {
    return `${window.location.origin}/ugc_c11n/master/c11n.json`;
  }

  public static mockMasterUrl(): string {
    return 'assets/mock-data/ugc-config.json';
  }

  public get bubbleUrl(): string {
    return `${window.location.origin}/ugc_c11n/bubbles/${this._pageParams.bubbleId}`;
  }

  private _c11nJson: UgcC11nJson;
  private _loadWarnings: string[];
  private _loadErrors: string[];

  constructor(
    private _http: Http,
    private _pageParams: PageParamsService
  ) {
    this._c11nJson = null;
    this._loadWarnings = [];
    this._loadErrors = [];
  }

  /**
   * @return {Promise<any>} A promise related to the request to get the customization
   */
  public load(): Promise<any> {
    return this.loadFromServer();
  }

  /**
   * @return {UgcC11nJson} Latest customization json that has been loaded from the server, or null if one has not been
   */
  get c11nJson(): UgcC11nJson {
    return this._c11nJson;
  }

  /**
   * @return {UgcC11n} Latest customization that has been loaded from the server, or null if one has not been
   */
  get ugcC11n(): UgcC11n {
    return this._c11nJson.ugcC11n;
  }

  /**
   * @return {Locales} The latest locale that has been loaded from the server, or null if one has not been
   */
  get locales(): Locales {
    return this._c11nJson.locales;
  }

  /**
   * @return {string[]} Any warnings that occurred while loading the c11n files
   */
  get loadWarnings(): string[] {
    return this._loadWarnings;
  }

  /**
   * @return {string[]} Any errors that occurred while loading the c11n files
   */
  get loadErrors(): string[] {
    return this._loadErrors;
  }

  /**
   * @returns {boolean} True if the customization has been loaded, false otherwise
   */
  public get loaded(): boolean {
    return this._c11nJson != null;
  }

  private loadFromServer(): Promise<any> {
    return new Promise((resolve, reject) => {
      let bubbleRequest = this._pageParams.bubbleId ? this.bubbleLoader() : Observable.of(null);
      let masterRequest = this.masterLoader();

      let filesLoader = Observable.zip(masterRequest, bubbleRequest,
        (masterCustomization, bubbleCustomization) => {
          if (!masterCustomization) {
            this._loadErrors.push('could not load the master c11n, setting to empty object');
            masterCustomization = {};
          }

          if (!bubbleCustomization) {
            this._loadWarnings.push('could not load the bubble c11n, setting to empty object');
            bubbleCustomization = {};
          } else {
            // convert to and from json to create a deep copy for checking c11n json format
            let bubbleErrors: string[] = CustomizationFactory.validateC11nJson(
              JSON.parse(JSON.stringify(bubbleCustomization)), 'c11n', false);

            if (bubbleErrors.length > 0) {
              this._loadErrors.push('bubble\'s widget c11n was not formatted correctly; errors: '
                + bubbleErrors.toString());
            }
          }

          StaticUtils.smartMergeObjects(masterCustomization, bubbleCustomization);

          let c11n: UgcC11nJson = masterCustomization as UgcC11nJson;
          let c11nErrors: string[] =  CustomizationFactory.validateC11nJson(masterCustomization, 'c11n', false);

          if (c11nErrors.length > 0) {
            this._loadErrors.push('combined widget c11n was not formatted correctly; errors: ' + c11nErrors.toString());
          }

          return c11n;
        }
      );

      filesLoader.subscribe(
        (c11n) => {
          this._c11nJson = c11n;
          resolve(c11n);
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  private bubbleLoader(): Observable<any> {
    let url: string = StaticUtils.IS_LOCALHOST && LOAD_LOCALHOST_BUBBLE ?
      UgcCustomizationService.mockMasterUrl() : this.bubbleUrl;

    return this._http.get(url)
      .retry(3)
      .catch((requestError: any): ObservableInput<Response> => {
        this._loadErrors.push('error getting bubble c11n: ' + requestError);

        return Observable.of(null);
      })
      .map((response: Response) => {
        try {
          return response.json();
        } catch (parseError) {
          this._loadErrors.push('error parsing bubble c11n json: ' + parseError);

          return null;
        }
      });
  }

  private masterLoader(): Observable<any> {
    let url: string = StaticUtils.IS_LOCALHOST ?
      UgcCustomizationService.mockMasterUrl() : UgcCustomizationService.masterUrl();

    return this._http.get(url)
      .retry(3)
      .catch((requestError: any): ObservableInput<Response> => {
        this._loadErrors.push('error getting master c11n: ' + requestError);

        return Observable.of(null);
      })
      .map((response: Response) => {
        try {
          return response.json();
        } catch (parseError) {
          this._loadErrors.push('error parsing master c11n json: ' + parseError);

          return null;
        }
      });
  }
}
