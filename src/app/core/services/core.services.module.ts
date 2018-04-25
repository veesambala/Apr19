import {APP_INITIALIZER, ErrorHandler, ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {Http} from '@angular/http';
import {Router} from '@angular/router';
import {LoggingService} from './logging/logging.service';
import {ClickTrackingService} from './click-tracking/click-tracking.service';
import {ConfigService} from './config/config.service';
import {EncapsulatedRouterService} from './encapsulated-router/encapsulated-router.service';
import {CoreServicesManager} from './core.services.manager';
import {ErrorHandlerService} from './error-handler/error-handler.service';
import {HttpService} from './http/http.service';
import {NewReleaseService} from './new-release/new-release.service';
import {PageStateService} from './page-state/page-state.service';
import { BurstLogService } from './logging/log.service';

let moduleImports = [];
let moduleDeclarations = [];
let moduleExports = [];
let moduleProviders = [];
let entryComponents = [];

@NgModule({
    imports: moduleImports,
    declarations: moduleDeclarations,
    exports: moduleExports,
    providers: moduleProviders,
    entryComponents
})
export class CoreServicesModule {
  constructor(
    @Optional() @SkipSelf() parentModule: CoreServicesModule
  ) {
    if (parentModule) {
      throw new Error('CoreServicesModule is already loaded, import it in the AppModule only');
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreServicesModule,
      providers: [
        {
          provide: ConfigService,
          useClass: ConfigService,
          deps: [
            Http
          ]
        },
        {
          provide: APP_INITIALIZER,
          useFactory: loadConfigFactory,
          deps: [
            ConfigService
          ],
          multi: true
        },
        ClickTrackingService,
        {
          provide: EncapsulatedRouterService,
          useClass: EncapsulatedRouterService,
          deps: [
            Router
          ]
        },
        ErrorHandlerService,
        HttpService,
        {
          provide: NewReleaseService,
          useClass: NewReleaseService,
          deps: [
            HttpService
          ]
        },
        PageStateService,
        {
          provide: LoggingService,
          useClass: LoggingService,
          deps: [
            Http,
            ConfigService
          ]
        },
        {
          provide: BurstLogService,
          useClass: BurstLogService
        },
        {
          provide: CoreServicesManager,
          useClass: CoreServicesManager,
          deps: [
            ConfigService,
            LoggingService,
            ClickTrackingService,
            EncapsulatedRouterService,
            HttpService,
            ErrorHandlerService,
            NewReleaseService,
            PageStateService
          ]
        },
        // {
        //   provide: ErrorHandler,
        //   useExisting: ErrorHandlerService
        // },
        {
          provide: Http,
          useExisting: HttpService
        }
      ]
    };
  }
}

export function loadConfigFactory(config: ConfigService) {
  return () => {
    return config.load();
  };
}
