import {mock} from 'jest-mock-extended';

import {AppCallRequest} from 'mattermost-redux/types/apps';

import {newZDClient, newMMClient, ZDClient, MMClient} from '../clients';
import {ZDClientOptions} from '../clients/zendesk';

import {newSubscriptionsForm, FormFields} from './subscriptions';

const testTriggers1: ZDTrigger[] = {
            url: 'https://mattermost1616716488.zendesk.com/api/v2/triggers/360198857571.json',
            id: 360198857571,
            title: 'Auto-assign to first email responding agent',
            active: false,
            updated_at: '2021-03-25T23:55:01Z',
            created_at: '2021-03-25T23:55:01Z',
            actions: [
                {
                    field: 'assignee_id',
                    value: 'current_user',
                },
            ],
            conditions: {
                all: [
                    {
                        field: 'update_type',
                        operator: 'is',
                        value: 'Change',
                    },
                    {
                        field: 'current_via_id',
                        operator: 'is',
                        value: '4',
                    },
                    {
                        field: 'assignee_id',
                        operator: 'is',
                        value: '',
                    },
                    {
                        field: 'role',
                        operator: 'is_not',
                        value: 'end_user',
                    },
                ],
                any: [

                ],
            },
            description: null,
            position: 2,
            raw_title: 'Auto-assign to first email responding agent',
            category_id: '259511',
        },
    ]
const callBase: AppCallRequest = {
    context: {
        app_path: 'path',
        mattermost_site_url: 'test-url',
        app_id: 'testid',
        bot_user_id: 'botuserid',
        bot_access_token: 'bot-access-token',
        acting_user_id: 'acting-user-id',
        team_id: 'team-id',
        channel_id: 'channel-id',
        oauth2: {
            user: {
                token: {
                    access_token: 'junk',
                },
            },
        },
    },
    expand: {
        admin_access_token: 'admin-access-token',
    },

    values: {
    },
    state: 'junk',
};

const zdOptions: ZDClientOptions = {
    oauth2UserAccessToken: callBase.context.oauth2.user.token.access_token,
    botAccessToken: callBase.context.bot_access_token,
    mattermostSiteUrl: callBase.context.mattermost_site_url,
};

// const zdClient = newZDClient(zdOptions);

// const zdClient =

test('Modify only instance', async () => {
    const mockMMClient = mock<MMClient>();
    // mockMMClient.triggers.search.mockReturnValue(testTriggers1);
    const mockZDClient = mock<ZDClient>();
    mockZDClient.triggers.search = jest.fn().mockReturnValue('jason')
    const mockTryPromiseWithMessage = jest.fn().mockReturnValue('jason')
    console.log('mockTryPromiseWithMessage', mockTryPromiseWithMessage)
    // mockZDClient.triggers.search.mockReturnValue(testTriggers1);
    // mockZDClient.triggers.search("").mockReturnValue(testTriggers1);
    // mockMMClient.triggers.mockReturnValue(testTriggers1);

    const subs1 = new FormFields(callBase, mockZDClient, mockMMClient, 'url');
    const fields = await subs1.addSubscriptionFields();
    console.log('subs1', subs1);
    console.log('fields', fields);

    // const spy = jest.spyOn(subs1, 'fetchChannelTriggers').mockImplementation(() => testTriggers);

    // expect(person.sayMyName()).toBe("Hello");
    // expect(person.bla()).toBe("bla");

    // unnecessary in this case, putting it here just to illustrate how to "unmock" a method
    // spy.mockRestore();
});

// const callBase: AppCallRequest = {
//     context: {
//         app_path: 'path',
//         mattermost_site_url: 'test-url',
//         app_id: 'testid',;q
//         bot_user_id: 'botuserid',
//         bot_access_token: 'bot-access-token',
//         acting_user_id: 'acting-user-id',
//         team_id: 'team-id',
//         channel_id: 'channel-id',
//     },
//     expand: {
//         admin_access_token: 'admin-access-token',
//         oauth2_user: {
//             user: {
//                 token: {
//                     access_token: 'junk',
//                 },
//             },
//         },
//     },
//
//     values: {
//     },
//     state: 'junk',
// };
//
//

// const subs1 = newSubscriptionsForm(callBase)
// console.log('subs1', subs1)

// const fields = subs1.addSubscriptionFields()
// console.log('fields', fields)
