import fs from 'fs';

import {Request} from 'express';

import {AppContextProps} from 'mattermost-redux/types/apps';

import {jsonConfigFileStore} from '../utils';

type AppConfigStore = {
    bot_access_token: string;
    bot_user_id: string;
    admin_access_token: string;
    admin_user_id: string;
    oauth2_client_secret: string;
    mattermost_site_url: string;
}

interface Store {
    getBotAccessToken(): string;
    getAdminAccessToken(): string;
    getBotUserID(): string;
    getSiteURL(): string;
}

class ConfigFileStore implements Store {
    storeData: AppConfigStore;

    constructor() {
        this.storeData = {
            bot_access_token: '',
            admin_access_token: '',
            admin_user_id: '',
            bot_user_id: '',
            oauth2_client_secret: '',
            mattermost_site_url: '',
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

    storeInstallInfo(req: Request): Promise<void> {
        const values = req.body.values;
        const context: AppContextProps = req.body.context;

        values.mattermost_site_url = context.mattermost_site_url;
        values.bot_access_token = context.bot_access_token;
        values.bot_user_id = context.bot_user_id;
        values.admin_access_token = context.admin_access_token;
        values.admin_user_id = context.admin_user_id;

        return new Promise((resolve, reject) => {
            fs.writeFile(jsonConfigFileStore, JSON.stringify(values), (err) => {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve();
            });
        });
    }
    getBotUserID(): string {
        return this.storeData.bot_user_id;
    }

    getBotAccessToken(): string {
        return this.storeData.bot_access_token;
    }

    getAdminAccessToken(): string {
        return this.storeData.admin_access_token;
    }

    getAdminUserID(): string {
        return this.storeData.admin_user_id;
    }

    getSiteURL(): string {
        return this.storeData.mattermost_site_url;
    }
}

export default new ConfigFileStore();
