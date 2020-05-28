const express = require('express');
const router = express.Router();

module.exports = io => {
    const auth = require('./auth')();
    const queue = require('./queue')();
    const spotify = require('./spotify')();
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
    router.get('/play', spotify.play);
    router.get('/pause', spotify.pause);

    // Auth Routes
    router.get('/spotify/login', auth.login);
    router.get('/callback', auth.callback);
    router.get('/refresh_token', auth.refresh_token);

    // Queue Routes
    router.post('/add_track', queue.addTrack);
    router.get('/current', queue.showCurrent);
    router.get('/next', queue.showNext);
    router.get('/all', queue.showAll);
    router.get('/remove', queue.removeTrack);

    return router;
}


