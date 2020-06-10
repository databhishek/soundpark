const db = require('../config/conn');
const axios = require('axios');
axios.defaults.baseURL = 'https://api.spotify.com/v1';

module.exports = (io) => {
	const timer = require('../timer')(io);

	let exp = {};

	exp.getCurrentlyPlaying = async (req, res) => {
		try {
			let resp = await axios.get('/me/player/currently-playing', {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			return res.send(resp.data).status(200);
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
	};

	exp.searchTrack = async (req, res) => {
		try {
			let resp = await axios.get('/search', {
				params: {
					q: req.query.searchValue,
					type: 'track'
				},
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			return res.send(resp.data).status(200);
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
	};

	exp.queueReturns = async (req, res) => {
		try {
			let room = req.body.room;
			let id = req.body.id;
			let Q = await db.Room.find({ roomCode: room }, 'queue');
			Q = Q[0].queue;
			Q = Q.map((song) => song.uri);
			if (req.user.profile.id === id) return res.send('You are the initial user who queued.').status(200);
			if (Q.length === 1) {
				await axios.put(
					'/me/player/play',
					{ uris: Q },
					{
						headers: {
							Authorization: 'Bearer ' + req.user.accessToken
						}
					}
				);
			} else {
				await axios.post('/me/player/queue', null, {
					params: {
						uri: Q[Q.length - 1]
					},
					headers: { Authorization: 'Bearer ' + req.user.accessToken }
				});
			}
			return res.send('Success.').status(200);
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
	};

	exp.addToQueue = async (req, res) => {
		try {
			let songToAdd = req.body.track;
			let room = req.body.roomCode;
			let trackData = await axios.get('/tracks/' + songToAdd.id, {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			let currSong = await axios.get('/me/player/currently-playing', {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			let song = new db.Queue({
				trackName: songToAdd.name,
				artist: songToAdd.artist,
				album: songToAdd.album,
				albumArt: songToAdd.albumArt.url,
				uri: songToAdd.uri,
				duration: trackData.data.duration_ms
			});
			await db.Room.findOneAndUpdate(
				{ roomCode: room },
				{
					$push: { queue: song }
				}
			);
			let Q = await db.Room.find({ roomCode: room }, 'queue');
			Q = Q[0].queue;
			io.to(room).emit('add_to_queue', { id: req.user.profile.id, queue: Q });
			let Q2 = Q;
			Q = Q.map((song) => song.uri);
			if (Q.length === 1) {
				await axios.put(
					'/me/player/play',
					{ uris: Q },
					{
						headers: { Authorization: 'Bearer ' + req.user.accessToken }
					}
				);
				await db.Room.updateOne({ roomCode: room }, { $set: { changedat: new Date().getTime() } });
				timer.setTimer(room, 0);
			} else {
				await axios.post('/me/player/queue', null, {
					params: {
						uri: Q[Q.length - 1]
					},
					headers: { Authorization: 'Bearer ' + req.user.accessToken }
				});
				timer.setTimer(room, currSong.data.progress_ms);
			}
			return res.send(Q2).status(200);
		} catch (e) {
			return res.send(e);
		}
	};

	exp.playPause = async (req, res) => {
		try {
			let room = await db.Room.find({ roomCode: req.query.roomCode });
			let Q = [];
			Q[0] = room[0].queue[0].uri;
			let resp = await axios.get('/me/player/currently-playing', {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			if (resp.data.is_playing) {
				await axios.put('/me/player/pause', null, {
					headers: { Authorization: 'Bearer ' + req.user.accessToken }
				});
				return res.send('Paused');
			} else {
				await axios.put(
					'/me/player/play',
					{
						uris: Q,
						position_ms: new Date().getTime() - room[0].changedat
					},
					{
						headers: { Authorization: 'Bearer ' + req.user.accessToken }
					}
				);
				return res.send('Played');
			}
		} catch (err) {
			return res.send(err);
		}
	};

	exp.join = async (token, code) => {
		try {
			let room = await db.Room.find({ roomCode: code });
			let Q = room[0].queue;
			Q = Q.map((song) => song.uri);
			console.log(Q);
			let Q2 = [];
			Q2[0] = Q[0];
			if (Q.length > 0) {
				await axios.put(
					'/me/player/play',
					{
						uris: Q2,
						position_ms: new Date().getTime() - room[0].changedat
					},
					{
						headers: { Authorization: 'Bearer ' + token }
					}
				);
			}
			console.log(Q);
			Q.shift();
			for (i = 0; i < Q.length; i++) {
				await axios.post('/me/player/queue', null, {
					params: {
						uri: Q[i]
					},
					headers: { Authorization: 'Bearer ' + token }
				});
			}
		} catch (err) {
			console.log(err);
		}
	};

	exp.playNext = async (req, res) => {
		try {
			let roomCode = req.body.roomCode;
			timer.clearTimers(roomCode);
			let room = await db.Room.findOneAndUpdate(
				{ roomCode: roomCode },
				{ $pop: { queue: -1 }, $set: { changedat: new Date().getTime() } }
			);
			let Q = room.queue;
			Q.shift(); // Mongo returns queue before the update
			if (Q.length > 0) {
				await axios.post('/me/player/next', null, {
					headers: { Authorization: 'Bearer ' + req.user.accessToken }
				});
				io.to(roomCode).emit('currently_playing', { song: Q[0], playedNext: true, id: req.user.profile.id });
			}
			let durationSum = 0;
			for (i = 0; i < Q.length; i++) {
				durationSum += Q[i].duration;
				timer.setNextTimer(roomCode, durationSum);
			}

			return res.send('Success.');
		} catch (err) {
			console.log(err);
			return res.send(err);
		}
	};

	exp.playNextReturns = async (req, res) => {
		try {
			let id = req.body.id;
			if(req.user.profile.id === id) return res.send('You are the one who pressed next.').status(200);
			await axios.post('/me/player/next', null, {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			return res.send('Success.').status(200);
		} catch (err) {
			console.log(err);
			return res.send(err);
		}
	};

	return exp;
};
