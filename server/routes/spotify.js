const db = require('../config/conn');
const axios = require('axios');
require('dotenv').config();

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

	exp.addToQueue = async (req, res) => {
		try {
			let songToAdd = req.body.track;
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
				{ roomCode: req.body.roomCode },
				{
					$push: { queue: song }
				}
			);
			let room = await db.Room.find(
				{ roomCode: req.body.roomCode }
			);
			let Q = room[0].queue;
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
				await db.Room.updateOne(
					{ roomCode: req.body.roomCode },
					{ $set: { changedat: (new Date).getTime() } }
				);
				timer.setTimer(req.body.roomCode, 0);
			} else {
				// await axios.put(
				// 	'/me/player/play',
				// 	{ 
				// 		uris: Q,
				// 		offset: {position: 0},
				// 		position_ms: (new Date).getTime() - room[0].changedat
				// 	},
				// 	{
				// 		headers: { Authorization: 'Bearer ' + req.user.accessToken }
				// 	}
				// );
				await axios.post('/me/player/queue', null, {
					params: {
						uri: Q[Q.length - 1]
					},
					headers: { Authorization: 'Bearer ' + req.user.accessToken }
				});
				timer.setTimer(req.body.roomCode, currSong.data.progress_ms);
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
						position_ms: (new Date).getTime() - room[0].changedat
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
			let Q =  room[0].queue;
			Q = Q.map((song) => song.uri);
			let Q2 = [];
			Q2[0] = Q[0];
			console.log("Joining....................");	
			await axios.put(
				'/me/player/play',
				{
					uris: Q2,
					position_ms: (new Date).getTime() - room[0].changedat
				},
				{
					headers: { Authorization: 'Bearer ' + token }
				}
			);
			console.log("Queueing....................");
			Q.shift();
			for (i = 0; i < Q.length; i++) {
				await axios.post('/me/player/queue', null, {
					params: {
						uri: Q[i]
					},
					headers: { Authorization: 'Bearer ' + token }
				});
			};
		} catch (err) {
			console.log(err);
		}
	}

	return exp;
};
