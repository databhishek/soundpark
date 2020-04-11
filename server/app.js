const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const cookieParser = require('cookie-parser');

const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.static(__dirname + '/public'))
app.use(cookieParser());

app.use('/', routes);

console.log('Listening on 8888.');
app.listen(8888);