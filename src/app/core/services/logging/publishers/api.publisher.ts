import {Log, LogInjector, LogPublisher} from "../log.base";

export class ApiLogPublisher implements LogPublisher {
  public publish(log: Log, injectors: LogInjector[]): void {

  }
}
