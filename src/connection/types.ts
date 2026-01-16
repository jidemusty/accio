import type { LoggerConfig } from '@/logger';

export interface ConnectionConfig {
  host: string;
  port?: number;
  database: string;
  user: string;
  password: string;
  logger?: Partial<LoggerConfig>;
}
