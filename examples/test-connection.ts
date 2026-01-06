import { connect } from '../src/connection/Connection';

async function testConnection() {
  console.log('creating connection...');

  const db = connect({
    host: 'localhost',
    database: 'accio_db',
    user: 'accio_db',
    password: 'accio_db',
  });

  console.log('testing connection...');

  const isConnected = await db.testConnection();

  if (isConnected) {
    console.log('✅ connection successfull');

    const result = await db.query('SELECT NOW()');
    console.log('current time from database:', result.rows[0].now);

    await db.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        if SERIAL PRIMARY KEY,
        name TEXT
      )
    `);
    console.log('✅ created test table');

    await db.query('INSERT INTO test_table (name) VALUES ($1)', ['Test User']);
    console.log('✅ inserted test data');

    const users = await db.query('SELECT * FROM test_table');
    console.log('✅ query resylts:', users.rows);
  } else {
    console.log('❌ connection failed');
  }

  await db.close();
  console.log('connection closed');
}

testConnection().catch(console.error);
