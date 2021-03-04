import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import serverless from 'serverless-http';
import bodyParser from 'body-parser';

import mmRoutes from './restapi/mm_routes';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use('/zendesk', zdRoutes); // Zendesk router
app.use('/', mmRoutes); // Mattermost router

if (isRunningInHTTPMode()) {
    // Listen to http port
    const port = getPort();
    app.listen(port, () => console.log('Listening on ' + port));
} else {
    // Export handle for aws lambda
    module.exports.handler = serverless(app);
}

export function isRunningInHTTPMode(): boolean {
    return process.env.LOCAL === 'true';
}

function getPort(): number {
    return Number(process.env.PORT) || 4000;
}

export function getHTTPPath(): string {
    return 'http://localhost:' + getPort();
}
