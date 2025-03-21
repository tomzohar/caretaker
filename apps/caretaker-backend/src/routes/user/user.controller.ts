import { UserRecord } from '../../entities/user/user.entity';
import {
  DataSource,
  DeepPartial,
  FindOptionsSelect,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { AppDataSource } from '../../config/database';
import {
  UserCreationError,
  UserNotFoundError,
  UsersRepoError,
  UserUpdateError,
} from './user.erros';
import { isObject } from '../../utils/object.utils';
import { isBoolean } from '../../utils/boolean.utils';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const getUserFindOptionsSelect = (
  options: FindOptionsSelect<Omit<UserRecord, 'account'>> = {}
): FindOptionsSelect<UserRecord> => ({
  id: true,
  name: true,
  email: true,
  password: false,
  deletedAt: false,
  createdAt: false,
  updatedAt: false,
  ...options,
});

class UserController {
  static _instances = 0;

  private users: Repository<UserRecord>;

  constructor(private db: DataSource) {
    UserController._instances++;
    if (UserController._instances > 1) {
      throw new Error('Cannot create another instance of singleton class');
    }

    this.users = this.db.getRepository(UserRecord);
  }

  async getAll() {
    try {
      return await this.users.find({
        select: getUserFindOptionsSelect({ createdAt: true }),
        relations: {
          posts: true,
        },
      });
    } catch (err) {
      throw new UsersRepoError(err as QueryFailedError);
    }
  }

  async getById<T = UserRecord>(
    id: number,
    select?: Partial<Record<keyof UserRecord, boolean>>
  ): Promise<T> {
    try {
      const [user] = await this.users.find({
        where: {
          id,
        },
        select: getUserFindOptionsSelect(select),
        relations: {
          posts: Boolean(select?.posts),
          account: true,
        },
      });

      if (isObject(user) && isObject(select)) {
        Object.entries(select).forEach(([key, value]) => {
          if (isBoolean(value) && value === false) {
            delete user[key as keyof UserRecord];
          }
        });
      }
      return <T>user;
    } catch (err) {
      console.log(err);
      throw new UserNotFoundError(err as QueryFailedError);
    }
  }

  async createUser(userDetails: Partial<UserRecord>): Promise<UserRecord> {
    try {
      if (userDetails.password) {
        userDetails.password = await bcrypt.hash(userDetails.password, SALT_ROUNDS);
      }
      const user = this.users.create(userDetails);
      return this.users.save(user);
    } catch (err) {
      console.log(err);
      throw new UserCreationError(err as QueryFailedError);
    }
  }

  async updateUser(
    id: number,
    updateUserDetails: DeepPartial<UserRecord>
  ): Promise<UserRecord> {
    let user;
    try {
      user = await this.getById(id);
      Object.assign(user, updateUserDetails);
      return await this.users.save(user);
    } catch (err) {
      if (!user) {
        throw new UserNotFoundError(err as QueryFailedError);
      }

      throw new UserUpdateError(err as QueryFailedError);
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await this.users.delete(id);
    } catch (err) {
      throw new UserNotFoundError(err as QueryFailedError);
    }
  }

  async findByEmail(
    email: string,
    selectOptions: FindOptionsSelect<UserRecord> = {}
  ): Promise<UserRecord | null> {
    try {
      return await this.users.findOne({
        where: {
          email,
        },
        select: getUserFindOptionsSelect(selectOptions),
        relations: {
          posts: false,
          account: true,
        },
      });
    } catch (err) {
      throw new UserNotFoundError(err as QueryFailedError);
    }
  }

  async getUserPosts(userId: number): Promise<UserRecord> {
    return this.getById(userId, { posts: true });
  }

  async getUserPatients(userId: number): Promise<UserRecord> {
    return this.getById(userId, { patients: true });
  }
}

const userController = new UserController(AppDataSource);

export default userController;
