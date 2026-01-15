import type { ConnectionConfig } from '@/connection/types';
import { ValidationError } from '@/errors';

/**
 * Validates connection configuration
 *
 * Ensures all required connection parameters are provided and valid
 * beforre attempting to establish a database connection.
 *
 * @example
 * ```typescript
 * try {
 *   ConnectioValidator.validate(config);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error(`Invalid config: ${error.field}`);
 *   }
 * }
 * ```
 */
export class ConnectionValidator {
  /**
   * Validate connection configuration
   *
   * @param config - The connection configuration to validate
   * @throws {ValidationError} if any configuration parameter is invalid
   */
  public static validate(config: ConnectionConfig): void {
    if (
      !config.host ||
      typeof config.host !== 'string' ||
      config.host.trim() === ''
    ) {
      throw new ValidationError(
        'Connection host must be a non-empty string',
        'host',
        config.host
      );
    }

    if (
      !config.database ||
      typeof config.database !== 'string' ||
      config.database.trim() === ''
    ) {
      throw new ValidationError(
        'Database name must be a non-empty string',
        'database',
        config.database
      );
    }

    if (
      !config.user ||
      typeof config.user !== 'string' ||
      config.user.trim() === ''
    ) {
      throw new ValidationError(
        'Database user must be a non-empty string',
        'user',
        config.user
      );
    }

    if (!config.password || typeof config.password !== 'string') {
      throw new ValidationError(
        'Database password must be a non-empty string',
        'password',
        '[REDACTED]'
      );
    }

    if (config.port !== undefined) {
      if (typeof config.port !== 'number' || !Number.isInteger(config.port)) {
        throw new ValidationError(
          'Port must be an integer',
          'port',
          config.port
        );
      }

      if (config.port < 1 || config.port > 65535) {
        throw new ValidationError(
          'Port must be between 1 and 65535',
          'port',
          config.port
        );
      }
    }
  }
}
