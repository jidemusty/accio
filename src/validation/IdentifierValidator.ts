import { ValidationError } from '@/errors';
import type { EntityMetadata } from '@/metadata/types';

/**
 * Validate SQL identifiers (table/column names) against metadata
 *
 * **CRITICAL FOR SECURITY**: Prevents SQL injection through identifier manipulation.
 * All table and column names must be validated against entity metadata before
 * being used in SQL queries
 *
 * @example
 * ```typescript
 * // Validate that a column exists in metadata (prevents injection)
 * IdentifierValidator.validateColumnName(
 *   userInput,
 *   metadata,
 *  'ORDER BY'
 * );
 * ```
 */
export class identifierValidator {
  /**
   * PostgresSQL identifier rules
   * - Max 63 characters
   * - Must start with letter or underscore
   * - Can contain letters, numbers, and underscores
   */
  private static readonly IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]{0,62}$/;

  /**
   * Validate that a string is a safe SQL identifier
   *
   * @param identifier = The identifier to validate
   * @returns true if valid, false otherwise
   *
   * @example
   * ```typescript
   * IdentifierValidator.isValidIdentifier('user_name'); // true
   * IdentifierValidator.isValidIdentifier('1user'); // false
   * ```
   */
  public static isValidIdentifier(identifier: string): boolean {
    return this.IDENTIFIER_REGEX.test(identifier);
  }

  /**
   * Validate identifier format or throw
   *
   * @param identifier - The identifier to validate
   * @param context - Context description for error message
   * @throws {ValidationError} If identifier format is invalid
   *
   * @example
   * ```typescript
   * IdentifierValidator.validateIdentifier('users', 'table name');
   * ```
   */
  public static validateIdentifier(identifier: string, context: string): void {
    if (!this.isValidIdentifier(identifier)) {
      throw new ValidationError(
        `Invalid ${context} identifier: "${identifier}". ` +
          'Identifiers must start with a letter or underscore, contain only ' +
          'alphanumeric characters and underscores, and be max 63 characters',
        context,
        identifier
      );
    }
  }

  /**
   * Validate identifier format or throw
   *
   * @param propertyKey - The property ket to validate
   * @param metadata - Entity metadata to check against
   * @param operation - Operation context for error message
   * @throws {ValidationError} If property doesn't exist
   *
   * @example
   * ```typescript
   * IdentifierValidator.validatePropertyExists(
   *   'age',
   *   metadata,
   *   'WHERE clause'
   * );
   * ```
   */
  public static validatePropertyExists(
    propertyKey: string,
    metadata: EntityMetadata,
    operation: string
  ) {
    const exists = metadata.columns.some(
      (col) => col.propertyKey === propertyKey
    );

    if (!exists) {
      throw new ValidationError(
        `Property '${propertyKey}' does not exist on entity ${metadata.tableName} for ${operation}. ` +
          `Available properties: ${metadata.columns.map((c) => c.propertyKey).join(', ')}`,
        'propertyKey',
        propertyKey,
        { entityName: metadata.tableName, operation }
      );
    }
  }

  /**
   *
   * @param columnName - The column name to validate
   * @param metadata - Entity metadata to check against
   * @param operation - Operation context for error message
   * @throws {ValidationError} if column doesn't exist in metadata
   *
   * @example
   * ```typescript
   * // Prevent injection in ORDER BY clause
   * IdentifierValidator.validateColumnName(
   *   orderByColumn,
   *   metadata,
   *  'ORDER BY'
   * );
   * ```
   */
  public static validateColumnName(
    columnName: string,
    metadata: EntityMetadata,
    operation: string
  ): void {
    const exists = metadata.columns.some(
      (col) => col.columnName === columnName
    );

    if (!exists) {
      throw new ValidationError(
        `Column '${columnName}' does not exist in table ${metadata.tableName} for ${operation}. ` +
          `Available columns: ${metadata.columns.map((c) => c.columnName).join(', ')}`,
        'columnName',
        columnName,
        { entityName: metadata.tableName, operation }
      );
    }
  }

  /**
   * Validate table name format
   *
   * @param tableName - The table name to validate
   * @throws {ValidationError} If table name format is invalid
   *
   * @example
   * ```typescript
   * IdentifierValidator.validateTableName('users');
   * ```
   */
  public static validateTableName(tableName: string): void {
    this.validateIdentifier(tableName, 'table name');
  }
}
