import { ValidationError } from '@/errors';

/**
 * Validate query paramters and options
 *
 * Ensures query parameters like LIMIT, OFFSET, and ORDER BY direction
 * are valid before building SQL queries.
 *
 * @example
 * ```typescript
 * QueryValidator.validateLimit(10); // OK
 * QueryValidator.validateLimit(-5); // Throws ValidationError
 * ```
 */
export class QueryValidator {
  /**
   * Maximum safe LIMIT value to prevent memory issues
   */
  private static readonly MAX_LIMIT = 10000;

  /**
   * Validate LIMIT value
   *
   * @param value - The limit value to validate
   * @throws {ValidationError} If limit is invalid
   *
   * @example
   * ```typescript
   * QueryValidator.validateLimit(100); // OK
   * QueryValidator.validateLimit(-1); // Throws
   * QueryValidator.validateLimit(20000); // Throws (exceeds max)
   * ```
   */
  public static validateLimit(value: number): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError(
        'Limit must be a non-negative integer',
        'limit',
        value
      );
    }

    if (value > this.MAX_LIMIT) {
      throw new ValidationError(
        `Limit cannot exceed ${this.MAX_LIMIT} for safety reasons`,
        'limit',
        value
      );
    }
  }

  /**
   * Validate OFFSET value
   *
   * @param value - The offset value to validate
   * @throws {ValidationError} If offset is invalid
   *
   * @example
   * ```typescript
   * QueryValidator.validateOffset(0); // OK
   * QueryValidator.validateOffset(100); // OK
   * QueryValidator.validateOffset(-1); // Throws
   * QueryValidator.validateOffset(3.14); // Throws (not integer)
   * ```
   */
  public static validateOffset(value: number): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError(
        'Offset must be a non-negative integer',
        'offset',
        value
      );
    }
  }

  /**
   * Validate ORDER BY direction
   *
   * @param direction - The order direction to validate
   * @throws {ValidationError} If direction is not 'ASC' or 'DESC'
   *
   * @example
   * ```typescript
   * QueryValidator.validateOrderDirection('ASC'); // OK
   * QueryValidator.validateOrderDirection('DESC'); // OK
   * QueryValidator.validateOrderDirection('RANDOM'); // Throws
   * ```
   */
  public static validateOrderDirection(direction: string): void {
    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new ValidationError(
        'Order direction must be either "ASC" or "DESC"',
        'orderDirection',
        direction
      );
    }
  }
}
