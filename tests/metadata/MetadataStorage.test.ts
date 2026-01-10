import { describe, expect, it } from 'vitest';

import { Column } from '../../src/decorators/Column';
import { PrimaryColumn } from '../../src/decorators/PrimaryColumn';
import { Table } from '../../src/decorators/Table';
import { MetadataStorage } from '../../src/metadata/MetadataStorage';

describe('MetadataStorage', () => {
  it('should extract complete entity metadata', () => {
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

    expect(metadata.tableName).toBe('users');
    expect(metadata.columns).toHaveLength(3);
    expect(metadata.primaryColumn).toBeDefined();
    expect(metadata.primaryColumn?.propertyKey).toBe('id');
  });

  it('should throw error for missing @Table decorator', () => {
    class NoTable {
      @PrimaryColumn()
      id!: number;
    }

    expect(() => MetadataStorage.getEntityMetadata(NoTable)).toThrow(
      'missing @Table decorator'
    );
  });

  it('should throw error for missing columns', () => {
    @Table('empty')
    class NoColumns {}

    expect(() => MetadataStorage.getEntityMetadata(NoColumns)).toThrow(
      'has no columns defined'
    );
  });

  it('should throw error for missing primary key', () => {
    @Table('no_pk')
    class NoPrimaryKey {
      @Column()
      name!: string;
    }

    expect(() => MetadataStorage.getEntityMetadata(NoPrimaryKey)).toThrow(
      'has no primary key defined'
    );
  });

  it('should throw error for multiple primary keys', () => {
    @Table('multi_pk')
    class MultiplePrimaryKeys {
      @PrimaryColumn()
      id!: number;

      @PrimaryColumn()
      userId!: number;
    }

    expect(() =>
      MetadataStorage.getEntityMetadata(MultiplePrimaryKeys)
    ).toThrow('multiple primary keys');
  });
});
