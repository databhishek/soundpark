var SpotifyWebApi = require('spotify-web-api-node');
const db = require('../conn');
require('dotenv').config();

var spotifyApi = new SpotifyWebApi();


let exp = {};


exp.setTokens = () => {
	db.User.findOne(
		{ username: 'abhishek' },
		(err, resp) => {
		  spotifyApi.setAccessToken(resp.spotifyAccessToken);
		  spotifyApi.setRefreshToken(resp.spotifyRefreshToken);
		}
	);
}

exp.setTokens();

exp.playNextSong = async(req, res) => {
	try {
		await spotifyApi.skipToNext();
	} catch(e) {
		console.log(e);
		return res.send(e);
	}
	res.send(null).status(200);
};

exp.playPrevSong = async(req, res) => {
	try {
		await spotifyApi.skipToPrevious();
	} catch(e) {
		console.log(e);
		return res.send(e);
	}
	res.send(null).status(200);
};

exp.getCurrentlyPlaying = async(req, res) => {
	let resp;
	try {
		resp = await spotifyApi.getMyCurrentPlaybackState();
		console.log(resp.body);
	} catch(e) {
		console.log(e);
		return res.send(e);
	}
    res.send(resp).status(200);
}

exp.searchTrack = async(req, res) => {
	let resp;
	try {
		resp = await spotifyApi.searchTracks(req.query.searchValue);
		console.log(resp);
	} catch(e) {
		console.log(e);
		return res.send(e);
	}
	res.send(resp).status(200);
}

exp.addToQueue = async(req, res) => {
	let respSpotify, Q, resp;
	let songToAdd = req.body.track;
	try {	
		respSpotify = await spotifyApi.getMyCurrentPlaybackState();
		respSpotify = { uri: respSpotify.body.item.uri, progress: respSpotify.body.progress_ms };
		songToAdd = new db.Queue({
			trackName: songToAdd.name,
			artist: songToAdd.artist,
			albumArt: songToAdd.album,
			uri: songToAdd.uri
		});
		console.log(respSpotify);
		await songToAdd.save();
		Q = await db.Queue.find(null, 'uri');
		Q = Q.map(song => song.uri);
		console.log(Q);
		resp = await spotifyApi.play(
			{
				uris: Q,
				offset: {'uri': respSpotify.uri},
				position_ms: respSpotify.progress
			}
		);
	} catch(e) {
		return res.send(e);
	}
	res.send('Successfully added song to queue.').status(200);
}

module.exports = exp;