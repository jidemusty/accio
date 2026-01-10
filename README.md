# Accio 🪄

> The summoning charm for Postgres

Accio is a lightweight, type-safe TypeScript ORM for PostgreSQL, built from first principles with a focus on simplicity and developer experience.

[![npm version](https://badge.fury.io/js/accio-orm.svg)](https://www.npmjs.com/package/accio-orm)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✨ **Decorator-based** entity definitions
- 🔒 **Type-safe** queries with TypeScript
- 🎯 **Simple and intuitive** API
- 🔗 **Fluent query builder** with method chaining
- 📦 **Zero dependencies** (except pg and reflect-metadata)
- 🎨 **Data Mapper pattern** for clean architecture
- 🚀 **Connection pooling** built-in
- 💪 **Full CRUD operations** out of the box

## Installation

1. Install the package

```bash
npm install accio-orm
```

2. Install `pg` (postgres driver)

```bash
npm install pg
```

3. Install `reflect-metadata`

```bash
npm install reflect-metadata
```

### Important: Import reflect-metadata

You **must** import `reflect-metadata` once at your application's entry point (before any Accio code runs):

```typescript
// src/index.ts or src/main.ts
import 'reflect-metadata';

// Now you can use Accio
import { connect, Table, Column, PrimaryColumn } from 'accio-orm';
```

**Why?** TypeScript decorators require `reflect-metadata` to be loaded globally before any decorator-decorated classes are loaded. This enables Accio to read metadata from your `@Table` and `@Column` decorators.

**Note:** `pg` (^8.0.0) and `reflect-metadata` (^0.2.2) are peer dependencies and must be installed separately.

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- TypeScript 5+

## Quick Start

### 1. Configure TypeScript

Add these to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 2. Define Your Entity

```typescript
import 'reflect-metadata';
import { Table, Column, PrimaryColumn } from 'accio-orm';

@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  age!: number;

  @Column()
  email!: string;
}
```

### 3. Connect to Database

```typescript
import { connect } from 'accio-orm';

const db = connect({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password'
});
```

### 4. Use the Repository

```typescript
const userRepo = db.getRepository(User);

// Create
const user = new User();
user.name = 'Alice';
user.age = 25;
user.email = 'alice@example.com';
await userRepo.save(user);

// Read
const foundUser = await userRepo.findById(1);
const allUsers = await userRepo.findAll();

// Update
foundUser.age = 26;
await userRepo.save(foundUser);

// Delete
await userRepo.delete(foundUser);
```

## API Documentation

### Decorators

#### `@Table(tableName: string)`

Marks a class as a database entity.

```typescript
@Table('users')
class User {
  // ...
}
```

#### `@PrimaryColumn()`

Marks a property as the primary key column.

```typescript
@PrimaryColumn()
id!: number;
```

#### `@Column(options?)`

Marks a property as a database column.

**Options:**

- `name?: string` - Custom column name (default: property name)
- `nullable?: boolean` - Whether the column can be null (default: true)
- `type?: string` - Database type hint (optional)

```typescript
@Column()
name!: string;

@Column({ name: 'user_email', nullable: false })
email!: string;
```

### Connection

#### `connect(config: ConnectionConfig): Connection`

Creates a connection to the database.

```typescript
const db = connect({
  host: 'localhost',
  port: 5432,
  database: 'mydb',
  user: 'postgres',
  password: 'password',
  max: 10 // optional: max connections in pool
});
```

#### `connection.getRepository<T>(entityClass): Repository<T>`

Gets a repository for an entity.

```typescript
const userRepo = db.getRepository(User);
```

#### `connection.close(): Promise<void>`

Closes all database connections.

```typescript
await db.close();
```

### Repository

#### Basic Operations

**`findById(id): Promise<T | null>`**

Find an entity by its primary key.

```typescript
const user = await userRepo.findById(1);
```

**`findAll(): Promise<T[]>`**

Find all entities.

```typescript
const users = await userRepo.findAll();
```

**`save(entity): Promise<T>`**

Insert or update an entity (smart save).

```typescript
const user = new User();
user.name = 'Bob';
await userRepo.save(user); // Insert

user.age = 30;
await userRepo.save(user); // Update
```

**`insert(entity): Promise<T>`**

Explicitly insert a new entity.

```typescript
await userRepo.insert(user);
```

**`update(entity): Promise<T>`**

Explicitly update an existing entity.

```typescript
await userRepo.update(user);
```

**`delete(entity): Promise<void>`**

Delete an entity.

```typescript
await userRepo.delete(user);
```

**`deleteById(id): Promise<void>`**

Delete by primary key.

```typescript
await userRepo.deleteById(1);
```

**`count(): Promise<number>`**

Count all entities.

```typescript
const total = await userRepo.count();
```

**`exists(id): Promise<boolean>`**

Check if an entity exists by ID.

```typescript
const exists = await userRepo.exists(1);
```

### Query Builder

#### `where(conditions): QueryBuilder<T>`

Add WHERE conditions (can be chained, combined with AND).

```typescript
// Single condition
const users = await userRepo.where({ age: 25 }).find();

// Multiple properties (AND)
const users = await userRepo.where({ age: 25, city: 'NYC' }).find();

// Chain multiple where() calls (AND)
const users = await userRepo.where({ age: 25 }).where({ city: 'NYC' }).find();

// Array values (IN clause)
const users = await userRepo.where({ age: [25, 30, 35] }).find();

// NULL values
const users = await userRepo.where({ middleName: null }).find();
```

#### `orderBy(column, direction?): QueryBuilder<T>`

Order results by a column.

```typescript
const users = await userRepo.where({ age: 25 }).orderBy('name', 'ASC').find();

// DESC order
const users = await userRepo.orderBy('age', 'DESC').find();
```

#### `limit(n): QueryBuilder<T>`

Limit the number of results.

```typescript
const users = await userRepo.where({ age: 25 }).limit(10).find();
```

#### `offset(n): QueryBuilder<T>`

Skip the first N results (for pagination).

```typescript
const users = await userRepo.where({ age: 25 }).offset(20).limit(10).find();
```

#### Terminal Operations

**`find(): Promise<T[]>`**

Execute the query and return all results.

```typescript
const users = await userRepo.where({ age: 25 }).find();
```

**`findOne(): Promise<T | null>`**

Execute the query and return the first result.

```typescript
const user = await userRepo.where({ email: 'alice@example.com' }).findOne();
```

**`count(): Promise<number>`**

Count matching results.

```typescript
const count = await userRepo.where({ age: 25 }).count();
```

**`exists(): Promise<boolean>`**

Check if any results exist.

```typescript
const exists = await userRepo.where({ email: 'alice@example.com' }).exists();
```

**`toSQL(): { sql: string; params: unknown[] }`**

Get the SQL that would be executed (for debugging).

```typescript
const { sql, params } = userRepo.where({ age: 25 }).toSQL();
console.log(sql); // SELECT * FROM users WHERE age = $1
console.log(params); // [25]
```

## Examples

### Pagination

```typescript
const page = 1;
const pageSize = 10;

const users = await userRepo
  .orderBy('name', 'ASC')
  .offset((page - 1) * pageSize)
  .limit(pageSize)
  .find();

const total = await userRepo.count();
const totalPages = Math.ceil(total / pageSize);
```

### Search

```typescript
const results = await userRepo
  .where({ city: 'NYC' })
  .orderBy('age', 'DESC')
  .limit(20)
  .find();
```

### Complex Queries

```typescript
const users = await userRepo
  .where({ age: [25, 30, 35] })
  .where({ city: 'NYC' })
  .orderBy('name', 'ASC')
  .limit(10)
  .find();
```

## Database Setup

Create your tables manually (Accio is schema-agnostic):

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE
);
```

## Design Philosophy

Accio follows the **Data Mapper pattern**, keeping your domain models clean and separate from persistence logic. This means:

- 📦 **Entities are just classes** - no methods for database operations
- 🔧 **Repositories handle persistence** - clear separation of concerns
- 🎯 **Type-safe queries** - TypeScript catches errors at compile time
- 🪶 **Lightweight** - minimal abstractions, close to SQL

## Roadmap

- [ ] Relationships (one-to-many, many-to-many)
- [ ] Transactions support
- [ ] Advanced query operators (LIKE, >, <, !=, OR)
- [ ] Schema migrations
- [ ] Lifecycle hooks (beforeInsert, afterUpdate)
- [ ] Validation decorators
- [ ] Query result caching
- [ ] Soft deletes
- [ ] Automatic timestamps (createdAt, updatedAt)

## Contributing

Contributions are welcome! This is a learning project, so feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

MIT

## Acknowledgments

Built as a learning project to understand ORM internals, design patterns, and TypeScript decorators.

Inspired by TypeORM, Prisma, and other great ORMs in the ecosystem.

---

**Accio!** ⚡ Summon your data with ease.
