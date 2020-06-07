const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const routes = require('./routes')(passport, io);
const db = require('./config/conn');
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);
require('dotenv').config({ path: '../.env' });

redisClient.on('error', (err) => {
	console.log('Redis error: ', err);
});

app.use(
	session({
		secret: process.env.SESS,
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
		store: new redisStore({
			host: 'localhost',
			port: 6379,
			client: redisClient,
			ttl: 604800
		})
	})
);
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
	origin: 'http://13.233.142.76',
	credentials: true,
	optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use('/', routes);

io.on('connection', (socket) => {
	// Socket Connected
	console.log('Socket connected: ' + socket.id);

	// Join Room
	socket.on('join_room', (roomCode) => {
		socket.join(roomCode, () => {
			if (roomCode === null) {
				console.log('No room yet.');
			} else {
				console.log('Joined room: ' + roomCode);
				db.Room.find({ roomCode: roomCode }, 'queue', (err, data) => {
					if (err) console.log(err);
					else {
						io.to(roomCode).emit('joined_room', data[0].queue);
					}
				});
			}
		});
	});

	// Leave Room
	socket.on('leave_room', (roomCode) => {
		socket.leave(roomCode);
		console.log('Left room: ' + roomCode);
	});

	// Socket Disconnected
	socket.on('disconnect', () => {
		console.log('Socket disconnected.');
	});
});

console.log('Listening on 8888.');
server.listen(8888);
