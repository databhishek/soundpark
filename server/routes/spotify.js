const db = require('../conn');
const axios = require('axios');
require('dotenv').config();

axios.defaults.baseURL = 'https://api.spotify.com/v1';

module.exports = (io) => {
	const timer = require('../timer')(io);

	let exp = {};

	exp.setTokens = (token) => {
		axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
	};

	exp.getCurrentlyPlaying = async (req, res) => {
		let resp;
		try {
			resp = await axios.get('/me/player/currently-playing');
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
		return res.send(resp.data).status(200);
	};

	exp.searchTrack = async (req, res) => {
		let resp;
		try {
			resp = await axios.get('/search', {
				params: {
					q: req.query.searchValue,
					type: 'track'
				}
			});
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
		return res.send(resp.data).status(200);
	};

	exp.addToQueue = async (req, res) => {
		let Q, trackData;
		let songToAdd = req.body.track;
		try {
			trackData = await axios.get('/tracks/' + songToAdd.id);
			let currSong = await axios.get('/me/player/currently-playing');
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
			Q = await db.Room.find({ roomCode: req.body.roomCode }, 'queue');
			Q = Q[0].queue;
			Q = Q.map((song) => song.uri);
			if (Q.length === 1) {
				postData = {
					uris: Q
				};
				let d = new Date();
				await axios.put('/me/player/play', postData);
				await db.Room.update({roomCode: req.body.roomCode}, {$set: {changedat: d.getTime()}});
				timer.setTimer(req.body.roomCode, 0);
			} else {
				await axios.post('/me/player/queue', null, { params: {
					uri: Q[Q.length-1]
				}});
				timer.setTimer(req.body.roomCode, currSong.data.progress_ms);	
			}
		} catch (e) {
			return res.send(e);
		}
		return res.send('Added to queue').status(200);
	};

	exp.playPause = async (req, res) => {
		try {
			let room = await db.Room.find({ roomCode: req.query.roomCode });
			let Q = room[0].queue;
			Q = Q.map((song) => song.uri);
			let resp = await axios.get('/me/player/currently-playing');
			if(resp.data.is_playing){
				await axios.put('/me/player/pause');
				return res.send('Paused');
			}
			else {
				let d = new Date();
				console.log('changed at' + room[0].changedat);
				console.log('now' + d.getTime());

				await axios.put('/me/player/play', {
					uris: Q,
					position_ms: d.getTime() - room[0].changedat
				});
				return res.send('Played');
			}
		} catch (err) {
			return res.send(err);
		}
	};

	exp.play = async (roomCode) => {
		try {
			let room = await db.Room.find({roomCode: roomCode});
			let Q = room[0].queue;
			Q = Q.map((song) => song.uri);
			if(Q.length > 0){
				let d = new Date();
				await axios.put('/me/player/play', {
					uris: Q, 
					position_ms: d.getTime() - room.changedat
				});
			}
		} catch(err) {
			return console.log(err);
		}
	}

	return exp;
};
