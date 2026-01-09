import type { ColumnMetadata } from '@/decorators/Column';

export interface EntityMetadata {
  tableName: string;
  columns: ColumnMetadata[];
  primaryColumn?: ColumnMetadata;
}

export type EntityConstructor<T = object> = new (...args: unknown[]) => T;
