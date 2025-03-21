import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { UserRecord } from '../user/user.entity';

@Entity({name: 'patient_record'})
export default class PatientRecord {
    @PrimaryGeneratedColumn("increment", {name: "id"})
    id?: number;

    @Column("text")
    firstName?: string;

    @Column("text")
    lastName?: string;

    @ManyToOne(() => UserRecord, user => user.patients)
    @JoinColumn()
    guardian?: Pick<UserRecord, 'id' | 'name' | 'email'>;

    @Column("enum", {name: 'status', enum: ['active', 'inactive', 'pending'], default: 'pending'})
    status?: 'active' | 'inactive' | 'pending';

    @CreateDateColumn()
    createdAt?: string;

    @UpdateDateColumn()
    updatedAt?: string;

    @DeleteDateColumn()
    deletedAt?: string;

    get name(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
