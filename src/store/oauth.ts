import fs from 'fs';

import {jsonTokenFileStore} from '../utils';

interface TokenStore {
    [key: string]: string;
}

interface Store {
    tokens: TokenStore;
    storeToken(userID: string, token: string): void;
    deleteToken(userID: string): void;
    getToken(userID: string): string;
    storeTokens(): void;
}

class TokenFileStore implements Store {
    tokens: TokenStore = {};

    constructor() {
        if (fs.existsSync(jsonTokenFileStore)) {
            fs.readFile(jsonTokenFileStore, (err, data) => {
                if (err) {
                    throw err;
                }
                this.tokens = JSON.parse(data.toString());
            });
        }
    }

    storeToken(userID: string, token: string): void {
        this.tokens[userID] = token;
        this.storeTokens();
    }

    deleteToken(userID: string): void {
        delete this.tokens[userID];
        this.storeTokens();
    }

    getToken(userID: string): string {
        if (this.tokens[userID]) {
            return this.tokens[userID];
        }
        return '';
    }

    storeTokens(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(jsonTokenFileStore, JSON.stringify(this.tokens), (err) => {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve();
            });
        });
    }
}

export default new TokenFileStore();
