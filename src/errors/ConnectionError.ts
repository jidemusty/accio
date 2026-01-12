import { AccioError } from './AccioError';

/**
 * Thrown when database connection operation fail
 *
 * This includes connection establishment failures, connection pool exhaustion,
 * connection timeouts, and connection closing errors.
 *
 * @example
 * ```typescript
 * catch (error) {
 *   if (error instanceof ConnectionError) {
 *     console.error('Failed to connect to database:', error.context)
 *   }
 * }
 * ```
 */
export class ConnectionError extends AccioError {
  /**
   * Creates a new QueryError
   *
   * @param message - Human-readable error message
   * @param sql - The SQL query that failed (optional)
   * @param params - The parameter bound to the query (optional)
   * @param cause - Original error from the database driver
   */
  constructor(
    message: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, 'CONNECTION_ERROR', context, cause);
  }
}
