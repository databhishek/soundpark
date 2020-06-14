const db = require('../config/conn');

var generateRandomString = (length) => {
	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
};

module.exports = (io) => {
	const spotify = require('./spotify')(io);

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
			if (!room) return res.send('Invalid room code.');
			console.log('Joining room: ' + req.user.displayName);
			await db.Room.findOneAndUpdate(
				{ roomCode: req.query.roomCode, 'users.id': { $ne: req.user.id } },
				{
					$push: {
						users: {
							id: req.user.id,
							name: req.user.displayName
						}
					}
				}
			);
			spotify.join(req.user.accessToken, req.query.roomCode, req.user.currentDevice);
			return res.status(200).send(room[0]);
		} catch (err) {
			return res.send(err);
		}
	};

	exp.leaveRoom = async (req, res) => {
		try {
			await db.Room.findOneAndUpdate(
				{ roomCode: req.query.roomCode },
				{
					$pull: {
						users: {
							id: req.user.id,
							name: req.user.displayName
						}
					}
				}
			);
			return res.status(200).send('Left room: ' + req.user.displayName);
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
