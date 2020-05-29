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

	// getTrackDuration = (trackID) => {
	// 	let resp;
	// 	try {
	// 		resp = await axios.get('/tracks/' + trackID);
	// 		console.log(resp.data.duration_ms);
	// 	} catch(e) {
	// 		console.log(e);
	// 		return res.send(e);
	// 	}
	// 	return resp.data.duration_ms;
	// }

	// exp.timeoutValue = async (progress) => {
	// 	let resp,
	// 		playingURI,
	// 		Q = {},
	// 		sumDurations = 0,
	// 		tValue;
	// 	try {
	// 		resp = await axios.get('/me/player/currently-playing');
	// 		playingURI = resp.data.item.uri;

	// 		resp = await db.Queue.find(null, 'uri duration');
	// 		Q.uris = resp.map((ele) => ele.uri);
	// 		Q.durations = resp.map((ele) => ele.duration);
	// 		console.log(Q.uris);
	// 		console.log(Q.durations);
	// 		let index = Q.uris.findIndex((uri) => {
	// 			return uri === playingURI;
	// 		});
	// 		console.log('Song found at: ' + index);
	// 		for (let i = index; i < Q.durations.length; i++) {
	// 			sumDurations += Q.durations[i];
	// 		}
	// 		tValue = sumDurations - progress;
	// 	} catch (e) {
	// 		console.log(e);
	// 	}
	// 	return tValue;
	// };

	// exp.playPrevSong = async (req, res) => {
	// 	try {
	// 		await axios.post('/me/player/previous');
	// 	} catch (e) {
	// 		console.log(e);
	// 		return res.send(e);
	// 	}
	// 	return res.send(null).status(200);
	// };

	// exp.playNextSong = async (req, res) => {
	// 	try {
	// 		await axios.post('/me/player/next');
	// 	} catch (e) {
	// 		console.log(e);
	// 		return res.send(e);
	// 	}
	// 	return res.send(null).status(200);
	// };

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
		console.log(songToAdd);
		try {
			trackData = await axios.get('/tracks/' + songToAdd.id);
			let currSong = await axios.get('/me/player/currently-playing');
			console.log('Track Data: ' + trackData.data);
			console.log(currSong.data);
			console.log(req.body.roomCode);
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
			// await db.Room.update(
			// 	{roomId: req.body.roomId},
			// 	{$push:
			// 		{queue: {
			// 			trackName: songToAdd.name,
			// 			artist: songToAdd.artist,
			// 			album: songToAdd.album,
			// 			albumArt: songToAdd.images[0].url,
			// 			uri: songToAdd.uri,
			// 			duration: trackData.data.duration_ms
			// 			}
			// 		}
			// 	}
			// );
			Q = await db.Room.find({ roomCode: req.body.roomCode }, 'queue');
			Q = Q[0].queue;
			Q = Q.map((song) => song.uri);
			console.log(Q);
			if (Q.length === 1) {
				postData = {
					uris: Q
				};
				await axios.put('/me/player/play', postData);
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

	// exp.playPause = async (req, res) => {
	// 	try {
	// 		let resp = await axios.get('/me/player/currently-playing');
	// 		console.log(resp.data.is_playing);
	// 		if (resp.data.is_playing) {
	// 			await axios.put('/me/player/pause');
	// 		} else {
	// 			await axios.put('/me/player/play');
	// 		}
	// 	} catch (e) {
	// 		return res.send(e);
	// 	}
	// 	return res.send('Play or Paused. Whatever it was.').status(200);
	// };

	exp.play = async (req, res) => {
		try {
			let room = await db.Room.find({ _id: req.body.roomId });
			let d = new Date();
			await axios.put('/me/player/play', {
				uris: room.queue,
				position_ms: d.getTime() - room.changedat
			});
		} catch (err) {
			return res.send(err);
		}
	};

	exp.pause = async (req, res) => {
		try {
			await axios.put('/me/player/pause');
		} catch (err) {
			return res.send(err);
		}
	};

	return exp;
};
