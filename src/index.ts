import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import zdRoutes from './restapi/zd_routes';
import mmRoutes from './restapi/mm_routes';

const app = express();
app.use(cors({origin: 'http://localhost:8065', credentials: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.use('/zendesk', zdRoutes); // Zendesk router
app.use('/mattermost', mmRoutes); // Mattermost router

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Listening on ' + port));
