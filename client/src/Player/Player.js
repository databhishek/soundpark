import React, { Component } from 'react';
import cover from '../assets/cover.png';
import Axios from 'axios';
import './Player.scss';
const baseURL = 'http://localhost:8888';
var globalTimer;

export class Player extends Component {
	constructor(props) {
		super(props);

		this.state = {
			nowPlaying: {
				name: 'Queue is empty! Add something to get started.',
				albumArt: cover,
			},
			searchValue: '',
			searchResult: {
				searchedYet: false,
				id: '',
				name: '',
				artist: '',
				album: '',
				uri: '',
			},
		};
	}

	componentDidMount() {
		this.getNowPlaying();
	}

	getNowPlaying = async () => {
		console.log('Called now playing!');
		const url = baseURL + '/currentlyPlaying';
		try {
			let resp = await Axios.get(url);
			// console.log(resp);
			resp = resp.data;

			if (resp.item) {
				this.setState({
					nowPlaying: {
						name: resp.item.name,
						albumArt: resp.item.album.images[0].url,
					},
				});
			} else {
				this.setState({
					nowPlaying: {
						name: 'Nothing is playing!',
						albumArt: '',
					},
				});
			}
		} catch (e) {
			console.log(e);
		}
	};

	playNextSong = async () => {
		const url = baseURL + '/playNext';
		try {
			let resp = await Axios.get(url);
			this.getNowPlaying();
		} catch (e) {
			console.log(e);
		}
	};

	playPrevSong = async () => {
		const url = baseURL + '/playPrev';
		try {
			let resp = await Axios.get(url);
			this.getNowPlaying();
		} catch (e) {
			console.log(e);
		}
	};

	searchSong = async () => {
		try {
			const url = baseURL + '/searchTrack';
			const searchValue = this.state.searchValue;
			console.log(searchValue);
			let resp = await Axios.get(url, {
				params: { searchValue: searchValue },
			});
			resp = resp.data;
			console.log(resp);
			this.setState({
				searchResult: {
					searchedYet: true,
					id: resp.tracks.items[0].id,
					name: resp.tracks.items[0].name,
					album: resp.tracks.items[0].album.name,
					artist: resp.tracks.items[0].artists[0].name,
					uri: resp.tracks.items[0].uri,
				},
			});
		} catch (e) {
			console.log(e);
		}
	};

	addToQueue = async () => {
		const url = baseURL + '/addToQueue';
		const searchResult = this.state.searchResult;
		let resp;
		let track = {
			id: searchResult.id,
			name: searchResult.name,
			artist: searchResult.artist,
			album: searchResult.album, //currently just album name
			uri: searchResult.uri,
		};
		try {
			resp = await Axios.post(url, { track });
			console.log('Added to queue');
		} catch (e) {
			console.log(e);
		}
		console.log(resp.data.timeoutValue);
		this.getNowPlaying();
		globalTimer = setTimeout(() => {
			this.getNowPlaying();
		}, resp.data.timeoutValue);
	};

	playPause = async () => {
		const url = baseURL + '/playPause';
		try {
			let resp = await Axios.post(url);
			this.getNowPlaying();
			console.log(resp);
		} catch (e) {
			console.log(e);
		}
	};

	handleSearch = async (e) => {
		e.preventDefault();
		this.setState(
			{ searchValue: e.target.searchValue.value },
			this.searchSong
		);
	};

	render() {
		let result;
		const { searchedYet, name, album, artist } = this.state.searchResult;
		const { nowPlaying } = this.state;
		if (searchedYet) {
			result = (
				<div className='search-res'>
					<p>Song: {name}</p>
					<p>Artist: {artist}</p>
					<p>Album: {album}</p>
					<button onClick={this.addToQueue}>Add</button>
				</div>
			);
		}

		return (
			<div className='player-container'>
				<h3>Now Playing</h3> <h3>{nowPlaying.name}</h3>
				<img
					className='album-art'
					src={nowPlaying.albumArt}
					alt='albumArt'
				/>
				<button className='control-btns' onClick={this.playPrevSong}>
					Prev
				</button>
				<button className='control-btns' onClick={this.playPause}>
					Play/Pause
				</button>
				<button className='control-btns' onClick={this.playNextSong}>
					Next
				</button>
				<form onSubmit={this.handleSearch}>
					<input
						type='text'
						placeholder='Search for a song...'
						name='searchValue'></input>
					<button className='search-btn' type='submit'>
						&rarr;
					</button>
				</form>
				{result}
			</div>
		);
	}
}

export default Player;
