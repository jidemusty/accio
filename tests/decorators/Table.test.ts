import { describe, expect, it } from 'vitest';

import { getTableName, Table } from '../../src/decorators/Table';

describe('@Table decorator', () => {
  it('should store table name on class', () => {
    @Table('users')
    class User {}

    expect(getTableName(User)).toBe('users');
  });

  it('should return undefined for non-decorated class', () => {
    class NoDecorator {}

    expect(getTableName(NoDecorator)).toBeUndefined();
  });

  it('should work with different table names', () => {
    @Table('posts')
    class Post {}

    @Table('comments')
    class Comment {}

    expect(getTableName(Post)).toBe('posts');
    expect(getTableName(Comment)).toBe('comments');
  });
});
