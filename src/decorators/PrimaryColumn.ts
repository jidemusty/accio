import 'reflect-metadata';

import { type ColumnMetadata, COLUMNS_KEY } from './Column';

/**
 * Decorator to mark a property as the primary key  column
 *
 * Example:
 * @PrimaryColumn
 * id: number
 */
export function PrimaryColumn() {
  return function (
    target: object | undefined,
    propertyKey: string | symbol
  ): void {
    if (!target) {
      throw new Error(
        'PrimaryColumn decorator must be used on an instance property'
      );
    }
    const constructor = target.constructor;

    const columns: ColumnMetadata[] =
      (Reflect.getMetadata(COLUMNS_KEY, constructor) as
        | ColumnMetadata[]
        | undefined) ?? [];

    const key =
      typeof propertyKey === 'symbol' ? propertyKey.toString() : propertyKey;

    columns.push({
      propertyKey: key,
      columnName: key,
      isPrimary: true,
      isNullable: false
    });

    Reflect.defineMetadata(COLUMNS_KEY, columns, constructor);
  };
}
