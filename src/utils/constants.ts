export const jsonConfigFileStore = 'config.json';
export const zendeskIcon = 'https://raw.githubusercontent.com/mattermost/mattermost-app-zendesk/main/assets/zendesk.svg';

const zendesk = {
    host: process.env.ZENDESK_URL as string,
    apiURL: process.env.ZENDESK_URL + '/api/v2' as string,
    apiToken: process.env.ZENDESK_API_TOKEN as string,
    username: process.env.ZENDESK_USERNAME as string,
};

export const ENV = {
    zendesk,
};
