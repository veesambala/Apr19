import { Injectable } from '@angular/core';
import { Log, LogInjector, LogLevel, LogPublisher, LogService } from './log.base';
import { ConsoleLogPublisher } from './publishers/console.publisher';
import { ApiLogPublisher } from './publishers/api.publisher';
import { LocalStorageLogPublisher } from './publishers/local-storage.publisher';

@Injectable()
export class BurstLogService implements LogService {
  private _apiPublisher: ApiLogPublisher;
  private _consolePublisher: ConsoleLogPublisher;
  private _localStoragePublisher: LocalStorageLogPublisher;
  private _publishers: LogPublisher[] = [];
  private _injectors: LogInjector[] = [];

  constructor() {
    this._apiPublisher = new ApiLogPublisher();
    this._consolePublisher = new ConsoleLogPublisher();
    this._localStoragePublisher = new LocalStorageLogPublisher();
  }

  public log(message: string|object): void {
    this.debug(message);
  }

  public debug(message: string|object): void {
    this.publish(message, LogLevel.Debug);
  }

  public info(message: string|object): void {
    this.publish(message, LogLevel.Info);
  }

  public warn(message: string|object): void {
    this.publish(message, LogLevel.Warn);
  }

  public error(message: string|object): void {
    this.publish(message, LogLevel.Error);
  }

  public addPublisher(publisher: LogPublisher): void {
    this._publishers.push(publisher);
  }

  public addInjector(injector: LogInjector): void {
    this._injectors.push(injector);
  }

  private publish(publishMessage: string|object, publishLevel: LogLevel): void {
    let log: Log = {
      message: publishMessage,
      level: publishLevel,
      timestamp: Date.now()
    };

    this._consolePublisher.publish(log, this._injectors);
    this._localStoragePublisher.publish(log, this._injectors);
    this._apiPublisher.publish(log, this._injectors);

    this._publishers.forEach((publisher: LogPublisher): void => {
      publisher.publish(log, this._injectors);
    });
  }
}
