import { connect, ConnectionError, LogLevel, QueryError } from '../src';

async function testConnection() {
  console.log('=== Testing Database Connection ===\n');

  let db;

  try {
    console.log('Creating connection...');

    // Create connection with logger configuration
    db = connect({
      host: 'localhost',
      database: 'accio_db',
      user: 'accio_db',
      password: 'accio_db',
      logger: {
        level: LogLevel.DEBUG, // Show all logs including queries
        logQueries: true,
        logErrors: true
      }
    });

    console.log('✅ Connection pool created\n');

    // Test 1: Connection test
    console.log('1. Testing connection...');
    const isConnected = await db.testConnection();

    if (!isConnected) {
      throw new ConnectionError('Connection test failed');
    }

    console.log('✅ Connection successful\n');

    // Test 2: Simple query
    console.log('2. Querying current time...');
    const result = await db.query('SELECT NOW() as current_time');
    console.log(
      '✅ Current time from database:',
      (result.rows[0] as { current_time: Date }).current_time
    );
    console.log();

    // Test 3: Create table (drop first to ensure clean slate)
    console.log('3. Creating test table...');
    await db.query('DROP TABLE IF EXISTS test_table');
    await db.query(`
      CREATE TABLE test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✅ Test table created\n');

    // Test 4: Insert data
    console.log('4. Inserting test data...');
    await db.query('INSERT INTO test_table (name) VALUES ($1), ($2)', [
      'Test User 1',
      'Test User 2'
    ]);
    console.log('✅ Test data inserted\n');

    // Test 5: Query data
    console.log('5. Querying test data...');
    const users = await db.query('SELECT * FROM test_table ORDER BY id');
    console.log('✅ Query results:');
    users.rows.forEach(
      (row: { id: number; name: string; created_at?: Date }) => {
        console.log(`  - ID: ${row.id}, Name: ${row.name}`);
      }
    );
    console.log();

    // Test 6: Cleanup
    console.log('6. Cleaning up...');
    await db.query('DROP TABLE IF EXISTS test_table');
    console.log('✅ Test table dropped\n');
  } catch (error) {
    // Handle specific error types
    if (error instanceof ConnectionError) {
      console.error('❌ Connection Error:', error.message);
      console.error('   Context:', error.context);
      if (error.cause) {
        console.error('   Cause:', error.cause.message);
      }
    } else if (error instanceof QueryError) {
      console.error('❌ Query Error:', error.message);
      console.error('   SQL:', error.sql);
      console.error('   Params:', error.params);
      if (error.cause) {
        console.error('   Cause:', error.cause.message);
      }
    } else {
      console.error('❌ Unexpected Error:', error);
    }
    process.exit(1);
  } finally {
    // Always close the connection
    if (db) {
      await db.close();
      console.log('Connection closed');
    }
  }
}

testConnection().catch(console.error);
