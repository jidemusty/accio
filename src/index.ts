// Connection
export { connect, Connection } from './connection/Connection';
export type { ConnectionConfig } from './connection/types';

// Decorators
export {
  Column,
  type ColumnMetadata,
  type ColumnOptions
} from './decorators/Column';
export { PrimaryColumn } from './decorators/PrimaryColumn';
export { Table } from './decorators/Table';

// Repository
export { Repository } from './repository/Repository';

// Query Builder
export { QueryBuilder } from './query/QueryBuilder';

// Metadata
export { MetadataStorage } from './metadata/MetadataStorage';
export type { EntityMetadata } from './metadata/types';

// Errors
export {
  AccioError,
  ConnectionError,
  DatabaseError,
  QueryError,
  ValidationError
} from './errors';

// Logger
export { Logger, type LoggerConfig, LogLevel } from './logger';

// Types
export {
  getPostgresTypeForTS,
  isValidPostgresType,
  PostgresType
} from './types';
