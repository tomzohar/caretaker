import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import PostRecord from "../post/post.entity";
import PatientRecord from "../patient/patient.entity";
import AccountRecord from '../account/account.entity';
import { Account, User } from '@caretaker/caretaker-types';

@Entity({name: 'user_record'})
export class UserRecord implements User {
    @PrimaryGeneratedColumn("increment", {name: "id"})
    id: number;

    @Column("varchar", {length: 255})
    name: string;

    @Column("varchar", {length: 255, unique: true})
    email: string;

    @Column("varchar", {length: 255})
    password: string;

    @OneToMany(() => PostRecord, post => post.user)
    posts: PostRecord[];

    @OneToMany(() => PatientRecord, patient => patient.guardian)
    patients: PatientRecord[];

    @ManyToOne(() => AccountRecord, account => account.users)
    account: Account;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @DeleteDateColumn()
    deletedAt: string;
}



