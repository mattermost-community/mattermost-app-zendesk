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

// Mattermost routes must be at root URL level.  The cloud-apps proxy plugin
// resolves certain paths based on the provided Root URL
app.use('', mmRoutes);

app.listen(process.env.PORT || 4000, () => console.log('Listening'));
