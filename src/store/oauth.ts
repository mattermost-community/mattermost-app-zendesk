import fs from 'fs';

import {jsonTokenFileStore} from '../utils';

type TokenStore = Array<{string: string}>

// interface Store {
//     getBotAccessToken(): string;
//     getSiteURL(): string;
// }

class TokenFileStore implements Store {
    tokens: TokenStore;
    constructor() {
        this.tokens = {};
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

    getToken(userID: string): [string, boolean] {
        if (this.tokens[userID]) {
            return [this.tokens[userID], true];
        }
        return ['', false];
    }

    storeTokens(): void {
        fs.writeFileSync(jsonTokenFileStore, JSON.stringify(this.tokens), (err) => {
            if (err) {
                throw err;
            }
        });
    }
}

export default new TokenFileStore();
