import {ZDClient} from '../clients/zendesk';
import {ZDTrigger} from 'utils/ZDTypes';

const newZDClient:ZDClient = jest.createMockFromModule('newZDClient');

// newZdClient.
// const
//

function definitions(): any {
    return {jason: 'frerich'};
}

function search(): any {
    console.log('1. IN HERE!');
    return testTriggers1();
}

newZDClient.triggers.definitions = definitions;
newZDClient.triggers.search = search;

export default newZDClient;

// const testTriggers: Promise<ZDTrigger[]> = [
//     {
//         url: 'https://mattermost1616716488.zendesk.com/api/v2/triggers/360198857551.json',
//         id: 360198857551,
//         title: 'Notify all agents of received request',
//         active: true,
//         conditions: {
//             all: [
//                 {
//                     field: 'update_type',
//                     operator: 'is',
//                     value: 'Create',
//                 },
//             ],
//             any: [
//
//             ],
//         },
//     },
// ];

const testTriggers1 = (): ZDTrigger[] => {
    return [
        {
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
    ;
};

const testTriggers = (): ZDTrigger[] => {
    return [
        {
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
        {
            url: 'https://mattermost1616716488.zendesk.com/api/v2/triggers/360198857491.json',
            id: 360198857491,
            title: 'Notify assignee of assignment',
            active: true,
            updated_at: '2021-04-18T17:32:58Z',
            created_at: '2021-03-25T23:55:00Z',
            actions: [
                {
                    field: 'notification_user',
                    value: [
                        'assignee_id',
                        '[{{ticket.account}}] Assignment: {{ticket.title}}',
                        'You have been assigned to this ticket (#{{ticket.id}}).\n\n{{ticket.comments_formatted}}',
                    ],
                },
            ],
            conditions: {
                all: [
                    {
                        field: 'assignee_id',
                        operator: 'changed',
                        value: null,
                    },
                    {
                        field: 'assignee_id',
                        operator: 'is_not',
                        value: 'current_user',
                    },
                ],
                any: [

                ],
            },
            description: null,
            position: 2,
            raw_title: 'Notify assignee of assignment',
            category_id: '259511',
        },
        {
            url: 'https://mattermost1616716488.zendesk.com/api/v2/triggers/360198857471.json',
            id: 360198857471,
            title: 'Notify assignee of comment update',
            active: true,
            updated_at: '2021-04-18T17:32:58Z',
            created_at: '2021-03-25T23:55:00Z',
            actions: [
                {
                    field: 'notification_user',
                    value: [
                        'assignee_id',
                        '[{{ticket.account}}] Re: {{ticket.title}}',
                        'This ticket (#{{ticket.id}}) has been updated.\n\n{{ticket.comments_formatted}}',
                    ],
                },
            ],
            conditions: {
                all: [
                    {
                        field: 'comment_is_public',
                        operator: 'is',
                        value: 'not_relevant',
                    },
                    {
                        field: 'assignee_id',
                        operator: 'is_not',
                        value: 'current_user',
                    },
                    {
                        field: 'assignee_id',
                        operator: 'is_not',
                        value: 'requester_id',
                    },
                    {
                        field: 'assignee_id',
                        operator: 'not_changed',
                        value: null,
                    },
                    {
                        field: 'status',
                        operator: 'not_value_previous',
                        value: 'solved',
                    },
                ],
                any: [

                ],
            },
            description: null,
            position: 3,
            raw_title: 'Notify assignee of comment update',
            category_id: '259511',
        },
        {
            url: 'https://mattermost1616716488.zendesk.com/api/v2/triggers/360198857511.json',
            id: 360198857511,
            title: 'Notify assignee of reopened ticket',
            active: true,
            updated_at: '2021-04-18T17:32:58Z',
            created_at: '2021-03-25T23:55:00Z',
            actions: [
                {
                    field: 'notification_user',
                    value: [
                        'assignee_id',
                        '[{{ticket.account}}] Re: {{ticket.title}}',
                        'This ticket (#{{ticket.id}}) has been reopened.\n\n{{ticket.comments_formatted}}',
                    ],
                },
            ],
            conditions: {
                all: [
                    {
                        field: 'assignee_id',
                        operator: 'is_not',
                        value: 'current_user',
                    },
                    {
                        field: 'status',
                        operator: 'value_previous',
                        value: 'solved',
                    },
                    {
                        field: 'status',
                        operator: 'is_not',
                        value: 'closed',
                    },
                ],
                any: [

                ],
            },
            description: null,
            position: 4,
            raw_title: 'Notify assignee of reopened ticket',
            category_id: '259511',
        },
    ];
};
