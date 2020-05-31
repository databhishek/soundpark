const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const express = require('express');
const SpotifyStrategy = require('passport-spotify').Strategy;

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const routes = require('./routes')(passport, io);
const db = require('./conn');

app.use(express.static(__dirname + '/public'));

passport.serializeUser((User, done) => {
	return done(null, User);
});

passport.deserializeUser((User, done) => {
	return done(null, User);
});

passport.use(
	new SpotifyStrategy(
		{
			clientID: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
			callbackURL: process.env.SPOTIFY_REDIRECT_URI
		},
		(accessToken, refreshToken, expires_in, profile, done) => {
			db.User.findOneAndUpdate(
				{
					spotifyID: profile.id
				},
				{
					spotifyAccessToken: accessToken,
					spotifyRefreshToken: refreshToken
				},
				{
					upsert: true
				},
				(err) => {
					if (err) console.log(err);
					else return done(null, accessToken);
				}
			);
		}
	)
);

app.use(cookieParser());
app.use(
	session({ secret: 'spotifyParty', spotifyToken: null, saveUninitialized: false, resave: true })
);
app.use(passport.initialize());
app.use(passport.session());

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
	console.log('Socket connected ' + socket.id);

	socket.on('join_room', (roomCode) => {
		socket.join(roomCode, () => {
			console.log('Joined room ' + roomCode);
			db.Room.find({roomCode: roomCode}, 'queue', (err, data) => {
				if(err) console.log(err);
				else {
					io.to(roomCode).emit('joined_room', data[0].queue);
				}
			});
		});
	});

	socket.on('leave_room', (roomCode) => {
		socket.leave(roomCode);
		console.log('Left room' + roomCode);
	});

	socket.on('disconnect', () => {
		console.log('Socket disconnected');
	});
});

console.log('Listening on 8888');
server.listen(8888);
