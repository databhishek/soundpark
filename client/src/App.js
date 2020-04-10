import React, { Component } from 'react';
import './App.css';
import Spotify from 'spotify-web-api-js';

const spotifyWebApi = new Spotify();

class App extends Component {
  constructor() {
    super();
    this.params = this.getHashParams();
    this.state = {
      loggedIn: this.params.access_token ? true : false,
      nowPlaying: {
        name: 'Not Checked',
        image: ''
      }
    }
    if(this.params.access_token) {
      spotifyWebApi.setAccessToken(this.params.access_token);
    }
  }

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  getNowPlaying() {
    spotifyWebApi.getMyCurrentPlaybackState()
    .then((resp) => {
      //console.log(resp);
      this.setState({
        nowPlaying: {
          name: resp.item.name,
          image: resp.item.album.images[0].url
        }
      });
    });
  }

  playNext() {
    spotifyWebApi.skipToNext()
    .then((resp) => {
      this.getNowPlaying();
    });
  }

  playPrev() {
    spotifyWebApi.skipToPrevious()
    .then((resp) => {
      this.getNowPlaying();
    });
  }

  render() {
    return (
      <div className="App">
        <a href="http://localhost:8888">
        <button id='login-btn'>Login With Spotify</button>
        </a>
        <div>
          Now Playing: { this.state.nowPlaying.name }
        </div>
        <div>
          <img src={ this.state.nowPlaying.image } style={{ width: 100}}/>
        </div>
        <button onClick={() => { this.getNowPlaying(); }}>
          Check Now Playing
        </button>
        <button onClick={() => { this.getPlaylists(); }}>
          Play Some Playlist
        </button>
        <button onClick={() => { this.playPrev(); }}>
          Prev Song
        </button>
        <button onClick={() => { this.playNext(); }}>
          Next Song
        </button>
      </div>
    );
  }
}

export default App;