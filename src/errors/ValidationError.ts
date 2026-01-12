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
 */
export class ValidationError extends AccioError {
  /**
   * The field or property that failed validation
   */
  public readonly field?: string;

  /**
   * The imvalid value that caused the validation error
   */
  public readonly value?: unknown;

  /**
   * Creates a new ValidationError
   *
   * @param message - Human-readable error message describing the validation failure
   * @param field - The field or property that failed validation (optional)
   * @param value - The invalid value (optional, may be redacted for sensitive data)
   * @param context - Additional context about the validation failure (optional)
   */
  constructor(
    message: string,
    field?: string,
    value?: unknown,
    context?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', { field, value, ...context });
    this.field = field;
    this.value = value;
  }
}
