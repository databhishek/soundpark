const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const routes = require('./routes')(passport, io);
const db = require('./config/conn');
const redis = require('redis');
const redisClient = redis.createClient();
const redisStore = require('connect-redis')(session);
require('dotenv').config();

// const cors = require('cors');
// const corsOptions = {
// 	origin: 'http://localhost:3000',
// 	optionsSuccessStatus: 200,
// 	credentials: true // some legacy browsers (IE11, various SmartTVs) choke on 204
// };

// app.use(cors(corsOptions));

redisClient.on('error', (err) => {
	console.log('Redis error: ', err);
});

app.use(
	session({
		secret: process.env.SESS,
		resave: false,
		saveUninitialized: false,
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

app.use('/', routes);

io.set('transports', ['websocket']);
io.on('connection', (socket) => {
	// Socket Connected
	console.log('Socket connected: ' + socket.id);

	// Join Room
	socket.on('join_room', (roomCode) => {
		socket.join(roomCode, () => {
			if (roomCode === null) {
				console.log('No room yet.');
			} else {
				db.Room.find({ roomCode: roomCode }, null, (err, data) => {
					if (err) console.log(err);
					else if(data.length) {
						console.log('Joined room: ' + roomCode);
						io.to(roomCode).emit('joined_room', {
							roomName: data[0].roomName,
							queue: data[0].queue,
							users: data[0].users
						});
					}
				});
			}
		});
	});

	// Leave Room
	socket.on('leave_room', (roomCode) => {
		socket.leave(roomCode);
		db.Room.find({ roomCode: roomCode }, 'users', (err, data) => {
			if (err) console.log(err);
			else {
				console.log('Left room: ' + roomCode);
				io.to(roomCode).emit('left_room', data[0].users);
			}
		});
	});

	// Socket Disconnected
	socket.on('disconnect', () => {
		console.log('Socket disconnected.');
	});
});

console.log('Listening on 8888.');
server.listen(8888);
