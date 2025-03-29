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
import AccountRecord from '../account/account.entity';

@Entity({ name: 'invitation_record' })
export class InvitationRecord {
    @PrimaryGeneratedColumn("increment", { name: "id" })
    id: number;

    @Column("varchar", { length: 255 })
    email: string;

    @Column("enum", { name: 'status', enum: ['pending', 'accepted', 'expired'], default: 'pending' })
    status: 'pending' | 'accepted' | 'expired';

    @ManyToOne(() => UserRecord)
    @JoinColumn()
    invitedBy: UserRecord;

    @ManyToOne(() => AccountRecord)
    @JoinColumn()
    account: AccountRecord;

    @Column("varchar", { length: 255, unique: true })
    token: string;

    @Column("timestamp")
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
} 