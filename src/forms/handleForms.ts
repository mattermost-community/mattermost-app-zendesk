import app from '../app/app';

import {newCreateTicketForm} from './create_ticket';

// BaseForm routes the call type to its corresponding method
export class BaseForm {
    constructor(call: AppCall) {
        this.call = call;
    }

    handle() {
        switch (this.call.type) {
        case 'form':
            return this.handleForm();
        case 'lookup':
            return this.handleLookup();
        default:
            return this.handleSubmit();
        }
    }
}

// CreateTicketForm handles creation and submission for creating a ticket from a post
export class CreateTicketForm extends BaseForm {
    handleForm() {
        return newCreateTicketForm(this.call);
    }

    async handleSubmit() {
        let jsonRes = {};
        try {
            await app.createTicketFromPost(this.call);
        } catch (err) {
            jsonRes = {
                type: 'error',
                error: err.message,
            };
        }
        return jsonRes;
    }
}
