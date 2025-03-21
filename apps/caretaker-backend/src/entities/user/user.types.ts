import { UserRecord } from './user.entity';
import {Repository} from "typeorm";

export type User = Repository<UserRecord> & {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    save: () => Promise<void>;
}
