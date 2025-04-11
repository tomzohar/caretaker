import { User } from '../user/user.interface';


export interface Account {
  id: number;
  name: string;
  slug: string;
  users: User[];
}
