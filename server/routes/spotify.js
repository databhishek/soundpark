const SpotifyWebApi = require('spotify-web-api-node')
const db = require('../conn')
const axios = require('axios')
const querystring = require('query-string');
require('dotenv').config()

const spotifyApi = new SpotifyWebApi()
axios.defaults.baseURL = 'https://api.spotify.com/v1'

let exp = {}


exp.setTokens = () => {
	db.User.findOne(
		{ username: 'arav' },
		(err, resp) => {
			axios.defaults.headers.common['Authorization'] = 'Bearer ' + resp.spotifyAccessToken
			// spotifyApi.setAccessToken(resp.spotifyAccessToken)
			// spotifyApi.setRefreshToken(resp.spotifyRefreshToken)
		}
	)
}
exp.setTokens()

exp.playNextSong = async(req, res) => {
	try {
		// await spotifyApi.skipToNext()
		await axios.post('/me/player/next')
	} catch(e) {
		console.log(e)
		return res.send(e)
	}
	return res.send(null).status(200)
}

exp.playPrevSong = async(req, res) => {
	try {
		// await spotifyApi.skipToPrevious()
		await axios.post('/me/player/previous')
	} catch(e) {
		console.log(e)
		return res.send(e)
	}
	return res.send(null).status(200)
}

exp.getCurrentlyPlaying = async(req, res) => {
	let resp
	try {
		// resp = await spotifyApi.getMyCurrentPlaybackState()
		// console.log(resp.body)
		resp = await axios.get('/me/player/currently-playing')
	} catch(e) {
		console.log(e)
		return res.send(e)
	}
	console.log(resp)
    return res.send(resp.data).status(200)
}

exp.searchTrack = async(req, res) => {
	let resp
	try {
		// resp = await spotifyApi.searchTracks(req.query.searchValue)
		// console.log(resp)
		resp = await axios.get('/search', { 
			params: {
				q: req.query.searchValue,
				type: 'track'
			}
		})
	} catch(e) {
		console.log(e)
		return res.send(e)
	}
	return res.send(resp.data).status(200)
}

exp.addToQueue = async(req, res) => {
	let respSpotify, Q, present, t1
	let songToAdd = req.body.track
	try {	
		// t1 = (new Date).getTime()
		// console.log(t1)
		// respSpotify = await spotifyApi.getMyCurrentPlaybackState()
		respSpotify = await axios.get('/me/player/currently-playing')
		respSpotify = { 
			uri: respSpotify.data.item.uri, 
			progress: respSpotify.data.progress_ms 
		}
		console.log(respSpotify)
		console.log(respSpotify.progress)
		songToAdd = new db.Queue({
			trackName: songToAdd.name,
			artist: songToAdd.artist,
			albumArt: songToAdd.album,
			uri: songToAdd.uri
		})
		await songToAdd.save()
		Q = await db.Queue.find(null, 'uri')
		Q = Q.map(song => song.uri)
		console.log(Q)
		present = Q.find((uri) => {
			return uri === respSpotify.uri
		})
		if(present === undefined) {
			Q.unshift(respSpotify.uri)
		}
		// let t2 = (new Date).getTime()
		// console.log(t2)
		let postData = {
			uris: Q,
			offset: {position: 0},
			position_ms: respSpotify.progress
		}
		resp = await axios.put('/me/player/play', postData)
		console(resp)
	} catch(e) {
		return res.send(e)
	}
	return res.send('Successfully added song to queue.').status(200)
}

module.exports = exp