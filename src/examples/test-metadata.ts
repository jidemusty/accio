import 'reflect-metadata';

import { Column } from '../decorators/Column';
import { PrimaryColumn } from '../decorators/PrimaryColumn';
import { Table } from '../decorators/Table';
import { MetadataStorage } from '../metadata/MetadataStorage';

// Valid entity
@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'user_age' })
  age!: number;
}

// Test valid entity
console.log('=== Testing Valid Entity ===');
const userMetadata = MetadataStorage.getEntityMetadata(User);
console.log('Table:', userMetadata.tableName);
console.log('Primary Column:', userMetadata.primaryColumn);
console.log('All Columns:');
userMetadata.columns.forEach((col) => {
  console.log(
    `  - ${col.propertyKey} → ${col.columnName} (primary: ${col.isPrimary})`
  );
});

// Test convenience methods
console.log('\n=== Convenience Methods ===');
console.log('Table name:', MetadataStorage.getTableName(User));
console.log('Primary column:', MetadataStorage.getPrimaryColumn(User));

// Test validation errors
console.log('\n=== Testing Validation Errors ===');

// Missing @Table
class NoTable {
  @PrimaryColumn() id!: number;
}

try {
  MetadataStorage.getEntityMetadata(NoTable);
} catch (error) {
  console.log('✓ Caught missing @Table:', (error as Error).message);
}

// No columns
@Table('empty')
class NoColumns {}

try {
  MetadataStorage.getEntityMetadata(NoColumns);
} catch (error) {
  console.log('✓ Caught no columns:', (error as Error).message);
}

// No primary key
@Table('no_pk')
class NoPrimaryKey {
  @Column() name!: string;
}

try {
  MetadataStorage.getEntityMetadata(NoPrimaryKey);
} catch (error) {
  console.log('✓ Caught no primary key:', (error as Error).message);
}

// Multiple primary keys
@Table('multi_pk')
class MultiplePrimaryKeys {
  @PrimaryColumn() id!: number;
  @PrimaryColumn() userId!: number;
}

try {
  MetadataStorage.getEntityMetadata(MultiplePrimaryKeys);
} catch (error) {
  console.log('✓ Caught multiple primary keys:', (error as Error).message);
}
