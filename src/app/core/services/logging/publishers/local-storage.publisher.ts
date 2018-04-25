import {Log, LogInjector, LogPublisher} from "../log.base";

export class LocalStorageLogPublisher implements LogPublisher {
  public publish(log: Log, injectors: LogInjector[]): void {

  }
}
