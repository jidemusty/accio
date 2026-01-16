import 'reflect-metadata';

import {
  Column,
  connect,
  LogLevel,
  PostgresType,
  PrimaryColumn,
  QueryError,
  Table,
  ValidationError
} from '../src';

@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column({ type: PostgresType.TEXT, nullable: false })
  name!: string;

  @Column({ type: PostgresType.INTEGER, nullable: false })
  age!: number;

  @Column({ type: PostgresType.TEXT, nullable: false })
  city!: string;
}

async function testQueryBuilder() {
  console.log('=== Testing QueryBuilder ===\n');

  const db = connect({
    host: 'localhost',
    database: 'accio_db',
    user: 'accio_db',
    password: 'accio_db',
    logger: {
      level: LogLevel.ERROR,
      logQueries: false
    }
  });

  const userRepo = db.getRepository(User);

  try {
    // Setup: Insert test data
    console.log('Setting up test data...');

    const testUsers = [
      { name: 'Alice', age: 25, city: 'NYC' },
      { name: 'Bob', age: 30, city: 'LA' },
      { name: 'Charlie', age: 25, city: 'NYC' },
      { name: 'Diana', age: 35, city: 'Chicago' },
      { name: 'Eve', age: 25, city: 'LA' }
    ];

    for (const userData of testUsers) {
      const user = new User();
      Object.assign(user, userData);
      await userRepo.insert(user);
    }
    console.log('✅ Inserted 5 test users\n');

    // Test 1: Simple WHERE
    console.log('1. Simple WHERE (age = 25)');
    const query1 = userRepo.where({ age: 25 });
    console.log('   SQL:', query1.toSQL().sql);
    const result1 = await query1.find();
    console.log(`   ✅ Results: ${result1.length} users`);
    result1.forEach((u) =>
      console.log(`      - ${u.name}, ${u.age}, ${u.city}`)
    );

    // Test 2: Multiple WHERE (AND)
    console.log('\n2. Multiple WHERE (age = 25 AND city = NYC)');
    const query2 = userRepo.where({ age: 25 }).where({ city: 'NYC' });
    console.log('   SQL:', query2.toSQL().sql);
    const result2 = await query2.find();
    console.log(`   ✅ Results: ${result2.length} users`);
    result2.forEach((u) =>
      console.log(`      - ${u.name}, ${u.age}, ${u.city}`)
    );

    // Test 3: ORDER BY
    console.log('\n3. ORDER BY age DESC');
    const query3 = userRepo.where({}).orderBy('age', 'DESC');
    const result3 = await query3.find();
    console.log('   ✅ Results (ordered by age DESC):');
    result3.forEach((u) => console.log(`      - ${u.name}, age ${u.age}`));

    // Test 4: LIMIT
    console.log('\n4. LIMIT 2');
    const query4 = userRepo.where({ age: 25 }).limit(2);
    const result4 = await query4.find();
    console.log(`   ✅ Results: ${result4.length} users (limited to 2)`);
    result4.forEach((u) => console.log(`      - ${u.name}`));

    // Test 5: OFFSET
    console.log('\n5. OFFSET 1 LIMIT 2 (pagination)');
    const query5 = userRepo
      .where({ age: 25 })
      .orderBy('name', 'ASC')
      .offset(1)
      .limit(2);
    const result5 = await query5.find();
    console.log(`   ✅ Results: ${result5.length} users`);
    result5.forEach((u) => console.log(`      - ${u.name}`));

    // Test 6: findOne
    console.log('\n6. findOne (first user in NYC)');
    const result6 = await userRepo.where({ city: 'NYC' }).findOne();
    console.log(`   ✅ Result: ${result6 ? result6.name : 'null'}`);

    // Test 7: count
    console.log('\n7. count (age = 25)');
    const count = await userRepo.where({ age: 25 }).count();
    console.log(`   ✅ Count: ${count}`);

    // Test 8: exists
    console.log('\n8. exists (city = Seattle)');
    const exists = await userRepo.where({ city: 'Seattle' }).exists();
    console.log(`   ✅ Exists: ${exists}`);

    // Test 9: IN clause (array values)
    console.log('\n9. IN clause (city IN [NYC, LA])');
    const query9 = userRepo.where({ city: ['NYC', 'LA'] } as any);
    console.log('   SQL:', query9.toSQL().sql);
    const result9 = await query9.find();
    console.log(`   ✅ Results: ${result9.length} users`);
    result9.forEach((u) => console.log(`      - ${u.name}, ${u.city}`));

    // Test 10: Complex query
    console.log(
      '\n10. Complex query (age IN [25, 30] AND city = NYC, ORDER BY name)'
    );
    const query10 = userRepo
      .where({ age: [25, 30] } as any)
      .where({ city: 'NYC' })
      .orderBy('name', 'ASC');
    const result10 = await query10.find();
    console.log(`   ✅ Results: ${result10.length} users`);
    result10.forEach((u) => console.log(`      - ${u.name}, age ${u.age}`));

    // Test 11: Error handling - invalid column name
    console.log('\n11. Testing error handling (invalid column)');
    try {
      await userRepo.where({ invalidColumn: 'test' } as any).find();
      console.log('   ❌ Should have thrown an error');
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('   ✅ Caught ValidationError:', error.message);
      } else {
        console.log('   ❌ Unexpected error type');
      }
    }

    // Test 12: Error handling - invalid limit
    console.log('\n12. Testing error handling (invalid limit)');
    try {
      await userRepo.where({}).limit(-1).find();
      console.log('   ❌ Should have thrown an error');
    } catch (error) {
      if (error instanceof ValidationError) {
        console.log('   ✅ Caught ValidationError:', error.message);
      } else {
        console.log('   ❌ Unexpected error type');
      }
    }

    // Test 13: NULL values
    console.log('\n13. NULL values (testing IS NULL)');
    // First insert a user with null city
    await db.query('INSERT INTO users (name, age, city) VALUES ($1, $2, $3)', [
      'Frank',
      40,
      null
    ]);
    const nullResult = await userRepo.where({ city: null } as any).find();
    console.log(`   ✅ Found ${nullResult.length} users with city = NULL`);
  } catch (error) {
    if (error instanceof QueryError) {
      console.error('❌ Query Error:', error.message);
      console.error('   SQL:', error.sql);
    } else if (error instanceof ValidationError) {
      console.error('❌ Validation Error:', error.message);
      console.error('   Field:', error.field);
    } else {
      console.error('❌ Unexpected Error:', error);
    }
  } finally {
    // Cleanup: Delete test data
    console.log('\nCleaning up...');
    await db.query('TRUNCATE TABLE users RESTART IDENTITY');
    console.log('✅ Cleaned up');

    await db.close();
    console.log('Connection closed');
  }
}

testQueryBuilder().catch(console.error);
