import fs from 'fs';

import {jsonStoreFileName} from '../utils/constants';

type AppStore = {
    bot_access_token: string;
    oauth2_client_secret: string;
}

interface Store {
    getBotAccessToken(): string;
}

class JSONFileStore implements Store {
    storeData: AppStore;

    constructor() {
        this.storeData = {
            bot_access_token: '',
            oauth2_client_secret: '',
        };

        if (fs.existsSync(jsonStoreFileName)) {
            fs.readFile(jsonStoreFileName, (err, data) => {
                if (err) {
                    throw err;
                }
                this.storeData = JSON.parse(data.toString());
            });
        }
    }

    storeInstallInfo(values: any): [number, string] {
        try {
            fs.writeFileSync(jsonStoreFileName, JSON.stringify(values));
            return [200, jsonStoreFileName + ' successfully written'];
        } catch (err) {
            return [400, err];
        }
    }

    getBotAccessToken(): string {
        return this.storeData.bot_access_token;
    }
}

export default new JSONFileStore();
