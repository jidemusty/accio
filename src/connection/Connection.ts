import { Pool, type QueryResult } from 'pg';

import type { EntityConstructor } from '../metadata/types';
import { Repository } from '../repository/Repository';
import type { ConnectionConfig } from './types';

export class Connection {
  private pool: Pool;

  constructor(config: ConnectionConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port ?? 5432,
      database: config.database,
      user: config.user,
      password: config.password
    });
  }

  /**
   * Get a repository for an entity class
   * @param entityClass
   * @returns
   */
  getRepository<T>(entityClass: new () => T): Repository<T> {
    return new Repository<T>(entityClass as EntityConstructor, this);
  }

  /**
   * Execute a raw SQL query
   */
  async query(sql: string, params?: any[]): Promise<QueryResult> {
    try {
      return await this.pool.query(sql, params);
    } catch (error) {
      // re-throw with context
      throw new Error(
        `Query failed: ${sql}\nError: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      console.log('Connection test failed:', error);
      return false;
    }
  }
}

/**
 * Factory function to create a connection
 */
export function connect(config: ConnectionConfig): Connection {
  return new Connection(config);
}
