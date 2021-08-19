// import {AppSelectOption, AppField, AppCallValues} from 'mattermost-redux/types/apps';
//
import {getConditionFieldsFromCallValues} from './utils';
describe('utils/jira_issue_metadata', () => {
    test('should return a list of fields', () => {
        const values = {
            any_0_field: 'junk',
        };

        const expected = {
            0: {
                field: 'junk',
            },
        };
        const newValues = getConditionFieldsFromCallValues(values, 'any');
        expect(newValues).toEqual(expected);
    });
});
