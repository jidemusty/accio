/**
 * Error classes for Accio ORM
 *
 * All errors extend from AccioError, which provides error chaining,
 * context tracking, and structured error information
 */

export { AccioError } from './AccioError';
export { ConnectionError } from './ConnectionError';
export { DatabaseError } from './DatabaseError';
export { QueryError } from './QueryError';
export { ValidationError } from './ValidationError';
