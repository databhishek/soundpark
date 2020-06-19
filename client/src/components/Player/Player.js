import React, { Component } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Popup from 'reactjs-popup';
import { faForward, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'react-toastify/dist/ReactToastify.css';
import cover from '../../assets/cover.png';
import Header from '../Header';
import SocketContext from '../../Socket';
import './Player.scss';

const baseURL = 'https://soundpark.live/api';
// const baseURL = 'http://localhost:8888';

// Axios config
Axios.defaults.baseURL = baseURL;
Axios.defaults.headers['Content-Type'] = 'application/json';
Axios.defaults.withCredentials = true;
Axios.interceptors.response.use(
	(response) => {
		if(response.status !== 200) {
			toast.error('Please open Spotify on your device and press Play', {
				toastId: 'notFound',
				position: 'top-center',
				autoClose: 15000,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				limit: 1
			});				
		}
		if(response.status === 403) {
			toast.error('Playback supported only for Spotify Premium', {
				toastId: 'notFound',
				position: 'top-center',
				autoClose: 3000,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				limit: 1
			});
		}
		return response;
	},
	(error) => {
		if (error.response.status === 401) {
			window.location.href = '/?loggedIn=false';
		}
		return error;
	}
);

class Player extends Component {
	constructor(props) {
		super(props);

		this.state = {
			nowPlaying: {
				name: 'Nothing playing.',
				artist: 'N/A',
				albumArt: cover
			},
			searchValue: '',
			searchedYet: false,
			searchResult: [],
			room: {
				name: 'No Room',
				code: sessionStorage.getItem('roomCode')
			},
			queue: [],
			users: []
		};
	}

	componentDidMount() {
		let room = new URLSearchParams(this.props.location.search).get('room');
		if (room) {
			window.history.replaceState({}, document.title, '/');
			toast.success('Room Code: ' + room, {
				toastId: 'createRoom',
				position: 'top-center',
				autoClose: false,
				closeOnClick: false,
				pauseOnHover: true,
				draggable: false,
				limit: 1
			});
		}
		if (!this.state.room.code) {
			window.location.href = '/?joinRoom=false';
		}
		this.props.socket.emit('join_room', this.state.room.code);
		this.props.socket.on('joined_room', (data) => {
			if (data.queue.length) {
				this.setState({
					nowPlaying: {
						name: data.queue[0].trackName,
						artist: data.queue[0].artist,
						albumArt: data.queue[0].albumArt
					},
					queue: data.queue,
					room: {
						name: data.roomName,
						code: sessionStorage.getItem('roomCode')
					},
					users: data.users
				});
			} else {
				this.setState({
					room: {
						name: data.roomName,
						code: sessionStorage.getItem('roomCode')
					},
					users: data.users
				});
			}
		});
		this.props.socket.on('left_room', (data) => {
			this.setState({
				users: data
			});
		});
		this.props.socket.on('currently_playing', async (data) => {
			console.log('Song change event.');
			if (data) {
				await Axios.post('/queueReturns', { room: this.state.room.code });
				this.state.queue.shift();
				let q = this.state.queue;
				this.setState({
					nowPlaying: {
						name: data.trackName,
						artist: data.artist,
						albumArt: data.albumArt
					},
					queue: q
				});
			} else
				this.setState({
					nowPlaying: {
						name: 'Nothing playing.',
						artist: 'N/A',
						albumArt: cover
					},
					queue: []
				});
		});
		this.props.socket.on('added_to_queue', async (data) => {
			console.log('Add to queue event.');
			console.log(data);
			if (data.length === 1) {
				await Axios.post('/queueReturns', { room: this.state.room.code });
				this.setState({
					nowPlaying: {
						name: data[0].trackName,
						artist: data[0].artist,
						albumArt: data[0].albumArt
					}
				});
			}
			this.setState({
				queue: data
			});
		});
		// this.getNowPlaying();
		// window.addEventListener('beforeunload', function(e){
		// 	var confirmationMessage = 'o/';

		// 	(e || window.event).returnValue = confirmationMessage; //Gecko + IE
		// 	return confirmationMessage; //Webkit, Safari, Chrome
		// });
	}

	getNowPlaying = async () => {
		try {
			console.log('Fetched currently playing.');
			let resp = await Axios.get('/currentlyPlaying');
			resp = resp.data;
			if (resp.item) {
				// sessionStorage.setItem('currentSong', resp.item.name);
				// sessionStorage.setItem('currentArtist', resp.item.artists[0].external_urls.name);
				// sessionStorage.setItem('currentArt', resp.item.album.images[0].url);
				this.setState({
					nowPlaying: {
						name: resp.item.name,
						artist: resp.item.artists[0].external_urls.name,
						albumArt: resp.item.album.images[0].url
					}
				});
			} else {
				this.setState({
					nowPlaying: {
						name: 'Nothing playing.',
						artist: 'N/A',
						albumArt: cover
					}
				});
			}
		} catch (err) {
			console.log(err);
		}
	};

	searchSong = async () => {
		try {
			const searchValue = this.state.searchValue;
			console.log('Searched: ' + searchValue);
			let resp = await Axios.get('/searchTrack', {
				params: {
					searchValue: searchValue
				}
			});
			resp = resp.data;
			let search = [];
			for (let i = 0; i < 10 && i < resp.tracks.items.length; i++) {
				search.push({
					id: resp.tracks.items[i].id,
					name: resp.tracks.items[i].name,
					album: resp.tracks.items[i].album.name,
					artist: resp.tracks.items[i].artists[0].name,
					uri: resp.tracks.items[i].uri,
					albumArt: resp.tracks.items[i].album.images[0]
				});
			}
			console.log(search);
			this.setState({
				searchedYet: true,
				searchResult: search
			});
		} catch (err) {
			console.log(err);
		}
	};

	addToQueue = async (song) => {
		try {
			let roomCode = sessionStorage.getItem('roomCode');
			let resp = await Axios.post('/addToQueue', {
				roomCode,
				song
			});
			console.log(resp.data);
			this.setState({
				searchedYet: false,
				searchResult: [],
				queue: resp.data
			});
			console.log('Added to queue.');
			toast.success('Added to queue.', {
				toastId: 'toQueue',
				position: 'top-center',
				autoClose: 2000,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				limit: 1
			});
		} catch (err) {
			console.log(err);
		}
	};

	playNext = async () => {
		try {
			let roomCode = sessionStorage.getItem('roomCode');
			let resp = await Axios.post('/playNext', { roomCode });
			console.log(resp);
		} catch (err) {
			console.log(err);
		}
	};

	playPause = async () => {
		try {
			let roomCode = sessionStorage.getItem('roomCode');
			let resp = await Axios.get('/playPause', {
				params: {
					roomCode: roomCode
				}
			});
			console.log(resp);
		} catch (err) {
			console.log(err);
		}
	};

	handleSearch = async (e) => {
		e.preventDefault();
		this.setState({ searchValue: e.target.searchValue.value }, this.searchSong);
	};

	render() {
		let search = this.state.searchResult;
		const { nowPlaying, queue } = this.state;

		let queueListItems = (
			<ul className='queue-list'>
				{queue.map((song) => (
					<li key={song.uri}>
						<p className='track-title'>{song.trackName}</p>
						<p className='track-artist'>{song.artist}</p>
					</li>
				))}
			</ul>
		);

		return (
			<div>
				<ToastContainer />
				<div className='main-container'>
					<Header />
					<div className='container'>
						<div className='player-container'>
							<img className='album-art' src={nowPlaying.albumArt} alt='albumArt' />
							<div className='title'>{nowPlaying.name}</div>
							<div className='artist'>{nowPlaying.artist}</div>
							<div className='controls'>
								<button onClick={this.playPause}>
									<FontAwesomeIcon icon={faPause} className='fa' size='2x' />
								</button>
								<button onClick={this.playPause}>
									<FontAwesomeIcon icon={faPlay} className='fa' size='2x' />
								</button>
								<button onClick={this.playNext}>
									<FontAwesomeIcon icon={faForward} className='fa' size='2x' />
								</button>
							</div>
						</div>
						<div className='queue-container'>
							<div className='up-next'>
								<div className='title'>Up Next</div>
								<Popup modal closeOnDocumentClick trigger={<button className='add' title='Add to Queue'>+</button>}>
									{(close) => (
										<div>
											<form className='search-form' autocomplete='off' onSubmit={this.handleSearch}>
												<input type='text' placeholder='Search for a song...' name='searchValue' />
											</form>
											<ul className='search-res'>
												{search.map((song) => (
													<li
														key={song.id}
														onClick={() => {
															close();
															this.addToQueue(song);
														}}>
														<p className='title'>{song.name}</p>
														<p className='artist'>
															{song.album} - {song.artist}
														</p>
													</li>
												))}
											</ul>
										</div>
									)}
								</Popup>
							</div>
							{queueListItems}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const PlayerwithSocket = (props) => <SocketContext.Consumer>{(socket) => <Player {...props} socket={socket} />}</SocketContext.Consumer>;

export default PlayerwithSocket;
