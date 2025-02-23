import BaseError from './base-error.class';

export class AccountCreationFailedError extends BaseError {
  name = 'AccountCreationFailedError';

  constructor(error = new Error()) {
    super('Account creation failed', error, 400);
  }
}

export class AccountNotFoundError extends BaseError {
  name = 'AccountNotFound';

  constructor(error = new Error()) {
    super('Account not found', error, 404);
  }
}
