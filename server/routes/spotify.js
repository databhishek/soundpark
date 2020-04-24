var SpotifyWebApi = require('spotify-web-api-node');
const db = require('../conn');
require('dotenv').config();

var spotifyApi = new SpotifyWebApi();

db.User.findOne(
  { username: 'abhishek' },
  (err, resp) => {
    spotifyApi.setAccessToken(resp.spotifyAccessToken);
    spotifyApi.setRefreshToken(resp.spotifyRefreshToken);
  }
);

let exp = {};

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


module.exports = exp;