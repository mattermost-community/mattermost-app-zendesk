const zdClient = require('../zendesk/client');
const mmClient = require('../mattermost/client');

class App{
  // createTicketFromPost
  async createTicketFromPost(ticket, channel_id, user_id, post_id) {
    const result = await zdClient.tickets.create(ticket)
    const user = await zdClient.users.show(result.requester_id)
    const host = process.env.ZENDESK_URL;

    const message = `${user.name} created ticket [#${result.id}](${host}/agent/tickets/${result.id}) [${result.subject}]`;
    const pRes = mmClient.createPost({
        message,
        channel_id,
        user_id,
        root_id: post_id,
    })
  }

  // createTicketFromWebhook
  async createPostFromWebhook(req) {
    const message = `${req.body.ticketID} created ticket [#${req.body.ticketID}](${req.body.ticketUrl}) Type: ${req.body.ticketType} Priority: ${req.body.ticketPriority} [${req.body.title}]`;
    const pRes = mmClient.createPost({
        message,
        channel_id: "rgiqcxrm8jdjzgj536gb45oh3e",
        user_id: "6fiyj9ni9t835dnbni1ddrj93y",
        root_id: "8dfjwummwfds8ptws3ha9ai6fr",
    })
  }
}

module.exports = new App()

