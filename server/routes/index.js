const express = require('express');
const router = express.Router();

module.exports = io => {
    const auth = require('./auth')();
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
    router.get('/spotify/login', auth.login);
    router.get('/callback', auth.callback);
    router.get('/refresh_token', auth.refresh_token);

    return router;
}


