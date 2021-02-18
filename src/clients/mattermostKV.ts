import fetch from 'node-fetch';

export interface KVClient {
    set(key: string, value: any): void;
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
    set(key: string, value: any): void {
        this.newRequest(key, value, 'post');
    }

    async get(key: string): Promise<any> {
        return this.newRequest(key, null, 'get');
    }

    delete(key: string): void {
        this.newRequest(key, null, 'delete');
    }

    async newRequest(key: string, value: any, method: string): Promise<any> {
        const newoptions = {
            headers: {
                Authorization: `BEARER ${this.token}`,
                'content-type': 'application/json; charset=UTF-8',
            },
            method,
        };
        if (method === 'post') {
            newoptions.body = JSON.stringify(value);
        }

        const url = this.url + this.getKVURL(key);
        return fetch(url, newoptions).
            then((data) => data.json());
    }

    // req.ParseForm()
    // req.Form.Add("prefix", "servicenow")

    getKVURL(key: string): string {
        return '/plugins/com.mattermost.apps/api/v1/kv/' + key;
    }
}
