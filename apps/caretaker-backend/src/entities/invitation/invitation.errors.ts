import BaseError from '../errors/base-error.class';

export class InvitationNotFoundError extends BaseError {
    name = 'InvitationNotFound';

    constructor(error = new Error()) {
        super('Invitation not found', error, 404);
    }
}

export class InvitationExpiredError extends BaseError {
    name = 'InvitationExpired';

    constructor(error = new Error()) {
        super('Invitation has expired', error, 400);
    }
}

export class InvitationAlreadyAcceptedError extends BaseError {
    name = 'InvitationAlreadyAccepted';

    constructor(error = new Error()) {
        super('Invitation has already been accepted', error, 400);
    }
}

export class DuplicateInvitationError extends BaseError {
    name = 'DuplicateInvitation';

    constructor(email: string, error = new Error()) {
        super(`An active invitation already exists for ${email}`, error, 400);
    }
} 