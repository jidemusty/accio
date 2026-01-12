/**
 * Base error class for all Accio ORM errors
 *
 * Provides  context tracking, error chaining, and structured error information
 * All Accio-specific errors extend from this class
 *
 * @example
 * ```typescript
 * throw new AccioError(
 *   'Operation failed',
 *   'OPERATION_ERROR',
 *   { operation: 'INSERT', table: 'users' }
 * )
 * ```
 */
export class AccioError extends Error {
  /**
   * Error code for programmatic error handling
   */
  public readonly code: string;

  /**
   * Additional context about the error
   */
  public readonly context?: Record<string, unknown>;

  /**
   * Original error that caused this error (for error chaining)
   */
  public readonly cause?: Error;

  /**
   * Causes a new AccioError
   *
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   * @param context - Additional structured context about the error
   * @param cause - Original error that caused this error
   */
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.cause = cause;

    if (
      'captureStackTrace' in Error &&
      typeof Error.captureStackTrace === 'function'
    ) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error to JSON for logging or transmission
   *
   * @param Structured error object
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      cause: this.cause?.message,
      stack: this.stack
    };
  }
}
