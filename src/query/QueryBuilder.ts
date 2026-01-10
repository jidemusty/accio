import type { Connection } from '../connection/Connection';
import type { EntityMetadata } from '../metadata/types';
import type { Repository } from '../repository/Repository';

export class QueryBuilder<T> {
  private repository: Repository<T>;
  private connection: Connection;
  private metadata: EntityMetadata;
  private conditions: Partial<T>[] = [];

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

  where(conditions: Partial<T>): this {
    this.conditions.push(conditions);
    return this;
  }

  find(): Promise<T[]> {
    // TODO: Implement proper query building
    throw new Error('QueryBuilder.find() not implemented yet');
  }

  findOne(): Promise<T | null> {
    // TODO: Implement
    throw new Error('QueryBuilder.findOne() not implemented yet');
  }
}
