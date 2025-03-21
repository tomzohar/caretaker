import dotenv from 'dotenv';

dotenv.config({
  path: `../.env`,
});

import AccountRecord from './entities/account/account.entity';
import PostRecord from './entities/post/post.entity';
import PatientRecord from './entities/patient/patient.entity';
import repl from 'node:repl';
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
}

const initREPL = async () => {
  await AppDataSource.initialize();
  console.log('Database initialized');

  const server = repl.start({
    prompt: '<caretaker-api-repl>',
    useGlobal: true,
  });

  Object.assign(server.context, replContext);
};

initREPL();
