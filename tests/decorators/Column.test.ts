import { describe, expect, it } from 'vitest';

import { Column, getColumns } from '../../src/decorators/Column';
import { PrimaryColumn } from '../../src/decorators/PrimaryColumn';

describe('@Column decorator', () => {
  it('should store column metadata', () => {
    class User {
      @Column()
      name!: string;
    }

    const columns = getColumns(User);
    expect(columns).toHaveLength(1);
    expect(columns[0]).toMatchObject({
      propertyKey: 'name',
      columnName: 'name',
      isPrimary: false
    });
  });

  it('should support custom column names', () => {
    class User {
      @Column({ name: 'user_email' })
      email!: string;
    }

    const columns = getColumns(User);
    expect(columns[0].columnName).toBe('user_email');
    expect(columns[0].propertyKey).toBe('email');
  });

  it('should store multiple columns', () => {
    class User {
      @PrimaryColumn()
      id!: number;

      @Column()
      name!: string;

      @Column()
      age!: number;
    }

    const _columns = getColumns(User);
    expect(_columns).toHaveLength(3);
  });

  it('should handle nullable option', () => {
    class User {
      @Column({ nullable: false })
      email!: string;
    }

    const columns = getColumns(User);
    expect(columns[0].isNullable).toBe(false);
  });
});
