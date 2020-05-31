const db = require('./conn');

module.exports = (io) => {
	let exp = {};

	exp.setTimer = async (roomCode, progress) => {
		try {
			console.log('In Timer');
			let timerVal = 0;
			let queue = await db.Room.find({ roomCode: roomCode }, 'queue');
			queue = queue[0].queue;
			for (i = 0; i < queue.length; i++) {
				timerVal += queue[i].duration;
			}
			timerVal -= progress;
			let timeOut = setTimeout(async () => {
				let d = new Date();
				let room = await db.Room.findOneAndUpdate(
					{ roomCode: roomCode },
					{ $pop: { queue: -1 }, $set: { changedat: d.getTime() } }
				);
				io.to(roomCode).emit('currently_playing', room.queue[1]);
				console.log("Emitted for currently playing.");
			}, timerVal);
		} catch(err) {
			console.log(err);
		}
	};

	return exp;
};
