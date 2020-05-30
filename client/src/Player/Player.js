import React, { Component } from 'react';
import cover from '../assets/cover.png';
import Axios from 'axios';
import './Player.scss';
import io from 'socket.io-client';
const baseURL = 'http://localhost:8888';

export class Player extends Component {
	constructor(props) {
		super(props);

		this.state = {
			nowPlaying: {
				name: 'Queue is empty! Add something to get started.',
				albumArt: cover
			},
			searchValue: '',
			searchResult: {
				searchedYet: false,
				id: '',
				name: '',
				artist: '',
				album: '',
				uri: '',
				albumArt: ''
			},
			roomCode: localStorage.getItem('roomCode')
		};
	}

	componentDidMount() {
		this.getNowPlaying();
		const socket = io.connect(baseURL);
		socket.emit('join_room', this.state.roomCode);
		socket.on('joined_room', (data) => {
			console.log(data);
		})
		socket.on('currently_playing', (data) => {
			console.log('Grabbed event!');
			if (data != null) {
				this.setState({
					nowPlaying: {
						name: data.trackName,
						albumArt: data.albumArt
					}
				});
			}
		});
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
						albumArt: resp.item.album.images[0].url
					}
				});
			} else {
				this.setState({
					nowPlaying: {
						name: 'Nothing is playing!',
						albumArt: ''
					}
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

	searchSong = async () => {
		try {
			const url = baseURL + '/searchTrack';
			const searchValue = this.state.searchValue;
			console.log(searchValue);
			let resp = await Axios.get(url, {
				params: { searchValue: searchValue }
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
					albumArt: resp.tracks.items[0].album.images[0]
				}
			});
		} catch (e) {
			console.log(e);
		}
	};

	addToQueue = async () => {
		const url = baseURL + '/addToQueue';
		const searchResult = this.state.searchResult;
		let track = {
			id: searchResult.id,
			name: searchResult.name,
			artist: searchResult.artist,
			album: searchResult.album,
			uri: searchResult.uri,
			albumArt: searchResult.albumArt
		};
		try {
			let roomCode = this.state.roomCode;
			console.log(roomCode);
			await Axios.post(url, { roomCode, track });
			console.log('Added to queue');
		} catch (e) {
			console.log(e);
		}
		this.getNowPlaying();
	};

	playPause = async () => {
		const url = baseURL + '/playPause';
		try {
			let roomCode = localStorage.getItem('roomCode');
			let resp = await Axios.get(url, { params: {roomCode: roomCode}});
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
				{/* <button className='control-btns' onClick={this.playPrevSong}>
					Prev
				</button> */}
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
