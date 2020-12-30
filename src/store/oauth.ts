import fs from 'fs';

import {jsonTokenFileStore} from '../utils';

type TokenStore = Array<{string: string}>

// interface Store {
//     getBotAccessToken(): string;
//     getSiteURL(): string;
// }

class JSONFileStore implements Store {
    storeData: TokenStore;
    constructor() {
        this.storeData = {};
        if (fs.existsSync(jsonTokenFileStore)) {
            fs.readFile(jsonTokenFileStore, (err, data) => {
                if (err) {
                    throw err;
                }
                this.storeData = JSON.parse(data.toString());
            });
        }
    }

    storeToken(userID: string, token: string): void {
        const tokens = this.storeData;
        tokens[userID] = token;
        this.storeTokens();
    }

    deleteToken(userID: string): void {
        const tokens = this.storeData;
        delete tokens[userID];
        this.storeTokens();
    }

    storeTokens(): void {
        fs.writeFileSync(jsonTokenFileStore, JSON.stringify(this.storeData), (err) => {
            if (err) {
                throw err;
            }
        });
    }

    getBotAccessToken(): string {
        return 'Jason';
    }

    // getBotAccessToken(): string {
    //     return this.storeData.bot_access_token;
    // }
    //
    // getSiteURL(): string {
    //     return this.storeData.mm_site_url;
    // }
}

export default new JSONFileStore();
