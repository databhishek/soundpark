const db = require('../config/conn');
require('dotenv').config();

var generateRandomString = (length) => {
	var text = '';
	var possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

module.exports = (io) => {
	const spotify = require('./spotify')(io);

	let interval;
	let exp = {};

	exp.createRoom = async (req, res) => {
		try {
			let c = generateRandomString(6);
			console.log(req.body);
			let room = new db.Room({
				roomName: req.body.roomName,
				roomCode: c,
				queue: [],
				changedat: 0
			});
			await room.save();
			console.log('Room created.');
			return res.send(room.roomCode);
		} catch (err) {
			return res.send(err);
		}
	};

	exp.joinRoom = async (req, res) => {
		try {
			let room = await db.Room.find({ roomCode: req.query.roomCode });
			spotify.play(req.query.roomCode);
			res.send(room[0]);
		} catch (err) {
			return res.send(err);
		}
	};

	exp.leaveRoom = async (req, res) => {
		try {
			io.on('leave_room', (socket) => {
				socket.leave(req.body.code);
			});
		} catch (err) {
			return res.send(err);
		}
	};

	exp.getRooms = async (req, res) => {
		try {
			let rooms = await db.room.find(null, 'roomName roomCode');
			return res.send(rooms);
		} catch (err) {
			return res.send(rooms);
		}
	};

	return exp;
};
