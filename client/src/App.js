import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';
import Axios from 'axios'

class App extends Component {
  constructor() {
		super();
		
		const urlParams = queryString.parse(window.location.search);
		const isUserAuthorized = urlParams.access_token ? true : false;
		var searchValue = '';
		var uname = '';

		this.state = {
			uname,
			isUserAuthorized,
			searchValue,
			nowPlaying : {
			name: 'Not Checked',
			albumArt: ''
			},
			searchResult : {
				name: '',
				album: '',
				artist: '',
				uri: ''
			}
		}
  }

  componentDidMount() {
		const { isUserAuthorized } = this.state;
		if(isUserAuthorized) {
			this.getNowPlaying();
		}
  }

  // Spotify Functions
  getNowPlaying() {
	const url = 'http://localhost:8888/currentlyPlaying';
	  Axios.get(url).then((resp) => {
		console.log(resp);
		resp = resp.data;
		if(resp.item) {	
			this.setState({
				nowPlaying: {
					name: resp.item.name,
					albumArt: resp.item.album.images[0].url
				}
			});
		}
		else {
			this.setState({
				nowPlaying: {
					name: 'Nothing is playing!',
					albumArt: ''
				}
			});
		}
	  });
  }

  playNextSong() {
	  const url = 'http://localhost:8888/playNext';
	  Axios.get(url).then((resp) => {
		console.log(resp);
		this.getNowPlaying();
	  });
  }

  playPrevSong() {
    const url = 'http://localhost:8888/playPrev';
	  Axios.get(url).then((resp) => {
		console.log(resp);
		this.getNowPlaying();
	  });
  }

  searchSong() {
	const url = 'http://localhost:8888/searchTrack';
	const searchValue = this.state.searchValue;
	Axios.get(url,{ params: { searchValue: searchValue } }).then((resp) => {
		console.log(resp);
		resp = resp.data;  
		this.setState({
			searchResult: {
				name: resp.tracks.items[0].name,
				album: resp.tracks.items[0].album.name,
				artist: resp.tracks.items[0].artists[0].name,
				uri: resp.tracks.items[0].uri
			}
		})
	});
  }

  // Handle Functions
  handleSearch = (e) => {
	e.preventDefault();
	this.setState({searchValue: e.target.searchValue.value}, this.searchSong);
  }

  handleSubmit = (e) => {
	e.preventDefault();
	const url = 'http://localhost:8888/set_uname';
	const username = e.target.uname.value;
	this.setState({uname: username}, () => {
			Axios.post(url, username).then((res) => {
				console.log(res);
			}).catch((e) => {
				console.log(e);
			});
	});
	window.location.assign('http://localhost:8888/login');
  }

  render() {
	const { isUserAuthorized, searchValue, nowPlaying, searchresult } = this.state;

	const connectSpotify = isUserAuthorized ? ('') : (
		<form onSubmit={this.handleSubmit}>
			<input type='text' name='uname'></input>
			<button id='set-uname' type='submit'>Set and Login</button>
		</form>
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
		<form onSubmit={this.handleSearch}>
			<input type='text' id='song_search' placeholder='Search for a song...' name='searchValue'></input>
			<button type='submit'>
				Search
			</button>
		</form>
	  </div>
	);
  }
}

export default App;