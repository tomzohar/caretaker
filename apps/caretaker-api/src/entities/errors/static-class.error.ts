import BaseError from "./base-error.class";
import {StatusCode} from "../../types";

export class StaticClassError extends BaseError {
    name = 'StaticClassError';

    constructor(constructorName: string) {
        super(
            `${constructorName} is a static class, you should not make instances of it`,
            new Error(),
            StatusCode.INTERNAL_SERVER_ERROR
        );
    }
}
