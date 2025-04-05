import { DataSource } from 'typeorm';
import AccountRecord from '../entities/account/account.entity';
import { InvitationRecord } from '../entities/invitation/invitation.entity';
import PatientRecord from '../entities/patient/patient.entity';
import PostRecord from '../entities/post/post.entity';
import { UserRecord } from '../entities/user/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Set to false in production for safety
  logging: false,
  entities: [
    UserRecord,
    AccountRecord,
    PatientRecord,
    PostRecord,
    InvitationRecord,
  ],
  migrations: ['src/migrations/**/*.ts'],
});
