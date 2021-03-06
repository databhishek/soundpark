const router = require('express').Router();

module.exports = (passport, io) => {
	const auth = require('./auth')(passport);
	const spotify = require('./spotify')(io);
	const room = require('./room')(io);

	// Middleware route for auth check
	function ensureAuth(req, res, next){
		if (req.isAuthenticated()) {
			return next();
		}
		console.log('Not logged in.');
		res.status(401).send('Not logged in.');
	}

	// Room Routes
	router.post('/createRoom', ensureAuth, room.createRoom);
	router.get('/joinRoom', ensureAuth, room.joinRoom);
	router.get('/leaveRoom', ensureAuth, room.leaveRoom);
	router.get('/rooms', room.getRooms);

	// Spotify Routes
	router.get('/currentlyPlaying', ensureAuth, spotify.getCurrentlyPlaying);
	router.get('/searchTrack', ensureAuth, spotify.searchTrack);
	router.post('/addToQueue', ensureAuth, spotify.addToQueue);
	router.post('/queueReturns', ensureAuth, spotify.queueReturns);
	router.get('/play', ensureAuth, spotify.play);
	router.get('/pause', ensureAuth, spotify.pause);
	router.post('/playNext', ensureAuth, spotify.playNext);
	router.get('/getDevices', ensureAuth, spotify.getDevices);
	router.post('/setDevice', ensureAuth, spotify.setDevice);
	router.get('/transferPlayback', ensureAuth, spotify.transferPlayback);

	// Auth Routes
	router.get('/auth/spotify', auth.redirectSpotify());
	router.get('/callback', auth.callbackSpotify(), auth.setupRefresh);
	router.post('/signOut', auth.signOut);

	return router;
};
