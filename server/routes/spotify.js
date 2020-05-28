const db = require('../conn');
const axios = require('axios');
require('dotenv').config();

axios.defaults.baseURL = 'https://api.spotify.com/v1';

module.exports = () => {
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
					type: 'track',
				},
			});
		} catch (e) {
			console.log(e);
			return res.send(e);
		}
		return res.send(resp.data).status(200);
	};

	// exp.addToQueue = async (req, res) => {
	// 	let respSpotify, Q, trackData, resp;
	// 	let songToAdd = req.body.track;
	// 	console.log(songToAdd);
	// 	let tValue;
	// 	try {
	// 		respSpotify = await axios.get('/me/player/currently-playing');
	// 		if (respSpotify) {
	// 			respSpotify = {
	// 				uri: respSpotify.data.item.uri,
	// 				progress: respSpotify.data.progress_ms,
	// 			};
	// 		}
	// 		trackData = await axios.get('/tracks/' + songToAdd.id);
	// 		console.log('Track Data: ' + trackData.data);
	// 		songToAdd = new db.Queue({
	// 			trackName: songToAdd.name,
	// 			artist: songToAdd.artist,
	// 			albumArt: songToAdd.album,
	// 			uri: songToAdd.uri,
	// 			duration: trackData.data.duration_ms,
	// 		});
	// 		await songToAdd.save();
	// 		Q = await db.Queue.find(null, 'uri');
	// 		Q = Q.map((song) => song.uri);
	// 		// console.log(Q)
	// 		// present = Q.find((uri) => {
	// 		// 	return uri === respSpotify.uri
	// 		// })
	// 		// if(present === undefined) {
	// 		// 	Q.unshift(respSpotify.uri)
	// 		// }
	// 		let postData;
	// 		if (Q.length === 1) {
	// 			postData = {
	// 				uris: Q
	// 			};
	// 			await axios.put('/me/player/play', postData);
	// 		} else {
	// 			await axios.post('/me/player/queue', null, { params: {
	// 				uri: Q[Q.length-1]
	// 			}});
				
	// 		}
	// 	} catch (e) {
	// 		return res.send(e);
	// 	}
	// 	if (Q.length === 1) {
	// 		tValue = await exp.timeoutValue(0);
	// 	} else {
	// 		tValue = await exp.timeoutValue(respSpotify.progress);
	// 	}
	// 	console.log('Timeout should be: ' + tValue);
	// 	return res.send({ timeoutValue: tValue }).status(200);
	// };

	exp.addToQueue = async (req, res) => {
		let respSpotify, Q, trackData;
		let songToAdd = req.body.track;
		console.log(songToAdd);
		let tValue;
		try {
			trackData = await axios.get('/tracks/' + songToAdd.id);
			console.log('Track Data: ' + trackData.data);

			await db.Room.update(
				{roomId: req.body.roomId}, 
				{$push: 
					{queue: {	
						trackName: songToAdd.name,
						artist: songToAdd.artist,
						albumArt: songToAdd.album,
						uri: songToAdd.uri,
						duration: trackData.data.duration_ms
						}
					}
				}
			);
			Q = await db.Room.find({_id: req.body.roomId}, 'queue');
			await axios.post('/me/player/queue', null, { params: {
				uri: Q[Q.length-1]
			}});
		} catch (e) {
			return res.send(e);
		}
		return res.send("Added to queue").status(200);
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
		try{
			let room = await db.Room.find({_id: req.body.roomId});
			let d = new Date();
			await axios.put('/me/player/play', {uris: room.queue, position_ms: d.getTime() - room.changedat});
		} catch(err) {
			return res.send(err);
		}
	}

	exp.pause = async (req, res) => {
		try{
			await axios.put('/me/player/pause');
		} catch(err) {
			return res.send(err);
		}
	}

	return exp;
}

