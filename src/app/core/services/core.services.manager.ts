import {Injectable, Renderer2} from '@angular/core';
import {ConfigService} from './config/config.service';
import {Log, LoggingService, LogInfoInjector} from './logging/logging.service';
import {ClickTrackingService} from './click-tracking/click-tracking.service';
import {EncapsulatedRouterService} from './encapsulated-router/encapsulated-router.service';
import {ErrorHandlerService} from './error-handler/error-handler.service';
import {NewReleaseService} from './new-release/new-release.service';
import {PageStateService} from './page-state/page-state.service';
import {HttpService} from './http/http.service';
import {Observable} from 'rxjs';

export const MAX_HISTORY_LENGTH = 20;

/**
 * Manager class that handles setting up dependencies between the services in core module.
 * Here to ensure there are no issues with circular dependencies
 * and to keep the constructors for each service lightweight
 */
@Injectable()
export class CoreServicesManager {
  constructor(
    public config: ConfigService,
    public logging: LoggingService,
    public clickTracking: ClickTrackingService,
    public encapsulatedRouter: EncapsulatedRouterService,
    public httpService: HttpService,
    public errorHandler: ErrorHandlerService,
    public newReleaseService: NewReleaseService,
    public pageStateService: PageStateService
  ) {}

  /**
   * Must be called in the utils.component constructor
   * Used to setup all the services in the core module
   *
   * @param renderer The angular Renderer that core have access to, services do not
   */
  public configure(renderer: Renderer2): void {
    this.clickTracking.renderer = renderer;
    this.pageStateService.renderer = renderer;

    this.logging.addInjector(
      new CoreServicesLoggingInjector(this.clickTracking, this.encapsulatedRouter, this.httpService)
    );

    this.encapsulatedRouter.routingErrorEvents.subscribe(
      (error) => {
        this.logging.error(error);
      }
    );
    this.httpService.requestErrorEvents.subscribe(
      (error) => {
        this.logging.error(error);
      }
    );
    this.errorHandler.events.subscribe(
      (error) => {
        this.logging.error(error);
      }
    );

    this.pageStateService.activeChangeEvents.subscribe(
      () => {
        this.config.requestLoad();
      }
    );
    this.pageStateService.beforeUnloadEvents.subscribe(
      () => {
        this.logging.sendReports();
      }
    );
  }
}

/**
 * An internal class to handle injecting information on the click history, navigation history, and http request history
 */
class CoreServicesLoggingInjector implements LogInfoInjector {
  constructor(
    private _clickTracking: ClickTrackingService,
    private _encapuslatedRouter: EncapsulatedRouterService,
    private _httpService: HttpService
  ) {}

  inject(log: Log): void {
    log.clickHistory = CoreServicesLoggingInjector.truncateHistory(this._clickTracking.history);
    log.navHistory = CoreServicesLoggingInjector.truncateHistory(this._encapuslatedRouter.history);
    log.reqHistory = CoreServicesLoggingInjector.truncateHistory(this._httpService.history);
  }

  private static truncateHistory<T>(history: T[]): T[] {
    if (!history) {
      return null;
    }

    if (history.length > MAX_HISTORY_LENGTH) {
      return history.slice(0, history.length);
    }

    return history;
  }
}