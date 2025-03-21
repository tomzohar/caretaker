import BaseError from "../errors/base-error.class";
import {StatusCode} from "../../types";

export class PatientNotFoundError extends BaseError {
    name = 'PatientNotFoundError';

    constructor(id: number) {
        super(`Patient with id ${id} not found`, new Error(), StatusCode.NOT_FOUND);
    }
}

export class PatientCreateFailedError extends BaseError {
    name = 'PatientCreateFailedError';

    constructor(error = new Error()) {
        super('Failed to create patient', error, StatusCode.INTERNAL_SERVER_ERROR);
    }
}
