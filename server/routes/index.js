const router = require('express').Router();

module.exports = (passport, io) => {
	const auth = require('./auth')(passport);
	const spotify = require('./spotify')(io);
	const room = require('./room')(io);

	//Room Routes
	router.post('/createRoom', room.createRoom);
	router.get('/joinRoom', room.joinRoom);
	router.get('/leaveRoom', room.leaveRoom);
	router.get('/rooms', room.getRooms);

	// Spotify Routes
	router.get('/currentlyPlaying', spotify.getCurrentlyPlaying);
	router.get('/searchTrack', spotify.searchTrack);
	router.post('/addToQueue', spotify.addToQueue);
	router.post('/queueReturns', spotify.queueReturns);
	router.get('/playPause', spotify.playPause);
	router.post('/playNext', spotify.playNext);
	router.post('/playNextReturns', spotify.playNextReturns);

	// Auth Routes
	router.get('/auth/spotify', auth.redirectSpotify());
	router.get('/callback', auth.callbackSpotify(), auth.refreshToken);

	return router;
};
