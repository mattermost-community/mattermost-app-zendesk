import {getConditionFieldsFromCallValues} from './utils';

describe('utils/getConditionFieldsFromCallValues', () => {
    test.each([
        ['one condition',
            {
                any_0_field: 'field-0',
                any_0_operator: 'field-0-oper',
            },
            {
                0: {field: 'field-0', operator: 'field-0-oper'},
            },
        ],
        ['two conditions',
            {
                any_0_field: 'field-0',
                any_0_operator: 'field-0-oper',
                any_1_field: 'field-1',
            },
            {
                0: {field: 'field-0', operator: 'field-0-oper'},
                1: {field: 'field-1'},
            },
        ],
        ['should ignore state',
            {
                state: {state1: 1, state2: 2},
                any_0_field: 'field-0',
                any_0_operator: 'field-0-oper',
            },
            {
                0: {field: 'field-0', operator: 'field-0-oper'},
            },
        ],
        ['should ignore any values that are not a condition',
            {
                state: {state1: 1, state2: 2},
                values: {v1: 1, v2: 2, v3: 'XYS'},
                any_0_field: 'field-0',
                any_0_operator: 'field-0-oper',
            },
            {
                0: {field: 'field-0', operator: 'field-0-oper'},
            },
        ],
    ])('%s', (_, callVals, expected) => {
        expect(getConditionFieldsFromCallValues(callVals, 'any')).toEqual(expected);
    });
});
