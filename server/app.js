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

// Headers for allowing cross-domain credential access
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Origin', req.headers.origin);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
	);
	if ('OPTIONS' == req.method) {
		res.sendStatus(200);
	} else {
		next();
	}
});

app.use(express.static(__dirname + '/public'));

app.use(
	session({
		secret: 'spotifyParty',
		saveUninitialized: true,
		resave: true,
		cookie: { maxAge: 3600000 } // 1 Hour
	})
);
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
	origin: 'http://localhost:3000',
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
			if(roomCode === null) {
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

console.log('Listening on 8888');
server.listen(8888);
