import { AccioError } from './AccioError';

/**
 * Thrown when validation fails
 *
 * This includes configuration validation, metadata validation, input validation,
 * and SQL identifier validation. Used to prevent invalid operations before they
 * reach the database.
 *
 * @example
 * ```typescript
 * catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Validation failed for ${error.field}:', error.value)
 *   }
 * }
 * ```
 */
export class QueryError extends AccioError {
  /**
   * The SQL query that failed
   */
  public readonly sql?: string;

  /**
   * The parameter that are bound to the query
   */
  public readonly params?: unknown[];

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
    sql?: string,
    params?: unknown[],
    cause?: Error
  ) {
    super(message, 'QUERY_ERROR', { sql, params }, cause);
    this.sql = sql;
    this.params = params;
  }
}
