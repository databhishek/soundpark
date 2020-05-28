const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const express = require('express');
// const routes = require('./routes');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const routes = require('./routes')(io);

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session({secret: 'spotifyParty', saveUninitialized: true, resave: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use('/', routes);

io.on('connection', socket => {
    console.log('socket connected');
})

console.log('Listening on 8888.');
app.listen(8888);