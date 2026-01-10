import 'reflect-metadata';

import { connect } from '../connection/Connection';
import { Column } from '../decorators/Column';
import { PrimaryColumn } from '../decorators/PrimaryColumn';
import { Table } from '../decorators/Table';

@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  age!: number;

  @Column()
  city!: string;
}

async function testQueryBuilder() {
  console.log('=== Testing QueryBuilder ===\n');

  const db = connect({
    host: 'localhost',
    database: 'accio_db',
    user: 'accio_db',
    password: 'accio_db'
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
    console.log('✓ Inserted test data\n');

    // Test 1: Simple WHERE
    console.log('1. Simple WHERE (age = 25)');
    const query1 = userRepo.where({ age: 25 });
    console.log('SQL:', query1.toSQL());
    const result1 = await query1.find();
    console.log('✓ Results:', result1.length, 'users');
    result1.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));

    // Test 2: Multiple WHERE (AND)
    console.log('\n2. Multiple WHERE (age = 25 AND city = NYC)');
    const query2 = userRepo.where({ age: 25 }).where({ city: 'NYC' });
    console.log('SQL:', query2.toSQL());
    const result2 = await query2.find();
    console.log('✓ Results:', result2.length, 'users');
    result2.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));

    // Test 3: ORDER BY
    console.log('\n3. ORDER BY age DESC');
    const query3 = userRepo.where({ city: 'NYC' }).orderBy('age', 'DESC');
    console.log('SQL:', query3.toSQL());
    const result3 = await query3.find();
    console.log('✓ Results:');
    result3.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));

    // Test 4: LIMIT
    console.log('\n4. LIMIT 2');
    const query4 = userRepo.where({ age: 25 }).limit(2);
    console.log('SQL:', query4.toSQL());
    const result4 = await query4.find();
    console.log('✓ Results:', result4.length, 'users');
    result4.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));

    // Test 5: OFFSET
    console.log('\n5. OFFSET 1 LIMIT 2');
    const query5 = userRepo.where({ age: 25 }).offset(1).limit(2);
    console.log('SQL:', query5.toSQL());
    const result5 = await query5.find();
    console.log('✓ Results:', result5.length, 'users');
    result5.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));

    // Test 6: findOne
    console.log('\n6. findOne (first user in NYC)');
    const query6 = userRepo.where({ city: 'NYC' });
    console.log('SQL:', query6.toSQL());
    const result6 = await query6.findOne();
    console.log('✓ Result:', result6);

    // Test 7: count
    console.log('\n7. count (age = 25)');
    const count = await userRepo.where({ age: 25 }).count();
    console.log('✓ Count:', count);

    // Test 8: exists
    console.log('\n8. exists (city = Seattle)');
    const exists = await userRepo.where({ city: 'Seattle' }).exists();
    console.log('✓ Exists:', exists);

    // Test 9: IN clause (array values)
    console.log('\n9. IN clause (city IN [NYC, LA])');
    const query9 = userRepo.where({ city: ['NYC', 'LA'] } as any);
    console.log('SQL:', query9.toSQL());
    const result9 = await query9.find();
    console.log('✓ Results:', result9.length, 'users');
    result9.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));

    // Test 10: Complex query
    console.log(
      '\n10. Complex query (age IN [25, 30] AND city = NYC, ORDER BY name)'
    );
    const query10 = userRepo
      .where({ age: [25, 30] } as any)
      .where({ city: 'NYC' })
      .orderBy('name', 'ASC');
    console.log('SQL:', query10.toSQL());
    const result10 = await query10.find();
    console.log('✓ Results:', result10.length, 'users');
    result10.forEach((u) => console.log(`  - ${u.name}, ${u.age}, ${u.city}`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cleanup: Delete test data
    console.log('\nCleaning up...');
    await db.query('TRUNCATE TABLE users RESTART IDENTITY');
    console.log('✓ Cleaned up');

    await db.close();
    console.log('Connection closed');
  }
}

testQueryBuilder().catch(console.error);
