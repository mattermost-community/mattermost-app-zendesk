export const jsonConfigFileStore = 'config.json';

export const ENV = {
    host_zendesk: process.env.ZENDESK_URL as string,
    api_token: process.env.ZENDESK_API_TOKEN as string,
    username: process.env.ZENDESK_USERNAME as string,
};
