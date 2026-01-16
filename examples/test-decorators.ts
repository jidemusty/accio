import 'reflect-metadata';

import {
  Column,
  MetadataStorage,
  PostgresType,
  PrimaryColumn,
  Table
} from '../src';

console.log('=== Testing Decorators and PostgreSQL Types ===\n');

// Example 1: Basic entity with PostgreSQL types
@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column({ type: PostgresType.VARCHAR, nullable: false })
  username!: string;

  @Column({ type: PostgresType.TEXT })
  name!: string;

  @Column({ type: PostgresType.INTEGER, name: 'user_age' })
  age!: number;

  @Column({ type: PostgresType.VARCHAR, nullable: false })
  email!: string;
}

console.log('1. Basic User Entity');
const userMetadata = MetadataStorage.getEntityMetadata(User);
console.log('   Table:', userMetadata.tableName);
console.log('   Columns:');
userMetadata.columns.forEach((col) => {
  const primary = col.isPrimary ? ' (PRIMARY KEY)' : '';
  const nullable = col.isNullable ? '' : ' (NOT NULL)';
  const type = col.type ? ` [${col.type}]` : '';
  const mapping =
    col.propertyKey !== col.columnName ? ` -> ${col.columnName}` : '';
  console.log(`   - ${col.propertyKey}${mapping}${type}${primary}${nullable}`);
});

// Example 2: Entity with various PostgreSQL types
@Table('products')
class Product {
  @PrimaryColumn()
  id!: number;

  @Column({ type: PostgresType.TEXT, nullable: false })
  name!: string;

  @Column({ type: PostgresType.TEXT })
  description!: string;

  @Column({ type: PostgresType.DECIMAL })
  price!: number;

  @Column({ type: PostgresType.INTEGER })
  stock!: number;

  @Column({ type: PostgresType.BOOLEAN })
  available!: boolean;

  @Column({ type: PostgresType.JSONB })
  metadata!: Record<string, unknown>;

  @Column({ type: PostgresType.TIMESTAMP })
  createdAt!: Date;

  @Column({ type: PostgresType.UUID })
  externalId!: string;
}

console.log('\n2. Product Entity with Various Types');
const productMetadata = MetadataStorage.getEntityMetadata(Product);
console.log('   Table:', productMetadata.tableName);
console.log('   Columns:');
productMetadata.columns.forEach((col) => {
  const primary = col.isPrimary ? ' (PRIMARY KEY)' : '';
  const type = col.type ? ` [${col.type}]` : '';
  console.log(`   - ${col.propertyKey}${type}${primary}`);
});

// Example 3: Entity with custom column names
@Table('blog_posts')
class BlogPost {
  @PrimaryColumn()
  id!: number;

  @Column({ name: 'post_title', type: PostgresType.VARCHAR, nullable: false })
  title!: string;

  @Column({ name: 'post_content', type: PostgresType.TEXT, nullable: false })
  content!: string;

  @Column({ name: 'author_id', type: PostgresType.INTEGER })
  authorId!: number;

  @Column({ name: 'published_at', type: PostgresType.TIMESTAMP_WITH_TIMEZONE })
  publishedAt!: Date;

  @Column({ name: 'is_published', type: PostgresType.BOOLEAN })
  isPublished!: boolean;

  @Column({ name: 'tags', type: PostgresType.JSONB })
  tags!: string[];
}

console.log('\n3. BlogPost Entity with Custom Column Names');
const blogPostMetadata = MetadataStorage.getEntityMetadata(BlogPost);
console.log('   Table:', blogPostMetadata.tableName);
console.log('   Property -> Column mapping:');
blogPostMetadata.columns.forEach((col) => {
  const primary = col.isPrimary ? ' (PRIMARY KEY)' : '';
  const nullable = col.isNullable ? '' : ' (NOT NULL)';
  const type = col.type ? ` [${col.type}]` : '';
  console.log(
    `   - ${col.propertyKey} -> ${col.columnName}${type}${primary}${nullable}`
  );
});

// Example 4: All supported PostgreSQL types reference
console.log('\n4. All Supported PostgreSQL Types:');
console.log('   Numeric Types:');
console.log('   - PostgresType.SMALLINT, INTEGER, BIGINT');
console.log('   - PostgresType.DECIMAL, NUMERIC');
console.log('   - PostgresType.REAL, DOUBLE_PRECISION');
console.log('   - PostgresType.SMALLSERIAL, SERIAL, BIGSERIAL');
console.log();
console.log('   Character Types:');
console.log('   - PostgresType.VARCHAR, CHAR, TEXT');
console.log();
console.log('   Binary Types:');
console.log('   - PostgresType.BYTEA');
console.log();
console.log('   Date/Time Types:');
console.log('   - PostgresType.TIMESTAMP, TIMESTAMP_WITH_TIMEZONE');
console.log('   - PostgresType.DATE, TIME, TIME_WITH_TIMEZONE');
console.log('   - PostgresType.INTERVAL');
console.log();
console.log('   Boolean Type:');
console.log('   - PostgresType.BOOLEAN');
console.log();
console.log('   JSON Types:');
console.log('   - PostgresType.JSON, JSONB');
console.log();
console.log('   UUID Type:');
console.log('   - PostgresType.UUID');
console.log();
console.log('   Array Type:');
console.log('   - PostgresType.ARRAY');

console.log('\n✅ Decorator examples completed');
