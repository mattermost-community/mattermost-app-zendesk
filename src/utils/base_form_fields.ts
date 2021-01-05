import {AppCall} from 'mattermost-redux/types/apps';

import Client4 from 'mattermost-redux/client/client4.js';

import {ZDClient} from '../clients';

import {Ibuilder, newFieldsBuilder} from './helper_classes/fields/fields_builder';

// BaseFormFields call provides base methods for retrieving viewable modal app fields
export class BaseFormFields {
    call: AppCall;
    builder: Ibuilder;
    zdClient: ZDClient;
    mmClient: Client4;

    constructor(call: AppCall, zdClient: ZDClient, mmClient: Client4) {
        this.call = call;
        this.builder = newFieldsBuilder(this.call);
        this.builder.setDefaultMinLength(2);
        this.builder.setDefaultMaxLength(1024);
        this.zdClient = zdClient;
        this.mmClient = mmClient;
    }

    getCurrentTeamID(): string {
        return this.call.context.team_id || '';
    }

    getCurrentChannelID(): string {
        return this.call.context.channel_id || '';
    }

    getCallValues(): string {
        return this.call.values;
    }
}
