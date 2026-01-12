/**
 * PostgresSQL column data definitions
 *
 * Provides strict type mapping between TypeScript and PostgreSQL types,
 * ensuring type safety and consistency when defining database columns.
 *
 * @example
 * ```typescript
 * @Column({ type: PostgresType.INTEGER })
 * id!: number;
 *
 * @Column({ type: PostgresType.TEXT })
 * name!: string;
 * ```
 */
export enum PostgresType {
  // Numeric
  SMALLINT = 'SMALLINT',
  INTEGER = 'INTEGER',
  BIGINT = 'BIGINT',
  DECIMAL = 'DECIMAL',
  NUMERIC = 'NUMERIC',
  REAL = 'REAL',
  DOUBLE_PRECISION = 'DOUBLE PRECISION',
  SMALLSERIAL = 'SMALLSERIAL',
  SERIAL = 'SERIAL',
  BIGSERIAL = 'BIGSERIAL',

  // Character
  CHAR = 'CHAR',
  VARCHAR = 'VARCHAR',
  TEXT = 'TEXT',

  // Boolean
  BOOLEAN = 'BOOLEAN',

  // Date / Time
  DATE = 'DATE',
  TIME = 'TIME',
  TIME_WITH_TIMEZONE = 'TIMETZ',
  TIMESTAMP = 'TIMESTAMP',
  TIMESTAMP_WITH_TIMEZONE = 'TIMESTAMPZ',
  INTERVAL = 'INTERVAL',

  // UUID
  UUID = 'UUID',

  // JSON
  JSON = 'JSON',
  JSONB = 'JSONB',

  // Binary
  BYTEA = 'BYTEA',

  // Arrays (generic)
  ARRAY = 'ARRAY'
}

/**
 * Mapping from Typescript types to PostgresSQL types
 *
 * Used for automatic type inference when no explicit type is specified
 */
export const TypeScriptToPostgresMap: Record<string, PostgresType> = {
  number: PostgresType.INTEGER,
  string: PostgresType.TEXT,
  boolean: PostgresType.BOOLEAN,
  Date: PostgresType.TIMESTAMP,
  object: PostgresType.JSONB
};

/**
 * Validates if a string is a valid PostreSQL type
 *
 * @param type - The type string to validate
 * @returns true if the type is a valid PostgreSQL type, false otherwise
 *
 * @example
 * ```typeacript
 * isValidPostgresType('INTEGER'); // true
 * isValidPostgresType('INVALID'); // false
 * ```
 */
export function isValidPostgresType(type: string): boolean {
  return Object.values(PostgresType).includes(type as PostgresType);
}

/**
 * Gets the corresponding PostgresSQL type for a TypeScript type
 *
 * @param tsType - The TypeScript type name (e.g. 'number', 'string', 'boolean', 'Date', 'object')
 * @returns The corresponding PostgresSQL type (e.g. 'INTEGER', 'TEXT', 'BOOLEAN', 'TIMESTAMP', 'JSONB')
 *
 * @example
 * ```typescript
 * getPostgresTypeForTS('number'); // PostgresType.INTEGER
 * getPostgresTypeForTS('string'); // PostgresType.TEXT
 * getPostgresTypeForTS('unknown'); // PostgresType.TEXT
 */
export function getPostgresTypeForTS(tsType: string): PostgresType {
  return TypeScriptToPostgresMap[tsType] ?? PostgresType.TEXT;
}
