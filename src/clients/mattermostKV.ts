import fetch, {RequestInit} from 'node-fetch';

import {Routes} from 'utils/constants';

export interface KVClient {
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
    delete(key: string): void;
}

export const newKVClient = (botAccessToken: string, baseURL: string): KVClient => {
    return new KVClientImpl(botAccessToken, baseURL);
};

class KVClientImpl implements KVClient {
    token: string
    url: string

    constructor(token: string, baseURL: string) {
        this.token = token;
        this.url = baseURL;
    }
    async set(key: string, value: any): Promise<void> {
        try {
            this.newRequest(key, value, 'post');
        } catch (e) {
            console.log('e', e);
        }
    }

    async get(key: string): Promise<any> {
        return this.newRequest(key, null, 'get');
    }

    delete(key: string): void {
        this.newRequest(key, null, 'delete');
    }

    async newRequest(key: string, value: any, method: string): Promise<any> {
        const options = {
            headers: {
                Authorization: `BEARER ${this.token}`,
                'content-type': 'application/json; charset=UTF-8',
            },
            method,
        } as RequestInit;
        if (method === 'post') {
            options.body = JSON.stringify(value);
        }

        const url = this.url + this.getKVURL(key);
        const fetchedValue = await fetch(url, options).
            then((data) => data.json());
        return fetchedValue;
    }

    getKVURL(key: string): string {
        return Routes.MM.KVPath + key;
    }
}
