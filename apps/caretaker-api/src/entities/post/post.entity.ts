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

@Entity({name: 'post_record'})
export default class PostRecord {
    @PrimaryGeneratedColumn("increment", {name: "id"})
    id: number;

    @Column("text")
    content: string;

    @ManyToOne(() => UserRecord, user => user.posts)
    @JoinColumn()
    user: Pick<UserRecord, 'id' |'name' | 'email'>;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @DeleteDateColumn()
    deletedAt?: string;
}
