import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRecord } from '../user/user.entity';
import { Account, User } from '@caretaker/caretaker-types';

@Entity({ name: 'account_record' })
export default class AccountRecord implements Account {
  @PrimaryGeneratedColumn('increment', { name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 128, unique: true, nullable: false })
  slug: string;

  @OneToMany(() => UserRecord, user => user.account)
  users: User[];
}
