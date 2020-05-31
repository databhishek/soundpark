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
				headers: { Authorization: 'Bearer ' + req.user }
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
				headers: { Authorization: 'Bearer ' + req.user }
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
				headers: { Authorization: 'Bearer ' + req.user }
			});
			let currSong = await axios.get('/me/player/currently-playing', {
				headers: { Authorization: 'Bearer ' + req.user }
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
			let Q = await db.Room.find(
				{ roomCode: req.body.roomCode },
				'queue'
			);
			Q = Q[0].queue;
			let Q2 = Q;
			Q = Q.map((song) => song.uri);
			if (Q.length === 1) {
				let d = new Date();
				await axios.put(
					'/me/player/play',
					{ uris: Q },
					{
						headers: { Authorization: 'Bearer ' + req.user }
					}
				);
				await db.Room.update(
					{ roomCode: req.body.roomCode },
					{ $set: { changedat: d.getTime() } }
				);
				timer.setTimer(req.body.roomCode, 0);
			} else {
				await axios.post('/me/player/queue', null, {
					params: {
						uri: Q[Q.length - 1]
					},
					headers: { Authorization: 'Bearer ' + req.user }
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
			let Q = room[0].queue;
			Q = Q.map((song) => song.uri);
			let resp = await axios.get('/me/player/currently-playing', {
				headers: { Authorization: 'Bearer ' + req.user }
			});
			if (resp.data.is_playing) {
				await axios.put('/me/player/pause', null, {
					headers: { Authorization: 'Bearer ' + req.user }
				});
				return res.send('Paused');
			} else {
				let d = new Date();
				// console.log('changed at' + room[0].changedat);
				// console.log('now' + d.getTime());

				await axios.put(
					'/me/player/play',
					{
						uris: Q,
						position_ms: d.getTime() - room[0].changedat
					},
					{
						headers: { Authorization: 'Bearer ' + req.user }
					}
				);
				return res.send('Played');
			}
		} catch (err) {
			return res.send(err);
		}
	};

	return exp;
};
