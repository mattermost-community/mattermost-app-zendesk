// ### Conditions
//
// The `conditions` object contains the conditions to check the value of ticket fields and
// select the ticket if the conditions are met. Conditions are represented as a JSON object
//  with two arrays of one or more conditions.
//
// **Example**
//
// ```js
// {
//    "conditions": {
//      "all": [
//        { "field": "status", "operator": "less_than", "value": "solved" },
//        { "field": "assignee_id", "operator": "is", "value": "296220096" }
//      ],
//      "any": [
//      ]
//    }
// }
// ```
//
// The first array lists all the conditions that must be met. The second
// array lists any condition that must be met.
//
// | Name     | Type  | Description
// | -------- | ----- | -----------
// | `all`    | array | Logical AND. Tickets must fulfill all of the conditions to be considered matching
// | `any`    | array | Logical OR. Tickets may satisfy any of the conditions to be considered matching
//
// Each condition in an array has the following properties:
//
// | Name            | Type                       | Description
// | --------------- | ---------------------------| -------------------
// | field           | string                     | The name of a ticket field
// | operator        | string                     | A comparison operator
// | value           | string                     | The value of a ticket field
//
// **Example**
//
// ```js
// { "field": "status", "operator": "less_than", "value": "solved" }
// ```
//
// When specifying conditions in a PUT or POST request, use the "all" and
// "any" arrays without the "conditions" key. Example:
//
// ```js
// {
//   "all": [
//     { "field": "status", "operator": "less_than", "value": "solved" },
//     { "field": "assignee_id", "operator": "is", "value": "296220096" }
//   ],
//   "any": [
//     { "field": "current_tags", "operator": "includes", "value": "hello" }
//   ],
//   ...
// }
// ```
//
// #### Conditions reference
//
// The following tables list the fields, allowed operators, and values of the
// conditions used in triggers, automations, views and SLA policies.
//
// ##### Common conditions
//
// The following conditions are shared by triggers, automations, views and SLA policies.
//
// | field                     | operator                                                   | value                                                                                   |
// | ------------------------- | ---------------------------------------------------------- |---------------------------------------------------------------------------------------- |
// | `group_id`                | `is`, `is_not`                                             | "" (no group assigned to the ticket) or the numeric ID of the group assigned to the ticket. |
// | `assignee_id`             | `is`, `is_not`                                             | "" (nobody assigned to the ticket), `current_user`, or the numeric ID of the agent assigned to the ticket. |
// | `requester_id`            | `is`, `is_not`                                             | "" (no requester specified), `current_user` or the numeric ID of the requester or assignee. |
// | `organization_id`         | `is`, `is_not`                                             | "" (no organization added to the ticket) or the numeric ID of the organization added to the ticket. |
// | `current_tags`            | `includes`, `not_includes`                                 | A space-delimited list of tags to compare against the ticket's tags.                    |
// | `via_id`                  | `is`, `is_not`                                             | The numeric ID of the channel used to create the ticket. See the [Via Types](#via-types) table.  |
// | `recipient`               | Omit the operator property                                 | For views and automations, the account name in the email address from which the ticket was received. For triggers and SLA policies, the full email address, which can include external addresses. |
// | `custom_fields_{id}`      | `is`, `is_not`                                             | Specify the id of the custom ticket field. See [Ticket fields](./ticket_fields). Possible values vary depending on the field. See [Setting custom field values](./tickets#setting-custom-field-values).
//
// The following conditions are shared by triggers, automations, and views.
//
// | field                     | operator                                                   | value                                                                                   |
// | ------------------------- | ---------------------------------------------------------- |---------------------------------------------------------------------------------------- |
// | `type`                    | `is`, `is_not`                                             | `question`, `incident`, `problem`, or `task` |
// | `status`                  | `is`,<br />`is_not`,<br />`less_than`,<br />`greater_than` | `new`, `open`, `pending`, `hold`, `solved`, or `closed` |
// | `priority`                | `is`,<br />`is_not`,<br />`less_than`,<br />`greater_than` | "" (no priority assigned to the ticket), `low`, `normal`, `high`, or `urgent` |
// | `description_includes_word` | `includes` (contains one word),<br />`not_includes` (contains none of the words),<br />`is` (contains string),<br />`is_not` (does not contain string) | Single words or strings in the ticket subject. Not available in triggers. |
// | `locale_id`               | `is`, `is_not`                                             | The numeric ID of the locale of the person who submitted the ticket. See [List locales](./locales) to list the available locale IDs for the account. |
// | `satisfaction_score`      | `is`,<br />`is_not`,<br />`less_than`,<br />`greater_than` | `good_with_comment`, `good`, `bad_with_comment`, `bad`, `false` (offered), or `true` (unoffered) |
//
// The following conditions are shared by triggers and automations.
//
// | field                              | operator        | value                                                                      |
// | ---------------------------------- | --------------- |--------------------------------------------------------------------------- |
// | `user.custom_fields_{key}`         | `is`,<br />`is_not`,<br />`present` (omit value),<br />`not_present` (omit value),<br />`includes` (contains one word),<br />`not_includes` (contains none of the words),<br />`includes_string` (contains string),<br />`not_includes_string` (does not contain string) | Specify the key of the custom user field. See [User fields](./user_fields). Possible values vary depending on the field. See [user_fields](./users#user-fields) in the Users API. |
// | `organization.custom_fields_{key}` | `is`,<br />`is_not`,<br />`present` (omit value),<br />`not_present` (omit value),<br />`includes` (contains one word),<br />`not_includes` (contains none of the words),<br />`includes_string` (contains string),<br />`not_includes_string` (does not contain string) | Specify the key of the custom organization field. See [Organization fields](./organization_fields). Possible values vary depending on the field. See [organization_fields](./organizations) in the Organizations API. |
//
// Triggers have the following additional operators for some shared fields.
//
// | Fields              | Additional trigger operators |
// | ------------------- | ---------------------------- |
// | `status`,<br />`type`,<br />`priority`,<br />`group_id`,<br />`assignee_id`,<br />`requester_id`,<br />`organization_id`,<br />`satisfaction_ score` | `changed` (omit value property),<br />`value` (changed to),<br />`value_previous` (changed from),<br />`not_changed`,<br />`not_value` (not changed to),<br />`not_value_previous` (not changed from) |
//
// ##### Additional trigger conditions
//
// Triggers have the following additional conditions.
//
// | field                     | operator                                           | value                                                                                   |
// | ------------------------- | -------------------------------------------------- |---------------------------------------------------------------------------------------- |
// | `subject_includes_word`   | `includes` (contains one word),<br />`not_includes` (contains none of the words),<br />`is` (contains string),<br />`is_not` (does not contain string) | Single words or strings in the subject. |
// | `comment_includes_word`   | `includes` (contains one word),<br />`not_includes` (contains none of the words),<br />`is` (contains string),<br />`is_not` (does not contain string) | Single words or strings in either the subject or body of the comment. |
// | `current_via_id`          | `is` or `is_not`                                   | The numeric ID of the channel used to update the ticket. See the [Via Types](#via-types) table. |
// | `update_type`             | Omit the operator property.                        | `Create` or `Change`                                                                    |
// | `comment_is_public`       | Omit the operator property.                        | `true`, `false`, `not_relevant` (present), or `requester_can_see_comment` (present and requester can see comment) |
// | `ticket_is_public`        | Omit the operator property.                        | `public`, `private`
// | `reopens`                 | `less_than`, `greater_than`, or `is`               | The number of times a ticket has moved from Solved to Open or Pending.                  |
// | `replies`                 | `less_than`, `greater_than`, or `is`               | The number of public agent comments.                                                    |
// | `agent_stations`          | `less_than`, `greater_than`, or `is`               | The number of different agents to which a ticket has been assigned.                     |
// | `group_stations`          | `less_than`, `greater_than`, or `is`               | The number of different groups to which a ticket has been assigned.                     |
// | `in_business_hours`       | Omit the operator property.                        | `true` or `false`. Available only if an administrator enabled business hours.           |
// | `requester_twitter_followers_count` | `less_than`, `greater_than`, or `is`     | The number of the requester's Twitter followers.                                        |
// | `requester_twitter_statuses_count`  | `less_than`, `greater_than`, or `is`     | The total number of the requester's tweets.                                             |
// | `requester_twitter_verified`        | Omit the operator property               | Omit the value property. The condition is true if the requester has a verified Twitter account. |
//
// ##### Additional SLA Policies conditions
//
// SLA Policies have the following additional conditions.
//
// | field                       | operator                                                               | value                                                                                           |
// | --------------------------- | ---------------------------------------------------------------------- |-------------------------------------------------------------------------------------------------|
// | `ticket_type_id`            | `is`, `is_not`                                                         | The numeric ID of the ticket type: 1 (`question`), 2 (`incident`), 3 (`problem`), or 4 (`task`) |
// | `current_via_id`            | `is` or `is_not`                                                       | The numeric ID of the channel used to update the ticket. See the [Via Types](#via-types) table. |
// | `exact_created_at`          | `less_than`, `less_than_equal`, `greater_than` or `greater_than_equal` | The time the ticket was created.                                                                |
//
// ##### Additional time-based conditions for automations and views
//
// Automations and views have the following time-based conditions. Time-based conditions can only be used in `all` arrays, not in `any` arrays.
//
// | field                     | value                                          |
// | ------------------------- |----------------------------------------------- |
// | `NEW`                     | Hours since the ticket was created.            |
// | `OPEN`                    | Hours since the ticket was opened.             |
// | `PENDING`                 | Hours since the ticket was changed to pending. |
// | `SOLVED`                  | Hours since the ticket was changed to solved.  |
// | `CLOSED`                  | Hours since the ticket was closed.             |
// | `assigned_at`             | Hours since assigned.                          |
// | `updated_at`              | Hours since update.                            |
// | `requester_updated_at`    | Hours since requester update.                  |
// | `assignee_updated_at`     | Hours since assignee update.                   |
// | `due_date`                | Hours since the due date. For tickets with the type set to Task. |
// | `until_due_date`          | Hours until the due date. For tickets with the type set to Task. |
//
// The time-based conditions all share the same operator values:
//
// | operator
// | --------
// | `is`
// | `is_business_hours`
// | `less_than`
// | `less_than_business_hours`
// | `greater_than`
// | `greater_than_business_hours`
//
// ##### Via Types
//
// | Description                | via type                | via id |
// | -------------------------- | ----------------------- | :---:  |
// | Web form                   | web_form                | 0      |
// | Email                      | mail                    | 4      |
// | Chat                       | chat                    | 29     |
// | Twitter                    | twitter                 | 30     |
// | Twitter DM                 | twitter_dm              | 26     |
// | Twitter like               | twitter_favorite        | 23     |
// | Voicemail                  | voicemail               | 33     |
// | Phone call (incoming)      | phone_call_inbound      | 34     |
// | Phone call (outbound)      | phone_call_outbound     | 35     |
// | CTI* voicemail             | api_voicemail           | 44     |
// | CTI phone call (inbound)   | api_phone_call_inbound  | 45     |
// | CTI phone call (outbound)  | api_phone_call_outbound | 46     |
// | SMS                        | sms                     | 57     |
// | Get Satisfaction           | get_satisfaction        | 16     |
// | Web Widget                 | web_widget              | 48     |
// | Mobile SDK                 | mobile_sdk              | 49     |
// | Mobile                     | mobile                  | 56     |
// | Help Center post           | helpcenter              | 50     |
// | Web service (API)          | web_service             | 5      |
// | Trigger, automation        | rule                    | 8      |
// | Closed ticket              | closed_ticket           | 27     |
// | Ticket sharing             | ticket_sharing          | 31     |
// | Facebook post              | facebook_post           | 38     |
// | Facebook private message   | facebook_message        | 41     |
// | Satisfaction prediction    | satisfaction_prediction | 54     |
// | Channel framework          | any_channel             | 55     |
// | LINE                       | line                    | 72     |
// | WeChat                     | wechat                  | 73     |
// | WhatsApp                   | whatsapp                | 74     |
//
// *CTI - [Computer Telephony Integration](https://www.zendesk.com/talk/features/computer-telephony-integration/)
