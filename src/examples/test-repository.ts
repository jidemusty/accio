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
}

async function testRepository() {
  console.log('=== Testing Repository ===\n');

  // Connect to database
  const db = connect({
    host: 'localhost',
    database: 'accio_db',
    user: 'accio_db',
    password: 'accio_db'
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
    console.log('✓ Inserted user:', savedUser);

    // Test 2: Find by ID
    console.log('\n2. Testing FIND BY ID...');
    const foundUser = await userRepo.findById(savedUser.id);
    console.log('✓ Found user:', foundUser);

    // Test 3: Update
    console.log('\n3. Testing UPDATE...');
    if (foundUser) {
      foundUser.age = 26;
      const updatedUser = await userRepo.update(foundUser);
      console.log('✓ Updated user:', updatedUser);
    }

    // Test 4: Save (should update since ID exists)
    console.log('\n4. Testing SAVE (update)...');
    if (foundUser) {
      foundUser.name = 'Alice Updated';
      const savedAgain = await userRepo.save(foundUser);
      console.log('✓ Saved user:', savedAgain);
    }

    // Test 5: Save (should insert since no ID)
    console.log('\n5. Testing SAVE (insert)...');
    const anotherUser = new User();
    anotherUser.name = 'Bob';
    anotherUser.age = 30;
    const insertedViaSave = await userRepo.save(anotherUser);
    console.log('✓ Inserted via save:', insertedViaSave);

    // Test 6: Find all
    console.log('\n6. Testing FIND ALL...');
    const allUsers = await userRepo.findAll();
    console.log(`✓ Found ${allUsers.length} users:`, allUsers);

    // Test 7: Count
    console.log('\n7. Testing COUNT...');
    const count = await userRepo.count();
    console.log(`✓ Total users: ${count}`);

    // Test 8: Exists
    console.log('\n8. Testing EXISTS...');
    const exists = await userRepo.exists(savedUser.id);
    console.log(`✓ User ${savedUser.id} exists:`, exists);
    const notExists = await userRepo.exists(99999);
    console.log(`✓ User 99999 exists:`, notExists);

    // Test 9: Delete
    console.log('\n9. Testing DELETE...');
    await userRepo.delete(savedUser);
    console.log('✓ Deleted user');

    const deletedUser = await userRepo.findById(savedUser.id);
    console.log('✓ User after delete:', deletedUser);

    // Test 10: Delete by ID
    console.log('\n10. Testing DELETE BY ID...');
    await userRepo.deleteById(insertedViaSave.id);
    console.log('✓ Deleted by ID');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.close();
    console.log('\nConnection closed');
  }
}

testRepository().catch(console.error);
