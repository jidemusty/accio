import { Pool, type QueryResult } from 'pg';

import { ConnectionError, QueryError } from '@/errors';
import { Logger } from '@/logger/Logger';
import { ConnectionValidator } from '@/validation';

import type { EntityConstructor } from '../metadata/types';
import { Repository } from '../repository/Repository';
import type { ConnectionConfig } from './types';

export class Connection {
  private pool: Pool;
  private logger: Logger;

  constructor(config: ConnectionConfig) {
    // validate connection configuration
    ConnectionValidator.validate(config);

    // initialize logger
    this.logger = new Logger(config.logger);

    try {
      this.pool = new Pool({
        host: config.host,
        port: config.port ?? 5432,
        database: config.database,
        user: config.user,
        password: config.password
      });

      this.logger.info('Database connection pool created', {
        host: config.host,
        database: config.database,
        port: config.database ?? 5432
      });
    } catch (error) {
      this.logger.error('Failed to create connection pool', error as Error, {
        host: config.host,
        database: config.database
      });

      throw new ConnectionError(
        'Failed to create database connection pool',
        {
          host: config.host,
          database: config.database,
          port: config.database ?? 5432
        },
        error as Error
      );
    }
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
    const startTime = Date.now();

    try {
      const result = await this.pool.query(sql, params);
      const duration = Date.now() - startTime;

      this.logger.query(sql, params, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Query execution failed', error as Error, {
        sql,
        params,
        duration
      });

      throw new QueryError(
        'Query Execution failed',
        sql,
        params,
        error as Error
      );
    }
  }

  /**
   * Close all connections in the pool
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.logger.info('Database connection pool closed');
    } catch (error) {
      this.logger.error('Failed to close connection pool', error as Error);

      throw new ConnectionError(
        'Failed to close database connection pool',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Test the connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      this.logger.info('Connection test successful');
      return true;
    } catch (error) {
      console.log('Connection test failed:', error);
      this.logger.error('Connection test failed', error as Error);
      return false;
    }
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }
}

/**
 * Factory function to create a connection
 */
export function connect(config: ConnectionConfig): Connection {
  return new Connection(config);
}
