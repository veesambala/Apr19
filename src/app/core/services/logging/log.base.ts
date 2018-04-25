export interface LogService {
  log(message: string|object): void;
  debug(message: string|object): void;
  info(message: string|object): void;
  warn(message: string|object): void;
  error(message: string|object): void;

  addPublisher(publisher: LogPublisher): void;
  addInjector(injector: LogInjector): void;
}

export interface LogInjector {
  inject(logObject: object): void;
}

export interface LogPublisher {
  publish(log: Log, injectors: LogInjector[]): void;
}

export interface Log {
  message: string|object;
  level: LogLevel;
  timestamp: number;
}

export enum LogLevel {
  All = 0,
  Debug = 1,
  Info = 2,
  Warn = 3,
  Error = 4,
  Off = 6
}
