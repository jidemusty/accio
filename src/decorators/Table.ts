import 'reflect-metadata';

const TABLE_NAME_KEY = Symbol('table:name');

/**
 * Decorator to mark a class as a database table
 * @param tableName - The name of the database table
 */
export function Table(tableName: string) {
  return function <T extends new (...args: unknown[]) => object>(target: T) {
    Reflect.defineMetadata(TABLE_NAME_KEY, tableName, target);
  };
}

/**
 * helper to retrieve the table name from a class
 */
export function getTableName(
  target: new (...args: unknown[]) => object
): string | undefined {
  return Reflect.getMetadata(TABLE_NAME_KEY, target) as string | undefined;
}
