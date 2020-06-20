const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/spotify', {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
});

mongoose.set('useCreateIndex', true);

mongoose.connection.on('connected', () => {
	console.log('Mongoose is connected.');
});

mongoose.connection.on('error', (err) => {
	console.log(err, 'Mongoose failed to connect.');
});

mongoose.connection.on('disconnected', () => {
	console.log('Mongoose is disconnected.');
});

let exp = {};

const UserSchema = new mongoose.Schema({
	id: String,
	username: String,
	displayName: String,
	profileUrl: String,
	subscription: String,
	accessToken: String,
	refreshToken: String,
	currentDevice: String
});

const QueueSchema = new mongoose.Schema({
	trackName: String,
	artist: String,
	album: String,
	albumArt: String,
	uri: String,
	duration: Number,
	addedBy: String
});

const RoomSchema = new mongoose.Schema({
	roomName: String,
	roomCode: String,
	queue: [ QueueSchema ],
	users: [
		{
			id: String,
			name: String
		}
	],
	changedat: Number
});

exp.User = mongoose.model('User', UserSchema);
exp.Room = mongoose.model('Room', RoomSchema);
exp.Queue = mongoose.model('Queue', QueueSchema);

module.exports = exp;
