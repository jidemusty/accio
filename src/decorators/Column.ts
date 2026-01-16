import 'reflect-metadata';

import type { PostgresType } from '@/types';

export const COLUMNS_KEY = Symbol('table:columns');

export interface ColumnOptions {
  name?: string;
  type?: PostgresType | string;
  nullable?: boolean;
}

export interface ColumnMetadata {
  propertyKey: string;
  columnName: string;
  type?: PostgresType | string;
  isNullable?: boolean;
  isPrimary: boolean;
}

/**
 * Decorator to mark a property as a database column
 */
export function Column(options: ColumnOptions = {}) {
  return function (
    target: object, // The prototype
    propertyKey: string | symbol // The property name
  ): void {
    // target is the prototype, target.constructor is the class
    const constructor = target.constructor;

    const columns: ColumnMetadata[] =
      (Reflect.getMetadata(COLUMNS_KEY, constructor) as
        | ColumnMetadata[]
        | undefined) ?? [];

    const key =
      typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;

    columns.push({
      propertyKey: key,
      columnName: options.name ?? key,
      type: options.type,
      isNullable: options.nullable ?? true,
      isPrimary: false
    });

    Reflect.defineMetadata(COLUMNS_KEY, columns, constructor);
  };
}

/**
 * helper to retrieve all columns from a class
 */
export function getColumns(
  target: new (...args: unknown[]) => object
): ColumnMetadata[] {
  return (
    (Reflect.getMetadata(COLUMNS_KEY, target) as
      | ColumnMetadata[]
      | undefined) ?? []
  );
}
