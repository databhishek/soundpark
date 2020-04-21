var SpotifyWebApi = require('spotify-web-api-node');
const db = require('../conn');
require('dotenv').config({ path: '../.env' });

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
  spotifyApi.skipToNext().then((resp) => {
    console.log(resp);
  });
};

exp.playPrevSong = async(req, res) => {
  spotifyApi.skipToPrevious().then((resp) => {
    console.log(resp);
  });
};

exp.getCurrentlyPlaying = async(req, res) => {
  spotifyApi.getMyCurrentPlaybackState().then((resp) => {
    console.log(resp.body);
    res.send(resp.body).status(200);
  });
}

exp.searchTrack = async(req, res) => {
  console.log(req.query.searchValue);
  spotifyApi.searchTracks(req.query.searchValue).then((resp) => {
    console.log(resp.body);
    res.send(resp.body).status(200);
  });
}
module.exports = exp;