import 'reflect-metadata';

import {
  Column,
  connect,
  DatabaseError,
  LogLevel,
  PostgresType,
  PrimaryColumn,
  QueryError,
  Table
} from '../src';

@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column({ type: PostgresType.TEXT, nullable: false })
  name!: string;

  @Column({ type: PostgresType.INTEGER, nullable: false })
  age!: number;
}

async function testRepository() {
  console.log('=== Testing Repository Operations ===\n');

  // Connect to database with minimal logging for cleaner output
  const db = connect({
    host: 'localhost',
    database: 'accio_db',
    user: 'accio_db',
    password: 'accio_db',
    logger: {
      level: LogLevel.ERROR, // Only show errors
      logQueries: false
    }
  });

  // Get repository
  const userRepo = db.getRepository(User);

  try {
    // Test 1: Insert a new user
    console.log('1. Testing INSERT...');
    const newUser = new User();
    newUser.name = 'Alice';
    newUser.age = 25;

    const savedUser = await userRepo.insert(newUser);
    console.log('✅ Inserted user:', {
      id: savedUser.id,
      name: savedUser.name,
      age: savedUser.age
    });

    // Test 2: Find by ID
    console.log('\n2. Testing FIND BY ID...');
    const foundUser = await userRepo.findById(savedUser.id);
    if (foundUser) {
      console.log('✅ Found user:', {
        id: foundUser.id,
        name: foundUser.name,
        age: foundUser.age
      });
    } else {
      console.log('❌ User not found');
    }

    // Test 3: Update
    console.log('\n3. Testing UPDATE...');
    if (foundUser) {
      foundUser.age = 26;
      const updatedUser = await userRepo.update(foundUser);
      console.log('✅ Updated user:', {
        id: updatedUser.id,
        name: updatedUser.name,
        age: updatedUser.age
      });
    }

    // Test 4: Save (should update since ID exists)
    console.log('\n4. Testing SAVE (update existing)...');
    if (foundUser) {
      foundUser.name = 'Alice Updated';
      const savedAgain = await userRepo.save(foundUser);
      console.log('✅ Saved user:', {
        id: savedAgain.id,
        name: savedAgain.name,
        age: savedAgain.age
      });
    }

    // Test 5: Save (should insert since no ID)
    console.log('\n5. Testing SAVE (insert new)...');
    const anotherUser = new User();
    anotherUser.name = 'Bob';
    anotherUser.age = 30;
    const insertedViaSave = await userRepo.save(anotherUser);
    console.log('✅ Inserted via save:', {
      id: insertedViaSave.id,
      name: insertedViaSave.name,
      age: insertedViaSave.age
    });

    // Test 6: Find all
    console.log('\n6. Testing FIND ALL...');
    const allUsers = await userRepo.findAll();
    console.log(`✅ Found ${allUsers.length} users:`);
    allUsers.forEach((u) => console.log(`   - ${u.name}, age ${u.age}`));

    // Test 7: Count
    console.log('\n7. Testing COUNT...');
    const count = await userRepo.count();
    console.log(`✅ Total users: ${count}`);

    // Test 8: Exists
    console.log('\n8. Testing EXISTS...');
    const exists = await userRepo.exists(savedUser.id);
    console.log(`✅ User ${savedUser.id} exists: ${exists}`);
    const notExists = await userRepo.exists(99999);
    console.log(`✅ User 99999 exists: ${notExists}`);

    // Test 9: Delete
    console.log('\n9. Testing DELETE...');
    await userRepo.delete(savedUser);
    console.log('✅ Deleted user');

    const deletedUser = await userRepo.findById(savedUser.id);
    console.log(
      `✅ User after delete: ${deletedUser === null ? 'null (not found)' : 'found'}`
    );

    // Test 10: Delete by ID
    console.log('\n10. Testing DELETE BY ID...');
    await userRepo.deleteById(insertedViaSave.id);
    console.log('✅ Deleted user by ID');

    // Test 11: Error handling - try to update non-existent user
    console.log('\n11. Testing error handling (update non-existent user)...');
    try {
      const nonExistentUser = new User();
      nonExistentUser.id = 99999;
      nonExistentUser.name = 'Ghost';
      nonExistentUser.age = 0;
      await userRepo.update(nonExistentUser);
      console.log('❌ Should have thrown an error');
    } catch (error) {
      if (error instanceof DatabaseError) {
        console.log('✅ Caught DatabaseError:', error.message);
      } else {
        console.log('❌ Unexpected error type:', error);
      }
    }
  } catch (error) {
    if (error instanceof QueryError) {
      console.error('❌ Query Error:', error.message);
      console.error('   SQL:', error.sql);
      console.error('   Params:', error.params);
    } else if (error instanceof DatabaseError) {
      console.error('❌ Database Error:', error.message);
      console.error('   Detail:', error.detail);
    } else {
      console.error('❌ Unexpected Error:', error);
    }
  } finally {
    await db.close();
    console.log('\nConnection closed');
  }
}

testRepository().catch(console.error);
