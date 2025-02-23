
export default abstract class BaseError extends Error {
    abstract name: string;
    private readonly _status: number;

    protected constructor(message: string, error: Error, status: number) {
        const details = 'detail' in error ? error.detail : error.message;
        super(`${message} ${details ? 'because ' + details : ''}`);
        this._status = status;
    }

    get status(): number {
        return this._status;
    }
}
