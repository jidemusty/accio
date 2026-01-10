import 'reflect-metadata';

import { Column } from '@/decorators/Column';
import { getColumns as getColumnMetadata } from '@/decorators/Column';
import { PrimaryColumn } from '@/decorators/PrimaryColumn';
import { Table } from '@/decorators/Table';
import { getTableName } from '@/decorators/Table';

@Table('users')
class User {
  @PrimaryColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'user_age' })
  age!: number;

  @Column({ nullable: false })
  email!: string;
}

console.log('Table name:', getTableName(User));
console.log('Columns:', getColumnMetadata(User));
