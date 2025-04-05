import { DataSource } from 'typeorm';
import AccountRecord from '../entities/account/account.entity';
import { InvitationRecord } from '../entities/invitation/invitation.entity';
import PatientRecord from '../entities/patient/patient.entity';
import PostRecord from '../entities/post/post.entity';
import { UserRecord } from '../entities/user/user.entity';

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: !isProd, // Enable synchronize in development, disable in production
  logging: !isProd,
  entities: [
    UserRecord,
    AccountRecord,
    PatientRecord,
    PostRecord,
    InvitationRecord,
  ],
  migrations: ['src/migrations/**/*.ts'],
});
