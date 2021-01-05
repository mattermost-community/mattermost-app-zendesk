import fs from 'fs';

<<<<<<< HEAD
import {AppContextProps} from 'mattermost-redux/types/apps';

import {jsonConfigFileStore} from '../utils';

type AppConfigStore = {
=======
import {AppContext} from 'mattermost-redux/types/apps';

import {jsonConfigFileStore} from '../utils';

type AppStore = {
>>>>>>> master
    bot_access_token: string;
    oauth2_client_secret: string;
    mm_site_url: string;
}

interface Store {
    getBotAccessToken(): string;
    getSiteURL(): string;
}

<<<<<<< HEAD
class ConfigFileStore implements Store {
    storeData: AppConfigStore;
=======
class JSONFileStore implements Store {
    storeData: AppStore;
>>>>>>> master

    constructor() {
        this.storeData = {
            bot_access_token: '',
            oauth2_client_secret: '',
            mm_site_url: '',
        };

        if (fs.existsSync(jsonConfigFileStore)) {
            fs.readFile(jsonConfigFileStore, (err, data) => {
                if (err) {
                    throw err;
                }
                this.storeData = JSON.parse(data.toString());
            });
        }
    }

<<<<<<< HEAD
    storeInstallInfo(req: any): void {
        const values = req.body.values;
        const context: AppContextProps = req.body.context;

        values.mm_site_url = context.config.site_url;

        fs.writeFileSync(jsonConfigFileStore, JSON.stringify(values), (err) => {
            if (err) {
                throw err;
            }
=======
    storeInstallInfo(req: any): Promise<void> {
        const values = req.body.values;
        const context: AppContext = req.body.context;

        values.mm_site_url = context.config.site_url;

        return new Promise((resolve, reject) => {
            fs.writeFileSync(jsonConfigFileStore, JSON.stringify(values), (err) => {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve();
            });
>>>>>>> master
        });
    }

    getBotAccessToken(): string {
        return this.storeData.bot_access_token;
    }

    getSiteURL(): string {
        return this.storeData.mm_site_url;
    }
}

<<<<<<< HEAD
export default new ConfigFileStore();
=======
export default new JSONFileStore();
>>>>>>> master
