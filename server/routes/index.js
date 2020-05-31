const router = require('express').Router();

module.exports = (passport, io) => {
	// const auth = require('./auth')();
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
    
    // Auth Routes
	router.get(
        '/auth/spotify',
		passport.authenticate('spotify', {
            scope: ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing', 'playlist-modify-public', 'user-read-playback-position', 'streaming'],
            showDialog: true
        })
	);
	router.get(
		'/callback',
		passport.authenticate('spotify', { failureRedirect: 'http://localhost:3000/login' }),
		(req, res) => {
            // Successful authentication, redirect home.
            console.log('Successful login.');
			res.redirect('http://localhost:3000/?token=' + res.req.user);
		}
    );
    // router.get('/spotify/login', auth.login);
	// router.get('/callback', auth.callback);
	// router.get('/refresh_token', auth.refresh_token);

	return router;
};
