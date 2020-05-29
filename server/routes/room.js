const db = require('../conn');
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
    const spotify = require('./spotify')();

    let interval;
    let exp = {};

    exp.createRoom = async (req, res) => {
        try{
            let c = generateRandomString(6);
            let d = new Date();
            console.log(req.body);
            let room = new db.Room({
                roomName: req.body.roomName,
                roomCode: c,
                queue: [],
                changedat: d.getTime()
            });
            await room.save();
            console.log('Room created.');
            return res.send(room.roomCode);
        } catch(err) {
            return res.send(err);
        }
    }

    exp.joinRoom = async (req, res) => {
        try {
            let room;
            room = await db.Room.find({roomCode: req.query.roomCode});
            console.log(room);
            // await io.join(room[0].roomCode);
            console.log(io.rooms);
            res.send(room[0]);
        } catch(err) {
            return res.send(err);
        }
    }

    exp.leaveRoom = async (req, res) => {
        try{
            io.leave(req.body.code);
            clearInterval(interval);
        } catch(err) {
            return res.send(err);
        }
    }

    exp.getRooms = async (req, res) => {
        try{
            let rooms = await db.room.find(null, 'roomName roomCode');
            return res.send(rooms);
        } catch(err) {
            return res.send(rooms);
        }
    }

    return exp;
}