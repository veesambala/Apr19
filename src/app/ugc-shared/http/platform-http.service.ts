import { Injectable } from '@angular/core';
import {
    ConnectionBackend, RequestOptions, Request, RequestOptionsArgs, Response, Http, Headers,
    XHRBackend
} from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { StaticUtils } from '../static-utils';
import { PageParamsService } from '../utils/page-params/page-params.service';

/**
 * This service will extend all the http service call to add auth headers
 */
@Injectable()
export class PlatformHttpService extends Http {
    constructor(
        backend: XHRBackend,
        defaultOptions: RequestOptions,
        private _pageParams: PageParamsService
    ) {
        super(backend, defaultOptions);
    }

    public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        if (url instanceof Request) {
            url.headers = this.getRequestOptionArgs(url).headers;
        }

        return super.request(url, options);
    }

    private getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options == null) {
            options = new RequestOptions();
        }
        if (options.headers == null) {
            options.headers = new Headers();
        }
        options.headers.append('Content-Type', 'application/json');
        options.headers.append('X-Api-Key', this._pageParams.partnerId);
        options.headers.append('X-App-Id', '0');
        options.headers.append('Api-Authorization', 'Bearer ' + this._pageParams.jwt);

        let noCache: boolean = false;
        if (noCache) {
            options.headers.append('Cache-Control', 'max-age=0');
        }

        return options;
    }
}
