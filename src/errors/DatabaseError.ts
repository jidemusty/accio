import { AccioError } from './AccioError';

/**
 * Thrown for database-level errors
 *
 * This includes constraint violations, permission errors, database-specific
 * errors, and other database-level failures that are not query syntax errors
 *
 * @example
 * ```typescript
 * catch (error) {
 *   if (error instanceof DatabaseError) {
 *     console.error('Database error:' error.constrait, error.detail)
 *   }
 * }
 * ```
 */
export class DatabaseError extends AccioError {
  /**
   * The database constraint that was violated (if applicable)
   */
  public readonly constraint?: string;

  /**
   * Detailed information from the database about the error
   */
  public readonly detail?: string;

  /**
   * Creates a new DatabaseError
   *
   * @param message - Human-readable error message
   * @param constraint - The constraint that was violated (optional)
   * @param detail - Detailed information from the database (optional)
   * @param cause - Original error from the database driver
   */
  constructor(
    message: string,
    constraint?: string,
    detail?: string,
    cause?: Error
  ) {
    super(message, 'DATABASE_ERROR', { constraint, detail }, cause);
    this.constraint = constraint;
    this.detail = detail;
  }
}
