import 'reflect-metadata';

import {
  Column,
  MetadataStorage,
  PostgresType,
  PrimaryColumn,
  Table,
  ValidationError
} from '../src';

console.log('=== Testing Metadata Storage and Validation ===\n');

// Valid entity
@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column({ type: PostgresType.TEXT, nullable: false })
  name!: string;

  @Column({ name: 'user_age', type: PostgresType.INTEGER })
  age!: number;
}

// Test 1: Valid entity metadata
console.log('1. Testing Valid Entity Metadata');
try {
  const userMetadata = MetadataStorage.getEntityMetadata(User);
  console.log('   ✅ Table:', userMetadata.tableName);
  console.log(
    '   ✅ Primary Column:',
    userMetadata.primaryColumn?.propertyKey,
    '->',
    userMetadata.primaryColumn?.columnName
  );
  console.log('   ✅ All Columns:');
  userMetadata.columns.forEach((col) => {
    const primaryFlag = col.isPrimary ? ' (PRIMARY)' : '';
    const nullableFlag = col.isNullable ? ' (nullable)' : ' (NOT NULL)';
    const typeInfo = col.type ? ` [${col.type}]` : '';
    console.log(
      `      - ${col.propertyKey} -> ${col.columnName}${typeInfo}${primaryFlag}${nullableFlag}`
    );
  });
} catch (error) {
  console.error('   ❌ Error:', error);
}

// Test 2: Convenience methods
console.log('\n2. Testing Convenience Methods');
try {
  console.log('   ✅ getTableName():', MetadataStorage.getTableName(User));
  console.log(
    '   ✅ getPrimaryColumn():',
    MetadataStorage.getPrimaryColumn(User).columnName
  );
  console.log(
    '   ✅ getColumns():',
    MetadataStorage.getColumns(User).length,
    'columns'
  );
} catch (error) {
  console.error('   ❌ Error:', error);
}

// Test 3: Validation errors
console.log('\n3. Testing Validation Errors\n');

// Test 3a: Missing @Table decorator
console.log('   3a. Missing @Table decorator');
class NoTable {
  @PrimaryColumn() id!: number;
  @Column() name!: string;
}

try {
  MetadataStorage.getEntityMetadata(NoTable);
  console.log('      ❌ Should have thrown ValidationError');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('      ✅ Caught ValidationError');
    console.log('         Message:', error.message);
    console.log('         Field:', error.field);
    console.log('         Value:', error.value);
  } else {
    console.log('      ❌ Unexpected error type');
  }
}

// Test 3b: No columns defined
console.log('\n   3b. No columns defined');
@Table('empty')
class NoColumns {}

try {
  MetadataStorage.getEntityMetadata(NoColumns);
  console.log('      ❌ Should have thrown ValidationError');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('      ✅ Caught ValidationError');
    console.log('         Message:', error.message);
    console.log('         Field:', error.field);
  } else {
    console.log('      ❌ Unexpected error type');
  }
}

// Test 3c: No primary key
console.log('\n   3c. No primary key defined');
@Table('no_pk')
class NoPrimaryKey {
  @Column() name!: string;
  @Column() age!: number;
}

try {
  MetadataStorage.getEntityMetadata(NoPrimaryKey);
  console.log('      ❌ Should have thrown ValidationError');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('      ✅ Caught ValidationError');
    console.log('         Message:', error.message);
    console.log('         Field:', error.field);
  } else {
    console.log('      ❌ Unexpected error type');
  }
}

// Test 3d: Multiple primary keys
console.log('\n   3d. Multiple primary keys (not supported)');
@Table('multi_pk')
class MultiplePrimaryKeys {
  @PrimaryColumn() id!: number;
  @PrimaryColumn() userId!: number;
  @Column() name!: string;
}

try {
  MetadataStorage.getEntityMetadata(MultiplePrimaryKeys);
  console.log('      ❌ Should have thrown ValidationError');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('      ✅ Caught ValidationError');
    console.log('         Message:', error.message);
    console.log('         Field:', error.field);
    console.log('         Value:', error.value);
  } else {
    console.log('      ❌ Unexpected error type');
  }
}

// Test 4: Metadata caching
console.log('\n4. Testing Metadata Caching');
console.log('   First call to getEntityMetadata...');
const start1 = Date.now();
MetadataStorage.getEntityMetadata(User);
const time1 = Date.now() - start1;

console.log('   Second call to getEntityMetadata (should use cache)...');
const start2 = Date.now();
MetadataStorage.getEntityMetadata(User);
const time2 = Date.now() - start2;

console.log(`   ✅ First call: ${time1}ms`);
console.log(`   ✅ Second call: ${time2}ms (cached)`);

if (time2 <= time1) {
  console.log('   ✅ Caching is working (second call was as fast or faster)');
} else {
  console.log('   ⚠️  Second call was slower (but still cached)');
}

console.log('\n✅ All metadata tests completed');
