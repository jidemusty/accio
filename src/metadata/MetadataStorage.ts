import { type ColumnMetadata, getColumns } from '@/decorators/Column';
import { getTableName } from '@/decorators/Table';
import { ValidationError } from '@/errors';

import type { EntityConstructor, EntityMetadata } from './types';

export class MetadataStorage {
  private static metadataCache = new Map<EntityConstructor, EntityMetadata>();

  /**
   * Extract all metadata from an entity class
   * @param entityClass - The entity class to extract metadata from
   * @returns complete entity metadata
   * @throws Error if entity is missing required decorators
   */
  static getEntityMetadata(entityClass: EntityConstructor): EntityMetadata {
    if (this.metadataCache.has(entityClass)) {
      return this.metadataCache.get(entityClass)!;
    }

    const tableName = getTableName(entityClass);
    if (!tableName) {
      throw new ValidationError(
        `Entity ${entityClass.name} is missing @Table decorator.
        Did you forget to add @Table('table_name') to the class?
        `,
        'decorator',
        '@Table',
        { entityClass: entityClass.name }
      );
    }

    const columns = getColumns(entityClass);
    if (columns.length === 0) {
      throw new ValidationError(
        `Entity ${entityClass.name} has no columns defined.
        Did you forget to add @Column() or @PrimaryColumn() decorators?`,
        'decorator',
        '@Column',
        { entityClass: entityClass.name }
      );
    }

    const primaryColumns = columns.filter((col) => col.isPrimary);
    if (primaryColumns.length === 0) {
      throw new ValidationError(
        `Entity ${entityClass.name} has no primary key defined.
        Add @PrimaryColumn() to one of your properties.`,
        'decorator',
        '@PrimaryColumn',
        { entityClass: entityClass.name }
      );
    }

    if (primaryColumns.length > 1) {
      throw new ValidationError(
        `Entity ${entityClass.name} has multiple primary keys:
        ${primaryColumns.map((c) => c.propertyKey).join(', ')}.
        Only one primary key is supported.`,
        'primarykey',
        primaryColumns.map((c) => c.propertyKey),
        { entityClass: entityClass.name }
      );
    }

    const primaryColumn = primaryColumns[0];

    const metadata: EntityMetadata = {
      tableName,
      columns,
      primaryColumn
    };

    this.metadataCache.set(entityClass, metadata);

    return metadata;
  }

  /**
   * Validate that an entity has all required metadata
   * @param entityClass - the entity class to validate
   * @returns true if valid, throws error otherwise
   */
  static validateEntity(entityClass: EntityConstructor): boolean {
    this.getEntityMetadata(entityClass);
    return true;
  }

  /**
   *
   * @param entityClass
   * @returns get the table name
   */
  static getTableName(entityClass: EntityConstructor): string {
    return this.getEntityMetadata(entityClass).tableName;
  }

  static getColumns(entityClass: EntityConstructor): ColumnMetadata[] {
    return this.getEntityMetadata(entityClass).columns;
  }

  static getPrimaryColumn(entityClass: EntityConstructor): ColumnMetadata {
    const metadata = this.getEntityMetadata(entityClass);

    if (!metadata.primaryColumn) {
      throw new ValidationError(
        `Entity ${entityClass.name} has no primary key ddefined`,
        'primaryKey',
        undefined,
        { entityClass: entityClass.name }
      );
    }

    return metadata.primaryColumn;
  }

  /**
   * Clear the metadata cache (useful for testing)
   */
  static clearCache(): void {
    this.metadataCache.clear();
  }
}
