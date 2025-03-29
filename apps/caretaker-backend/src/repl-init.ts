import dotenv from 'dotenv';
import path from 'path';

const pathToEnv = path.resolve(__dirname + '../../../../.env');
dotenv.config({
  path: pathToEnv,
});

import repl from 'node:repl';
import redisClient from './cache/redis-client';
import { AppDataSource } from './config/database';
import AccountRecord from './entities/account/account.entity';
import { InvitationRecord } from './entities/invitation/invitation.entity';
import PatientRecord from './entities/patient/patient.entity';
import PostRecord from './entities/post/post.entity';
import { UserRecord } from './entities/user/user.entity';
import { LoginController } from './routes/login/login.controller';
import userController from './routes/user/user.controller';
import { InvitationService, InvitationCleanupService } from './services';

const replContext = {
  db: AppDataSource,
  redisClient,
  UserRecord,
  AccountRecord,
  PostRecord,
  PatientRecord,
  InvitationRecord,
  userController,
  LoginController,
  InvitationService,
  InvitationCleanupService,
  users: AppDataSource.getRepository(UserRecord),
  accounts: AppDataSource.getRepository(AccountRecord),
  posts: AppDataSource.getRepository(PostRecord),
  patients: AppDataSource.getRepository(PatientRecord),
  invitations: AppDataSource.getRepository(InvitationRecord),
};

const initREPL = async () => {
  await AppDataSource.initialize();
  console.log('Database initialized');

  const server = repl.start({
    prompt: '<caretaker-console>',
    useGlobal: true,
  });

  Object.assign(server.context, replContext);
};

initREPL();
