import type { Connection } from '@/connection/Connection';
import { MetadataStorage } from '@/metadata/MetadataStorage';
import type { EntityConstructor, EntityMetadata } from '@/metadata/types';
import { QueryBuilder } from '@/query/QueryBuilder';

import { mapRowsToEntities, mapRowToEntity } from '../utils/entityMapper';

export class Repository<T> {
  private entityClass: EntityConstructor;
  private connection: Connection;
  private metadata: EntityMetadata;

  constructor(entityClass: EntityConstructor, connection: Connection) {
    this.entityClass = entityClass;
    this.connection = connection;

    // extract and cache metadata on construction
    this.metadata = MetadataStorage.getEntityMetadata(entityClass);
  }

  getConnection(): Connection {
    return this.connection;
  }

  getMetadata(): EntityMetadata {
    return this.metadata;
  }

  getEntityClass(): EntityConstructor {
    return this.entityClass;
  }

  where(conditions: Partial<T>): QueryBuilder<T> {
    return new QueryBuilder<T>(
      this,
      this.connection,
      this.metadata,
      conditions
    );
  }

  async findById(id: unknown): Promise<T | null> {
    if (!this.metadata.primaryColumn) {
      throw new Error(`Entity ${this.entityClass.name} has no primary key`);
    }

    const primaryKey = this.metadata.primaryColumn.columnName;
    const sql = `SELECT * FROM ${this.metadata.tableName} WHERE ${primaryKey} = $1`;
    const result = await this.connection.query(sql, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToEntity<T>(
      result.rows[0] as Record<string, unknown>,
      this.entityClass,
      this.metadata
    );
  }

  /**
   * Find all entities
   */
  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.metadata.tableName}`;
    const result = await this.connection.query(sql);

    return mapRowsToEntities<T>(
      result.rows as Record<string, unknown>[],
      this.entityClass,
      this.metadata
    );
  }

  save(entity: T): Promise<T> {
    if (!this.metadata.primaryColumn) {
      throw new Error(`Entity ${this.entityClass.name} has no primary key`);
    }

    const primaryKey = this.metadata.primaryColumn.columnName;
    const id = (entity as Record<string, unknown>)[primaryKey];

    if (id !== undefined && id !== null) {
      return this.update(entity);
    } else {
      return this.insert(entity);
    }
  }

  /**
   * Insert a new entity
   */
  async insert(entity: T): Promise<T> {
    const columns = this.metadata.columns.filter((col) => !col.isPrimary);

    if (columns.length === 0) {
      throw new Error(
        `Entity ${this.entityClass.name} has no columns to insert (only primary key)`
      );
    }

    const columnNames = columns.map((col) => col.columnName).join(', ');
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const values = columns.map(
      (col) => (entity as Record<string, unknown>)[col.propertyKey]
    );

    const sql = `
      INSERT INTO ${this.metadata.tableName} (${columnNames})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.connection.query(sql, values);
    return mapRowToEntity<T>(
      result.rows[0] as Record<string, unknown>,
      this.entityClass,
      this.metadata
    );
  }

  /**
   * Update an existing entity
   */
  async update(entity: T): Promise<T> {
    if (!this.metadata.primaryColumn) {
      throw new Error(`Entity ${this.entityClass.name} has no primary key`);
    }

    const columns = this.metadata.columns.filter((col) => !col.isPrimary);
    if (columns.length === 0) {
      throw new Error(
        `Entity ${this.entityClass.name} has no columns to update (only primary key)`
      );
    }

    const primaryKey = this.metadata.primaryColumn.columnName;
    const primaryValue = (entity as Record<string, unknown>)[
      this.metadata.primaryColumn.propertyKey
    ];

    // Build SET clause: column1 = $1, column2 = $2, ...
    const setClause = columns
      .map((col, i) => `${col.columnName} = $${i + 1}`)
      .join(', ');

    const values = columns.map(
      (col) => (entity as Record<string, unknown>)[col.propertyKey]
    );

    const sql = `
      UPDATE ${this.metadata.tableName}
      SET ${setClause}
      WHERE ${primaryKey} = $${columns.length + 1}
      RETURNING *
    `;

    const result = await this.connection.query(sql, [...values, primaryValue]);

    if (result.rows.length === 0) {
      throw new Error(
        `Update failed: Entity with ${primaryKey} = ${String(primaryValue)} not found`
      );
    }

    return mapRowToEntity<T>(
      result.rows[0] as Record<string, unknown>,
      this.entityClass,
      this.metadata
    );
  }

  /**
   * Delete an entity
   */
  async delete(entity: T): Promise<void> {
    if (!this.metadata.primaryColumn) {
      throw new Error(`Entity ${this.entityClass.name} has no primary key`);
    }

    const primaryKey = this.metadata.primaryColumn.columnName;
    const primaryValue = (entity as Record<string, unknown>)[
      this.metadata.primaryColumn.propertyKey
    ];

    if (primaryValue === undefined || primaryValue === null) {
      throw new Error(
        `Cannot delete entity: primary key ${primaryKey} is ${primaryValue}`
      );
    }

    const sql = `DELETE FROM ${this.metadata.tableName} WHERE ${primaryKey} = $1`;
    await this.connection.query(sql, [primaryValue]);
  }

  /**
   * Delete by primary key
   */
  async deleteById(id: unknown): Promise<void> {
    if (!this.metadata.primaryColumn) {
      throw new Error(`Entity ${this.entityClass.name} has no primary key`);
    }

    const primaryKey = this.metadata.primaryColumn.columnName;
    const sql = `DELETE FROM ${this.metadata.tableName} WHERE ${primaryKey} = $1`;

    await this.connection.query(sql, [id]);
  }

  /**
   * Count all entities
   */
  async count(): Promise<number> {
    const sql = `SELECT COUNT(*) as count FROM ${this.metadata.tableName}`;
    const result = await this.connection.query(sql);

    const row = result.rows[0] as Record<string, unknown>;
    return parseInt(String(row.count), 10);
  }

  /**
   * Check if entity exists by primary key
   */
  async exists(id: unknown): Promise<boolean> {
    if (!this.metadata.primaryColumn) {
      throw new Error(`Entity ${this.entityClass.name} has no primary key`);
    }

    const primaryKey = this.metadata.primaryColumn.columnName;
    const sql = `SELECT 1 FROM ${this.metadata.tableName} WHERE ${primaryKey} = $1 LIMIT 1`;

    const result = await this.connection.query(sql, [id]);
    return result.rows.length > 0;
  }
}
