import { Log, LogInjector, LogLevel, LogPublisher } from '../log.base';

export class ConsoleLogPublisher implements LogPublisher {
  public publish(log: Log, injectors: LogInjector[]): void {
    switch (log.level) {
      case LogLevel.Debug:
        ConsoleLogPublisher._debug(log.message);
        break;
      case LogLevel.Info:
        ConsoleLogPublisher._info(log.message);
        break;
      case LogLevel.Warn:
        ConsoleLogPublisher._warn(log.message);
        break;
      case LogLevel.Error:
        ConsoleLogPublisher._error(log.message);
        break;
      default:
        throw new Error('unknown log level for ConsoleLogPublisher: ' + log.level);
    }
  }

  private static get _debug() {
    return console.debug.bind(console);
  }

  private static get _info() {
    return console.info.bind(console);
  }

  private static get _warn() {
    return console.warn.bind(console);
  }

  private static get _error() {
    return console.error.bind(console);
  }
}
