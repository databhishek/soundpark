import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
	super();
	const urlParams = queryString.parse(window.location.search);
	const isUserAuthorized = urlParams.access_token ? true : false;
	if(isUserAuthorized) {
		spotifyApi.setAccessToken(urlParams.access_token);
	}
	this.state = {
	  isUserAuthorized,
	  nowPlaying : {
		name: 'Not Checked',
		albumArt: ''
	  }
	}
  }

  componentDidMount() {
	const { isUserAuthorized } = this.state;
	if(isUserAuthorized) {
	  this.getNowPlaying();
	}
  }

  getNowPlaying() {
    spotifyApi.getMyCurrentPlaybackState()
    .then((resp) => {
      this.setState({
        nowPlaying: {
          name: resp.item.name,
          albumArt: resp.item.album.images[0].url
        }
      });
    });
  }

  playNextSong() {
    spotifyApi.skipToNext()
    .then((resp) => {
      this.getNowPlaying();
    });
  }

  playPrevSong() {
    spotifyApi.skipToPrevious()
    .then((resp) => {
      this.getNowPlaying();
    });
  }

  render() {
	const { isUserAuthorized, nowPlaying } = this.state;
	const connectSpotify = isUserAuthorized ? ('') : (
	<a href="http://localhost:8888/login">
	<button id='login-btn'>Login With Spotify</button>
	</a>
	);
	return (
	  <div className="App">
		{connectSpotify}
		<div>
		  Now Playing: { this.state.nowPlaying.name }
		</div>
		<div>
		  <img src={ this.state.nowPlaying.albumArt } style={{ width: 100}}/>
		</div>
		<button onClick={() => { this.getNowPlaying(); }}>
		  Check Now Playing
		</button>
		<button onClick={() => { this.playPrevSong(); }}>
		  Prev Song
		</button>
		<button onClick={() => { this.playNextSong(); }}>
		  Next Song
		</button>
	  </div>
	);
  }
}

export default App;