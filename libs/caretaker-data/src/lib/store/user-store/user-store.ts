import { User } from '@caretaker/caretaker-types';
import { action, makeAutoObservable, observable } from 'mobx';

export class UserStore {
  value: User | null = null;

  constructor() {
    makeAutoObservable(this, {
      value: observable,
      set: action,
    });
  }

  set(newValue: User | null) {
    this.value = newValue;
  }
}

export const userStore = new UserStore();
