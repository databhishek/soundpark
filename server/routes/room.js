const db = require('../conn');
require('dotenv').config();

module.exports = (io) => {
    const spotify = require('./spotify')();
    let exp = {};

    exp.createRoom = async (req, res) => {
        try{
            let d = new Date();
            room = await db.Room.create({
                roomName: req.body.name,
                queue: [],
                changedat: d.getTime()
            });
            io.join(room._id);
        } catch(err) {
            return res.send(err);
        }
    }

    exp.joinRoom = async (req, res) => {
        try{
            let room = await db.Room.find(req.body.name);
            io.join(room._id);
            while(room.queue.length){
                setTimeout(async () => {
                    let d = new Date();
                    await db.Room.update(
                        {_id: room._id},
                        {$pop: {queue: -1}, $set: {changedat: d.getTime()}}
                    );
                    io.to(room._id).emit('currently_playing', room.queue[0]);
                }, room.queue[0].duration);
            }
        } catch(err) {
            return res.send(err);
        }
    }

    exp.leaveRoom = async (req, res) => {
        try{
            let room = await db.Room.find(req.body.name);
            io.leave(room);
        } catch(err) {
            return res.send(err);
        }
    }

    return exp;
}