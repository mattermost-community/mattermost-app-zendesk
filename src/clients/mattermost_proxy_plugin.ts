import fetch from 'node-fetch';

import {Oauth2App} from 'src/utils';

import {Routes, AppsPluginName, PathAPI, PathKV} from '../utils/constants';
import {getManifest} from '../manifest';

export interface ProxyClient {
    kvSet(key: string, value: any): Promise<void>;
    kvGet(key: string): Promise<any>;
    kvDelete(key: string): void;
    storeOauth2App(id: string, secret: string): void;
    storeOauth2User(token: string): void
}

export const newProxyClient = (botAccessToken: string, baseURL: string): ProxyClient => {
    return new ProxyClientImpl(botAccessToken, baseURL);
};

class ProxyClientImpl implements ProxyClient {
    token: string
    url: string

    constructor(token: string, baseURL: string) {
        this.token = token;
        this.url = baseURL;
    }
    async kvSet(key: string, value: any): Promise<void> {
        const url = this.url + this.kvPath(key);
        try {
            this.doAPIPost(url, value);
        } catch (e) {
            console.log('e', e);
        }
    }

    async kvGet(key: string): Promise<any> {
        const url = this.url + this.kvPath(key);
        return this.doAPIGet(url, key);
    }

    kvDelete(key: string): void {
        const url = this.url + this.kvPath(key);
        this.doAPIDelete(url);
    }

    storeOauth2App(id: string, secret: string): void {
        const url = this.url + this.oauth2AppPath();
        const data: Oauth2App = {
            client_id: id,
            client_secret: secret,
        };
        try {
            this.doAPIPost(url, data);
        } catch (e) {
            console.log('e', e);
        }
    }

    storeOauth2User(token: string): void {
        const url = this.url + this.oauth2UserPath();
        const data = {token};
        try {
            this.doAPIPost(url, data);
        } catch (e) {
            console.log('e', e);
        }
    }

    async doAPIPost(url: string, value: any): Promise<any> {
        const options = this.getFetchOptions('post');
        options.body = JSON.stringify(value);
        const fetchedValue = await fetch(url, options);
        return fetchedValue;
    }

    async doAPIGet(url: string): Promise<any> {
        const options = this.getFetchOptions('get');
        const fetchedValue = await fetch(url, options).
            then((data) => data.json());
        return fetchedValue;
    }

    async doAPIDelete(url: string): Promise<any> {
        const options = this.getFetchOptions('delete');
        const fetchedValue = await fetch(url, options).
            then((data) => data.json());
        return fetchedValue;
    }

    getFetchOptions(method: string): any {
        return {
            headers: {
                Authorization: `BEARER ${this.token}`,
                'content-type': 'application/json; charset=UTF-8',
            },
            method,
        };
    }

    kvPath(key: string): string {
        return this.apiPath(Routes.MM.PathKV) + '/' + key;
    }

    oauth2AppPath(): string {
        return this.apiPath(Routes.MM.PathOAuth2App) + '/' + getManifest().app_id;
    }

    oauth2UserPath(): string {
        return this.apiPath(Routes.MM.PathOAuth2User) + '/' + getManifest().app_id;
    }

    apiPath(p: string): string {
        return this.getPluginRoute() + PathAPI + p;
    }

    getPluginRoute(): string {
        return this.getPluginsRoute() + '/' + AppsPluginName;
    }

    getPluginsRoute(): string {
        return '/plugins';
    }

    getKVURL(key: string): string {
        return Routes.MM.PathKV + key;
    }
}
