import {AppDataSource} from "../../config/database";
import { UserRecord } from './user.entity';
import {Repository} from "typeorm";

export default function createUser(userDetails: Omit<UserRecord, 'id'>): Promise<UserRecord> {
    const userRepo: Repository<UserRecord> = AppDataSource.getRepository(UserRecord);
    const user = userRepo.create(userDetails);
    return userRepo.save(user);
}
