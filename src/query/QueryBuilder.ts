import type { Connection } from '../connection/Connection';
import type { EntityMetadata } from '../metadata/types';
import type { Repository } from '../repository/Repository';
import { mapRowsToEntities } from '../utils/entityMapper';

export class QueryBuilder<T> {
  private repository: Repository<T>;
  private connection: Connection;
  private metadata: EntityMetadata;
  private conditions: Partial<T>[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private orderByColumn?: string;
  private orderDirection: 'ASC' | 'DESC' = 'ASC';

  constructor(
    repository: Repository<T>,
    connection: Connection,
    metadata: EntityMetadata,
    initialConditions?: Partial<T>
  ) {
    this.repository = repository;
    this.connection = connection;
    this.metadata = metadata;

    if (initialConditions) {
      this.conditions.push(initialConditions);
    }
  }

  /**
   * Map a database row to an entity instance
   * @private
   */
  private mapRowToEntity(row: Record<string, unknown>): T {
    // Get the entity class from the repository
    const entityClass = this.repository.getEntityClass();
    const entity = new entityClass() as T;

    // Map each column from the database row to the entity property
    this.metadata.columns.forEach((col) => {
      const value = row[col.columnName];
      (entity as Record<string, unknown>)[col.propertyKey] = value;
    });

    return entity;
  }

  /**
   * Add WHERE conditions (can be chained multiple times)
   * Multiple calls to where() are combined with AND
   */
  where(conditions: Partial<T>): this {
    this.conditions.push(conditions);
    return this;
  }

  /**
   * Set the maximum number of results to return
   */
  limit(value: number): this {
    if (value < 0) {
      throw new Error('Limit must be a positive number');
    }

    this.limitValue = value;
    return this;
  }

  /**
   * Set the number of results to skip
   */
  offset(value: number): this {
    if (value < 0) {
      throw new Error('Offset must be a positive number');
    }
    this.offsetValue = value;
    return this;
  }

  /**
   * Order results by a column
   */
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    // Validate that the column exists
    const columnMeta = this.metadata.columns.find(
      (col) => col.propertyKey === column
    );

    if (!columnMeta) {
      throw new Error(
        `Column '${column}' does not exist on entity. ` +
          `Available columns: ${this.metadata.columns.map((c) => c.propertyKey).join(', ')}`
      );
    }

    this.orderByColumn = columnMeta.columnName;
    this.orderDirection = direction;
    return this;
  }

  /**
   * Execute the query and return all matching results
   */
  async find(): Promise<T[]> {
    const { sql, params } = this.buildSQL();
    const result = await this.connection.query(sql, params);

    // Get entity class from repository
    const entityClass = this.repository.getEntityClass();

    return mapRowsToEntities<T>(
      result.rows as Record<string, unknown>[],
      entityClass,
      this.metadata
    );
  }

  /**
   * Execute the query and return the first result (or null)
   */
  async findOne(): Promise<T | null> {
    // Automatically add LIMIT 1 for performance
    this.limit(1);

    const results = await this.find();
    return results[0] || null;
  }

  /**
   * Count the number of results that match the query
   */
  async count(): Promise<number> {
    const { sql: baseSQL, params } = this.buildSQL(true); // true = count mode

    // Replace SELECT * with SELECT COUNT(*)
    const sql = baseSQL.replace(
      `SELECT * FROM ${this.metadata.tableName}`,
      `SELECT COUNT(*) as count FROM ${this.metadata.tableName}`
    );

    const result = await this.connection.query(sql, params);
    const row = result.rows[0] as Record<string, unknown>;
    return parseInt(String(row.count), 10);
  }

  /**
   * Check if any results exist matching the query
   */
  async exists(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  /**
   * Build the SQL query and parameters
   * @private
   */
  private buildSQL(skipLimitOffset = false): {
    sql: string;
    params: unknown[];
  } {
    let sql = `SELECT * FROM ${this.metadata.tableName}`;
    const params: unknown[] = [];

    // build where clause;
    if (this.conditions.length > 0) {
      const whereClauses: string[] = [];

      this.conditions.forEach((condition) => {
        Object.entries(condition).forEach(([key, value]) => {
          // find column metadata for this property
          const column = this.metadata.columns.find(
            (col) => col.propertyKey === key
          );

          if (!column) {
            throw new Error(
              `Property '${key}' does not exist on entity ${this.metadata.tableName}. ` +
                `Available properties: ${this.metadata.columns.map((c) => c.propertyKey).join(', ')}`
            );
          }

          // Hanfle different value types
          if (value === null) {
            whereClauses.push(`${column.columnName} IS NULL`);
          } else if (Array.isArray(value)) {
            // IN clause: WHERE column IN ($1, $2, $3)
            if (value.length === 0) {
              whereClauses.push('1 = 0');
            } else {
              const placeholders = value
                .map((v) => {
                  params.push(v);
                  return `$${params.length}`;
                })
                .join(', ');

              whereClauses.push(`${column.columnName} IN (${placeholders})`);
            }
          } else {
            // regular equality: WHERE column = $1
            params.push(value);
            whereClauses.push(`${column.columnName} = $${params.length}`);
          }
        });
      });

      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }

      // Add ORDER BY
      if (this.orderByColumn) {
        sql += ` ORDER BY ${this.orderByColumn} ${this.orderDirection}`;
      }

      // Add LIMIT and OFFSET (skip for count queries)
      if (!skipLimitOffset) {
        if (this.limitValue !== undefined) {
          sql += ` LIMIT ${this.limitValue}`;
        }

        if (this.offsetValue !== undefined) {
          sql += ` OFFSET ${this.offsetValue}`;
        }
      }
    }

    return { sql, params };
  }

  /**
   * Get the SQL query that would be executed (for debugging)
   */
  toSQL(): { sql: string; params: unknown[] } {
    return this.buildSQL();
  }
}
