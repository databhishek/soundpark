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
			return res.status(200).send(resp.data);
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
			return res.status(200).send(resp.data);
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
	};

	exp.queueReturns = async (req, res) => {
		try {
			let room = req.body.room;
			let Q = await db.Room.find({ roomCode: room });
			// console.log(Q);
			let Q2 = [];
			Q2[0] = Q[0].queue[0].uri;
			let resp = await axios.put(
				'/me/player/play',
				{ uris: Q2 },
				{
					params: {
						device_id: req.user.currentDevice
					},
					headers: {
						Authorization: 'Bearer ' + req.user.accessToken
					}
				}
			);
			console.log('/play called with status: ' + resp.status);
			return res.status(200).send('Success.');
		} catch (err) {
			if(err.response.status === 404)
				return res.status(404).send('Not found');
			return res.send(err);
		}
	};

	exp.addToQueue = async (req, res) => {
		try {
			let songToAdd = req.body.song;
			let room = req.body.roomCode;
			let trackData = await axios.get('/tracks/' + songToAdd.id, {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			let curr = await db.Room.find({ roomCode: room});
			curr = curr[0].changedat;
			let song = new db.Queue({
				trackName: songToAdd.name,
				artist: songToAdd.artist,
				album: songToAdd.album,
				albumArt: songToAdd.albumArt.url,
				uri: songToAdd.uri,
				duration: trackData.data.duration_ms
			});
			await db.Room.findOneAndUpdate({ roomCode: room }, { $push: { queue: song } });
			let Q = await db.Room.find({ roomCode: room }, 'queue');
			Q = Q[0].queue;
			io.to(room).emit('added_to_queue', Q);
			let Q2 = Q;
			Q = Q.map((song) => song.uri);
			if (Q.length === 1) {
				await db.Room.updateOne({ roomCode: room }, { $set: { changedat: new Date().getTime() } });
				timer.setTimer(room, 0);
			} else timer.setTimer(room, new Date().getTime() - curr);
			return res.status(200).send(Q2);
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
				console.log('/pause called with status: ' + resp.status);
				return res.send('Paused');
			} else {
				await axios.put(
					'/me/player/play',
					{
						uris: Q,
						position_ms: new Date().getTime() - room[0].changedat
					},
					{
						params: {
							device_id: req.user.currentDevice
						},
						headers: { Authorization: 'Bearer ' + req.user.accessToken }
					}
				);
				console.log('/play called with status: ' + resp.status);
				return res.send('Played');
			}
		} catch (err) {
			if(err.response.status === 404)
				return res.status(404).send('Not found');
			return res.send(err);
		}
	};

	exp.join = async (token, code, deviceID) => {
		try {
			let room = await db.Room.find({ roomCode: code });
			let Q = room[0].queue;
			Q = Q.map((song) => song.uri);
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
						params: {
							device_id: deviceID
						},
						headers: {
							Authorization: 'Bearer ' + token
						}
					}
				);
			}
			console.log('/play called with status: ' + resp.status);
			return res.status(200).send('Success');
		} catch (err) {
			if(err.response.status === 404)
				return res.status(404).send('Not found');
			res.send(err);
		}
	};

	exp.playNext = async (req, res) => {
		try {
			let roomCode = req.body.roomCode;
			timer.clearTimers(roomCode);
			let room = await db.Room.findOneAndUpdate({ roomCode: roomCode }, { $pop: { queue: -1 }, $set: { changedat: new Date().getTime() } });
			let Q = room.queue;
			Q.shift(); // Mongo returns queue before the update
			if (Q.length > 0) {
				io.to(roomCode).emit('currently_playing', Q[0]);
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

	exp.getDevices = async (req, res) => {
		try {
			let resp = await axios.get('/me/player/devices', {
				headers: { Authorization: 'Bearer ' + req.user.accessToken }
			});
			resp = resp.data.devices;
			console.log(resp);
			resp.forEach((ele, idx, arr) => {
				if (ele.is_restricted) arr.splice(idx, 1);
			});
			return res.status(200).send(resp);
		} catch (err) {
			console.log(err);
			return res.send(err);
		}
	};

	exp.setDevice = async (req, res) => {
		try {
			await db.User.findOneAndUpdate(
				{ id: req.user.id },
				{
					$set: { currentDevice: req.body.deviceID }
				}
			);
			console.log('Device selected: ' + req.body.deviceID);
			return res.status(200).send('Device selected: ' + req.body.deviceID);
		} catch (err) {
			console.log(err);
			return res.send(err);
		}
	};

	return exp;
};
