import { LogLevel } from './LogLevels';
import { LogLevelNames } from './LogLevels';

/**
 * Structured log entity
 */
export interface LogEntry {
  /**
   * Timestamp when the log entry was created
   */
  timestamp: Date;

  /**
   * Log severity level
   */
  level: LogLevel;

  /**
   * Log message
   */
  message: string;

  /**
   * Additional context information
   */
  context?: Record<string, unknown>;

  /**
   * SQL query (for query logs)
   */
  sql?: string;

  /**
   * Query parameters (for query logs)
   */
  params?: unknown[];

  /**
   * Query execution duration in milliseconds (for query logs)
   */
  duration?: number;
}

/**
 * Logger configuration options
 *
 * @example
 * ```typescript
 * const loggerConfig: LoggerConfig = {
 *   level: LogLevel.DEBUG,
 *   logQueries: true,
 *   logErrors: true,
 *   customLogger: (entry) => {
 *     // Send to external logging service
 *     winston.log(entry);
 *   }
 * };
 * ```
 */
export interface LoggerConfig {
  /**
   * Minimum log level to output (default: INFO)
   */
  level: LogLevel;

  /**
   * Whether to log SQL queries (default: true)
   */
  logQueries?: boolean;

  /**
   * Whether to log errors (default: true)
   */
  logErrors?: boolean;

  /**
   * Custom logger function for integration with external logging services
   */
  customLogger?: (entry: LogEntry) => void;
}

/**
 *
 */
export class Logger {
  private config: LoggerConfig;

  /**
   * Creates a new Logger instance
   *
   * @param config - Logger configuration options
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: config.level ?? LogLevel.INFO,
      logQueries: config.logQueries ?? true,
      logErrors: config.logErrors ?? true,
      customLogger: config.customLogger
    };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Format a log entry as a string for console output
   */
  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevelNames[entry.level];
    let message = `[${timestamp}] ${level}: ${entry.message}`;

    if (entry.sql) {
      message += `\n SQL: ${entry.sql}`;
    }

    if (entry.params && entry.params.length > 0) {
      message += `\n Params: ${JSON.stringify(entry.params)}`;
    }

    if (entry.duration) {
      message += `\n Duration: ${entry.duration}ms`;
    }

    if (entry.context) {
      message += `\n Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    return message;
  }

  /**
   * Internal log method that handle output
   */
  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    if (this.config.customLogger) {
      this.config.customLogger(entry);
    } else {
      const message = this.formatMessage(entry);

      switch (entry.level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(message);
          break;
        case LogLevel.WARN:
          console.warn(message);
          break;
        case LogLevel.ERROR:
          console.error(message);
          break;
      }
    }
  }

  /**
   * Log a debig message
   *
   * @param message - The message to log
   * @param context - Additional context information
   *
   * @example
   * ```typescript
   * logger.debug('Building query', { table: 'users', operation: 'SELECT' });
   * ```
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      message,
      context
    });
  }

  /**
   * Log an info message
   *
   * @param message - The message to log
   * @param context - Additional context information
   *
   * @example
   * ```typescript
   * logger.info('Connection established', { host: 'localhost', database: 'mydb' })
   * ```
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: LogLevel.INFO,
      message,
      context
    });
  }

  /**
   * Log an warning message
   *
   * @param message - The message to log
   * @param context - Additional context information
   *
   * @example
   * ```typescript
   * logger.warn('Query slow', { duration: 5000, threshold: 1000 })
   * ```
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: LogLevel.WARN,
      message,
      context
    });
  }

  /**
   * Log an warning message
   *
   * @param message - The message to log
   * @param error - The error object (optional)
   * @param context - Additional context information
   *
   * @example
   * ```typescript
   * logger.error('Query failed', { query: 'SELECT * FROM users' })
   * ```
   */
  public error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    if (!this.config.logErrors) {
      return;
    }

    this.log({
      timestamp: new Date(),
      level: LogLevel.ERROR,
      message,
      context: {
        ...context,
        error: error?.message,
        stack: error?.stack
      }
    });
  }

  /**
   * Log an warning message
   *
   * @param message - The message to log
   * @param error - The error object (optional)
   * @param context - Additional context information
   *
   * @example
   * ```typescript
   * logger.error('Query failed', { query: 'SELECT * FROM users' })
   * ```
   */
  public query(sql: string, params?: unknown[], duration?: number): void {
    if (!this.config.logQueries) {
      return;
    }

    this.log({
      timestamp: new Date(),
      level: LogLevel.DEBUG,
      message: 'Query Executed',
      sql,
      params,
      duration
    });
  }

  /**
   * Set the minimum log level
   *
   * @param level - The new log level
   *
   * @example
   * ```typescript
   * logger.setLevel(LogLevel.ERROR); // Only show errors
   * ```
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Get the current log level
   *
   * @returns the current log level
   */
  public getLevel(): LogLevel {
    return this.config.level;
  }
}
