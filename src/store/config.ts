import {AppCallValues} from 'mattermost-redux/types/apps';

import {CtxWithActingUserExpanded} from 'types/apps';

import {StoreKeys} from 'utils/constants';
import {newAppsClient, AppsClient} from 'clients';
import {baseUrlFromContext} from 'utils';

export type AppConfigStore = {
    zd_url: string;
    zd_node_host: string;
    zd_target_id: string;
    zd_oauth_access_token: string;
}

export interface ConfigStore {
    getValues(): Promise<AppConfigStore>;
    storeConfigInfo(values: AppCallValues): void;
}

class ConfigStoreImpl implements ConfigStore {
    storeData: AppConfigStore;
    ppClient: AppsClient;

    constructor(botToken: string, url: string) {
        this.ppClient = newAppsClient(botToken, url);
        this.storeData = {} as AppConfigStore;
    }

    storeConfigInfo(store: AppConfigStore): void {
        this.ppClient.kvSet(StoreKeys.config, store);
    }

    async getValues(): Promise<AppConfigStore> {
        const config = await this.ppClient.kvGet(StoreKeys.config);
        if (config) {
            this.storeData.zd_url = config.zd_url || '';
            this.storeData.zd_node_host = config.zd_node_host || '';
            this.storeData.zd_target_id = config.zd_target_id || '';
            this.storeData.zd_oauth_access_token = config.zd_oauth_access_token || '';
        }
        return this.storeData;
    }
}

export const newConfigStore = (context: CtxWithActingUserExpanded): ConfigStore => {
    const botAccessToken = context.acting_user_access_token;
    const baseURL = baseUrlFromContext(context);
    return new ConfigStoreImpl(botAccessToken, baseURL);
};
