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
	spotifyID: { type: String, unique: true },
	spotifyAccessToken: String,
	spotifyRefreshToken: String
});

const QueueSchema = new mongoose.Schema({
	trackName: String,
	artist: String,
	album: String,
	albumArt: String,
	uri: String,
	duration: Number
});

const RoomSchema = new mongoose.Schema({
	roomName: String,
	roomCode: String,
	queue: [ QueueSchema ],
	changedat: Number
});

exp.User = mongoose.model('User', UserSchema);
exp.Room = mongoose.model('Room', RoomSchema);
exp.Queue = mongoose.model('Queue', QueueSchema);

module.exports = exp;
