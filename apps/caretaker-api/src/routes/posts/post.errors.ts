import {QueryFailedError} from "typeorm";

abstract class PostError extends Error {
    abstract name: string;

    protected constructor(message: string, error: Error) {
        const details = 'detail' in error ? error.detail : '';
        super(`${message} ${details ? 'because ' + details : ''}`);
    }
}

export class PostCreationFailed extends PostError {
    name = 'PostCreationFailed';

    constructor(error: QueryFailedError) {
        super(`Post creation failed`, error);
    }
}

export class PostNotFoundError extends PostError {
    name = 'PostNotFoundError';

    constructor(error: QueryFailedError | Error) {
        super(`Could not find post\\s`, error);
    }
}
