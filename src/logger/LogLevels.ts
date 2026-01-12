/**
 * Log level definitions for the Accio logger
 *
 * Log levels control which messages are output. Higher levels are more severe.
 * Setting a log level will output all messages at the level and above.
 */

/**
 * Log severity levels
 *
 * @example
 * ```typescript
 * const dv = connect({
 *   host: 'localhost',
 *   database: 'mydb',
 *   user: 'user',
 *   password: 'password',
 *   logger: {
 *     level: Loglevel.DEBUG // show all log messages
 *   }
 * })
 */
export enum LogLevel {
  /**
   * Debug level - most verbose, includes all query details
   */
  DEBUG = 0,

  /**
   * Info level - general informational messages
   */
  INFO = 1,

  /**
   * Warning level - warnings that don't stop execution
   */
  WARN = 2,

  /**
   * Error level - errors that cause operation failures
   */
  ERROR = 3,

  /**
   * No logging - disables all log output
   */
  NONE = 4
}

/**
 * Human-readable names for log levels
 */
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.NONE]: 'NONE'
};
