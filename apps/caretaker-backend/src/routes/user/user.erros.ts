import {QueryFailedError} from "typeorm";
import {StatusCode} from "../../types";

export abstract class UserError extends Error {
    abstract name: string;
    private readonly _status: StatusCode;

    protected constructor(message: string, error: Error, status: StatusCode) {
        const details = 'detail' in error ? error.detail : '';
        super(`${message} ${details ? 'because ' + details : ''}`);
        this._status = status;
    }

    get status(): StatusCode {
        return this._status;
    }
}

export class UserCreationError extends UserError {
    name = 'UserCreationError';

    constructor(error: QueryFailedError | Error = new Error()) {
        super(`User creation failed`, error, StatusCode.BAD_REQUEST);
    }
}

export class UserUpdateError extends UserError {
    name = 'UserUpdateError';

    constructor(error: QueryFailedError | Error = new Error()) {
        super(`User update failed`, error, StatusCode.BAD_REQUEST);
    }
}

export class UsersRepoError extends UserError {
    name = 'UsersRepoError';

    constructor(error: QueryFailedError | Error = new Error()) {
        super(`Users repository error`, error, StatusCode.INTERNAL_SERVER_ERROR);
    }
}


export class UserNotFoundError extends UserError {
    name = 'UserNotFoundError';

    constructor(error: QueryFailedError | Error = new Error()) {
        super(`User not found`, error, StatusCode.NOT_FOUND);
    }
}

export class UserLoginFailed extends UserError {
    name = 'UserLoginFailed';

    constructor(error: QueryFailedError | Error = new Error()) {
        super(`User login failed`, error, StatusCode.UNAUTHORIZED);
    }
}

export class UserAlreadyAssignedToAccountError extends UserError {
  name = 'UserAlreadyAssignedToAccountError';
  constructor(error = new Error()) {
    super('User is already assigned to account', error, StatusCode.BAD_REQUEST);
  }
}
