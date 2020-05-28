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
            room = await db.Room.create({
                roomName: req.body.name,
                roomCode: c,
                queue: [],
                changedat: d.getTime()
            });
            return res.send(room.roomCode);
        } catch(err) {
            return res.send(err);
        }
    }

    exp.joinRoom = async (req, res) => {
        try{
            let room = await db.Room.find({roomCode: req.body.code});
            io.join(room.roomCode);
            interval = setInterval(() => {
                if(room.queue.length > 0)
                    playback(room);
                else
                    io.to(room.roomCode).emit('currently_playing', null);
            }, 1000);
            res.send(room);
        } catch(err) {
            return res.send(err);
        }
    }

    let playback = (room) => {
        while(room.queue.length > 0){
            setTimeout(async () => {
                let d = new Date();
                await db.Room.update(
                    {roomCode: room.roomCode},
                    {$pop: {queue: -1}, $set: {changedat: d.getTime()}}
                );
                io.to(room.roomCode).emit('currently_playing', room.queue[0]);
            }, room.queue[0].duration);
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