const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
	pingTimeout: 18000000 // 30 mins
});
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

var sockClients = [];
io.set('transports', [
	'websocket'
]);
io.on('connection', (socket) => {
	// Socket Connected
	console.log('Socket connected: ' + socket.id);

	// Join Room
	socket.on('join_room', (data) => {
		socket.join(data.room, async () => {
			if (data.room === null) {
				console.log('No room yet.');
			} else {
				sockClients.push({
					sockId: socket.id,
					name: data.name
				});
				let dbData = db.Room.find({ roomCode: data.room });
				io.in(data.room).clients((err, clients) => {
					if (err) console.log(err);
					else {
						// Map all ID's to their respective names
						let clientNames = [];
						clients.map((client) => {
							let name = sockClients.find((sockClient) => sockClient.sockId === client);
							clientNames.push(name);
						});
						console.log(clientNames);
						console.log('Joined room: ' + data.room);
						io.to(data.room).emit('joined_room', {
							roomName: dbData[0].roomName,
							queue: dbData[0].queue,
							users: clientNames
						});
					}
				});
			}
		});
	});

	// Leave Room
	socket.on('leave_room', (data) => {
		socket.leave(data.room);
		// Remove user from room list
		sockClients = sockClients.filter((sockClient) => {
			return sockClient.name !== data.name
		});
		io.in(data.room).clients((err, clients) => {
			if (err) console.log(err);
			else {
				// Map all ID's to their respective names
				let clientNames = [];
				clients.map((client) => {
					let name = sockClients.find((sockClient) => sockClient.sockId === client);
					clientNames.push(name);
				});
				console.log(clientNames);
				io.to(data.room).emit('left_room', clientNames);
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
