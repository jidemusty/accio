import type { EntityConstructor, EntityMetadata } from '../metadata/types';

/**
 * Maps a database row to an entity instance
 */
export function mapRowToEntity<T>(
  row: Record<string, unknown>,
  entityClass: EntityConstructor,
  metadata: EntityMetadata
): T {
  const entity = new entityClass() as T;

  // Map each column from the database row to the entity property
  metadata.columns.forEach((col) => {
    const value = row[col.columnName];
    (entity as Record<string, unknown>)[col.propertyKey] = value;
  });

  return entity;
}

/**
 * Maps multiple database rows to entity instances
 */
export function mapRowsToEntities<T>(
  rows: Record<string, unknown>[],
  entityClass: EntityConstructor,
  metadata: EntityMetadata
): T[] {
  return rows.map((row) => mapRowToEntity<T>(row, entityClass, metadata));
}
