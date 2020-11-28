import fs from 'fs';

import {jsonStoreFileName} from './constants';

type AppStore = {
    bot_access_token: string;
    oauth2_client_secret: string;
}

class Store {
    store: AppStore;

    constructor() {
        this.store = {
            bot_access_token: '',
            oauth2_client_secret: '',
        };

        if (fs.existsSync(jsonStoreFileName)) {
            fs.readFile(jsonStoreFileName, (err, data) => {
                if (err) {
                    console.log('err', err);
                    throw err;
                }
                this.store = JSON.parse(data.toString());
            });
        }
    }

    getBotAccessToken(): string {
        return this.store.bot_access_token;
    }
}

export default new Store();
