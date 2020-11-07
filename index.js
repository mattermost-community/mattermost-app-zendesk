require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const zdRoutes = require('./restapi/zd_routes');
const mmRoutes = require('./restapi/mm_routes');

const app = express();
app.use(cors({origin: 'http://localhost:8065', credentials: true}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));

app.get('/', ((req, res) => {
    res.send('Hello Zendesk');
}));

app.use(zdRoutes.path, zdRoutes.routes); // Zendesk router
app.use(mmRoutes.path, mmRoutes.routes); // Mattermost router

app.listen(4000, () => console.log('Listening'));
