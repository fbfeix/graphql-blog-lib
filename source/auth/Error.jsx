

export class AuthenticationException {
    constructor(message) {
        this.message = `Failed Auth: ${message}`;
    }
}