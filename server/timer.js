const db = require('./config/conn');

module.exports = (io) => {
	let exp = {};
	let timerArr = {};

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
			if (!timerArr[roomCode]) timerArr[roomCode] = [];
			timerArr[roomCode].push(
				setTimeout(async () => {
					let room = await db.Room.findOneAndUpdate(
						{ roomCode: roomCode },
						{ $pop: { queue: -1 }, $set: { changedat: new Date().getTime() } }
					);
					io.to(roomCode).emit('currently_playing', { song: room.queue[1], playedNext: false });
					console.log(room);
				}, timerVal)
			);
		} catch (err) {
			console.log(err);
		}
	};

	exp.clearTimers = async (roomCode) => {
		try {
			for (i = 0; i < timerArr[roomCode].length; i++) {
				clearTimeout(timerArr[roomCode][i]);
			}
			console.log('Successfully cleared timers.');
		} catch (err) {
			console.log(err);
		}
	};

	exp.setNextTimer = async (roomCode, duration) => {
		try {
			timerArr[roomCode].push(
				setTimeout(async () => {
					let room = await db.Room.findOneAndUpdate(
						{ roomCode: roomCode },
						{ $pop: { queue: -1 }, $set: { changedat: new Date().getTime() } }
					);
					io.to(roomCode).emit('currently_playing', { song: room.queue[1], playedNext: false });
					console.log(room);
				}, duration)
			);
		} catch (err) {
			console.log(err);
		}
	};

	return exp;
};
