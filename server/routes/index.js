const router = require('express').Router();
const axios = require('axios');
const qs = require('query-string');
const db = require('../config/conn');

module.exports = (passport, io) => {
	var userIntervals = {};
	const spotify = require('./spotify')(io);
	const room = require('./room')(io);

	//Room Routes
	router.post('/createRoom', room.createRoom);
	router.get('/joinRoom', room.joinRoom);
	router.get('/leaveRoom', room.joinRoom);
	router.get('/rooms', room.getRooms);

    // Spotify Routes
	router.get('/currentlyPlaying', spotify.getCurrentlyPlaying);
	router.get('/searchTrack', spotify.searchTrack);
	router.post('/addToQueue', spotify.addToQueue);
	router.get('/playPause', spotify.playPause);
	router.post('/queueReturns', spotify.queueReturns);
    
    // Auth Routes
	router.get(
        '/auth/spotify',
		passport.authenticate('spotify', {
            scope: ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing', 'playlist-modify-public', 'user-read-playback-position'],
            showDialog: true
        })
	);
	router.get(
		'/callback',
		passport.authenticate('spotify', { failureRedirect: (process.env.MODE === 'PROD') ? (process.env.SERVER_URI + '?loggedIn=false') : 'http://localhost:3000/?loggedIn=false' }),
		(req, res) => {
			try {
				// Set interval for refreshing token every hour with id as spotify id
				userIntervals[req.user.profile.id] = setInterval(async () => {
					console.log('Refreshing token for user: ' + req.user.profile.id);
					
					const reqBody = {
						grant_type: 'refresh_token', 
						refresh_token: req.user.refreshToken
					};

					const config = {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'Authorization': 'Basic ' + new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')
						}
					};

					let resp = await axios.post('https://accounts.spotify.com/api/token', qs.stringify(reqBody), config);
					
					if(resp.status === 200) {
						console.log('New access token: ' + resp.data.access_token);
						db.User.updateOne({ spotifyID: req.user.profile.id}, {
							$set: {
								spotifyAccessToken: resp.data.access_token
							}
						});
					}
				}, 3600000);
				
				// Successful authentication, redirect home.
				console.log('Successful login.');
				res.redirect((process.env.MODE === 'PROD') ? (process.env.SERVER_URI + '?loggedIn=true'): 'http://localhost:3000/?loggedIn=true');
			} catch (e) {
				console.log(e);
			}
		}
    );

	return router;
};
