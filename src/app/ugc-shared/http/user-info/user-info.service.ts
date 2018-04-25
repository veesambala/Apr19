import { Injectable } from '@angular/core';
import { EmailValidator } from '@angular/forms/src/directives/validators';
import { PlatformHttpService } from '../platform-http.service';
import { ConfigService } from '../../../core/services/config/config.service';
import { Observable, Subject } from 'rxjs';

/**
 * UserInfoService for basic user-information saving and validating splash-fields.
 */
@Injectable()
export class UserInfoService {

    private _ncUser: NcUser;

    public get ncUser() {
        return this._ncUser;
    }

    public set ncUser(data: NcUser) {
        this._ncUser = data;
    }

    constructor(
        private _http: PlatformHttpService,
        private _configService: ConfigService
    ) {

    }

    /**
     * Makes API call to save the ncUser details
     */
    public saveNcUser(): Observable<any> {
        return this._http.post(
            this.ncUserUrl(),
            this.ncUser
        ).map((response: any) => {
            return response.json();
        });
    }

    private ncUserUrl(): string {
        return this.userBaseUrl() + '/ncuser';
    }

    private userBaseUrl(): string {
        return this._configService.config.platformBaseUrl + '/';
    }

}

/**
 * splash & validation fields. If the validation/splash screen is active than this interface guides the form.
 *
 */
export interface SplashValidationFields {
    isValidFields(): boolean;
    fields: Array<{
        fieldName: string,
        fieldDescription: string,
        fieldType: string | number | boolean | any
        isRequired: boolean
    }>;
}
/**
 * Named-contributer user infomation interface.
 */
export interface NcUser {
    firstName: string;
    lastName: string;
    email: string;
    postalCode: string;
    twitterHandle: string;
    dynamicFields: Array<{
        fieldName: string,
        fieldValue: string | boolean | number | any
    }>;
    isValidNcUser(): boolean;
}