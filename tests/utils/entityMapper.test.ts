import { describe, expect, it } from 'vitest';

import { Column } from '../../src/decorators/Column';
import { PrimaryColumn } from '../../src/decorators/PrimaryColumn';
import { Table } from '../../src/decorators/Table';
import { MetadataStorage } from '../../src/metadata/MetadataStorage';
import {
  mapRowsToEntities,
  mapRowToEntity
} from '../../src/utils/entityMapper';

describe('entityMapper', () => {
  @Table('users')
  class User {
    @PrimaryColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ name: 'user_age' })
    age!: number;
  }

  const metadata = MetadataStorage.getEntityMetadata(User);

  describe('mapRowToEntity', () => {
    it('should map database row to entity instance', () => {
      const row = { id: 1, name: 'Alice', user_age: 25 };

      const user = mapRowToEntity<User>(row, User, metadata);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(1);
      expect(user.name).toBe('Alice');
      expect(user.age).toBe(25);
    });

    it('should handle null values', () => {
      const row = { id: 1, name: null, user_age: 25 };

      const user = mapRowToEntity<User>(row, User, metadata);

      expect(user.name).toBeNull();
    });
  });

  describe('mapRowsToEntities', () => {
    it('should map multiple rows to entities', () => {
      const rows = [
        { id: 1, name: 'Alice', user_age: 25 },
        { id: 2, name: 'Bob', user_age: 30 }
      ];

      const users = mapRowsToEntities<User>(rows, User, metadata);

      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[1]).toBeInstanceOf(User);
      expect(users[0].name).toBe('Alice');
      expect(users[1].name).toBe('Bob');
    });

    it('should handle empty array', () => {
      const users = mapRowsToEntities<User>([], User, metadata);

      expect(users).toEqual([]);
    });
  });
});
