import BaseError from "./base-error.class";
import {StatusCode} from "../../types";

export class InternalServerError extends BaseError {
    name = 'InternalServerError';

    constructor() {
        super('Internal server error', new Error(), StatusCode.INTERNAL_SERVER_ERROR);
    }
}
