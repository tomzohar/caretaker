import { DataSource } from 'typeorm';
import AccountRecord from '../entities/account/account.entity';
import { InvitationRecord } from '../entities/invitation/invitation.entity';
import PatientRecord from '../entities/patient/patient.entity';
import PostRecord from '../entities/post/post.entity';
import { UserRecord } from '../entities/user/user.entity';

const DB_CONFIG = {
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DB}`,
  url: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`,
};

console.log({ DB_CONFIG });

export const AppDataSource = new DataSource({
  ...DB_CONFIG,
  host: 'localhost',
  port: 5432,
  type: 'postgres',
  synchronize: true, // Set to false in production
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
