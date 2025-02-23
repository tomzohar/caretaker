import dotenv from 'dotenv';
import path from 'path';


const pathToEnv = path.resolve(__dirname + '/../' + '.env');
dotenv.config({
  path: pathToEnv,
});

import repl from 'node:repl';
import AccountRecord from './entities/account/account.entity';
import PostRecord from './entities/post/post.entity';
import PatientRecord from './entities/patient/patient.entity';
import { AppDataSource } from './config/database';
import { UserRecord } from './entities/user/user.entity';
import redisClient from './cache/redis-client';

const replContext = {
  db: AppDataSource,
  redisClient,
  UserRecord,
  AccountRecord,
  PostRecord,
  PatientRecord,
  users: AppDataSource.getRepository(UserRecord),
  accounts: AppDataSource.getRepository(AccountRecord),
  posts: AppDataSource.getRepository(PostRecord),
  patients: AppDataSource.getRepository(PatientRecord),
}

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
