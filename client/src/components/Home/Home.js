import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import Popup from 'reactjs-popup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SocketContext from '../../Socket';
import banner from '../../assets/banner.png';
import Footer from '../Footer';
import './Home.scss';

const baseURL = 'https://soundpark.live/api';
// const baseURL = 'http://localhost:8888';

// Axios config
Axios.defaults.baseURL = baseURL;
Axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response.status === 400) {
			toast.error('Invalid room code.', {
				toastId: 'invalidRoomCode',
				position: 'top-center',
				autoClose: 3000,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				limit: 1
			});
		}
		if (error.response.status === 401) {
			window.location.href = '/?loggedIn=false';
		}
		if (error.response.status === 403) {
			toast.error('Playback supported only on Premium accounts.', {
				toastId: 'premium',
				position: 'top-center',
				autoClose: 3000,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				limit: 1
			});
		}
		if (error.response.status === 404) {
			toast.error('Please open Spotify on your device and press Play.', {
				toastId: 'notFound',
				position: 'top-center',
				autoClose: 10000,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				limit: 1
			});
		}
		return error;
	}
);

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			roomName: '',
			roomCode: ''
		};
	}

	UNSAFE_componentWillMount() {
		let loggedIn = new URLSearchParams(this.props.location.search).get('loggedIn');
		if (loggedIn === 'true') {
			localStorage.setItem('loggedIn', 'true');
			window.history.replaceState({}, document.title, '/');
		}
		if (loggedIn === 'false') {
			localStorage.setItem('loggedIn', 'false');
			window.history.replaceState({}, document.title, '/');
		}
	}

	componentDidMount() {
		let joinRoom = new URLSearchParams(this.props.location.search).get('joinRoom');
		if (joinRoom === 'false') {
			window.history.replaceState({}, document.title, '/');
			toast.error('Please join a room first.', {
				position: 'top-center',
				autoClose: 3000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true
			});
		}
	}

	getDevices = async () => {
		try {
			let resp = await Axios.get('/getDevices');
			resp = resp.data;
			if (resp.length > 0) {
				sessionStorage.setItem('deviceID', resp[0].id);
				console.log(resp[0].id);
			}
		} catch (err) {
			console.log(err);
		}
	};

	setDevice = async () => {
		try {
			await Axios.post('/setDevice', { deviceID: sessionStorage.getItem('deviceID') });
		} catch (err) {
			console.log(err);
		}
	};

	handleSubmit = async (e) => {
		try {
			e.preventDefault();
			let roomCode = e.target.roomCode.value;
			if (localStorage.getItem('loggedIn') === 'true') {
				await this.getDevices();
				if (!sessionStorage.getItem('deviceID')) {
					toast.error('Please open Spotify first.', {
						toastId: 'noSpotify',
						position: 'top-center',
						autoClose: 3000,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						limit: 1
					});
				} else {
					await this.setDevice();
					let resp = await Axios.get('/joinRoom', {
						params: { roomCode: roomCode }
					});
					if (resp.status === 200) {
						sessionStorage.setItem('roomCode', roomCode);
						console.log('Joined room ' + roomCode);
						window.location.href = '/player';
					}
				}
			} else {
				window.location.href = '/?loggedIn=false';
			}
		} catch (err) {
			console.log(err);
		}
	};

	createRoom = async () => {
		try {
			let roomName = this.state.roomName;
			if (localStorage.getItem('loggedIn') === 'true') {
				await this.getDevices();
				if (!sessionStorage.getItem('deviceID')) {
					toast.error('Please open Spotify first.', {
						toastId: 'noSpotify',
						position: 'top-center',
						autoClose: 3000,
						closeOnClick: true,
						pauseOnHover: true,
						draggable: true,
						limit: 1
					});
				} else {
					let resp = await Axios.post('/createRoom', { roomName });
					if (resp.status === 200) {
						console.log(resp.data);
						this.setState({ roomCode: resp.data });
						sessionStorage.setItem('roomCode', this.state.roomCode);
						this.props.socket.emit('join_room', this.state.roomCode);
					}
					await this.setDevice();
					await Axios.get('/joinRoom', {
						params: { roomCode: this.state.roomCode }
					});
					console.log('Joined room ' + this.state.roomCode);
					await navigator.clipboard.writeText(this.state.roomCode);
					window.location.href = '/player?room=' + this.state.roomCode;
				}
			} else {
				window.location.href = '/?loggedIn=false';
			}
		} catch (err) {
			console.log(err);
		}
	};

	handleCreate = async (e) => {
		try {
			e.preventDefault();
			this.setState(
				{
					roomName: e.target.roomName.value
				},
				this.createRoom
			);
		} catch (err) {
			console.log(err);
		}
	};

	render() {
		let Btns =
			localStorage.getItem('loggedIn') === 'true' ? (
				<div className='nav'>
					<Popup modal closeOnDocumentClick trigger={<button className='skewBtn green'>Create</button>}>
						<div className='create-modal'>
							<div className='header'>Create Room</div>
							<form className='create-form' onSubmit={this.handleCreate}>
								<input type='text' name='roomName' placeholder='Room Name' />
								<button className='create-submit' type='submit'>
									Create!
								</button>
							</form>
						</div>
					</Popup>
					<Link to='/player'>
						<button className='skewBtn green'>Player</button>
					</Link>
				</div>
			) : (
				<div className='nav'>
					<a href={baseURL + '/auth/spotify'}>
						<button className='skewBtn green'>Login</button>
					</a>
				</div>
			);
		let Form =
			localStorage.getItem('loggedIn') === 'true' ? (
				<form className='room-form' onSubmit={this.handleSubmit}>
					<input type='text' placeholder='Enter room to join.' name='roomCode' />
					<button className='submit-btn' type='submit'>
						&rarr;
					</button>
				</form>
			) : (
				<div />
			);
		return (
			<div>
				<div className='home-container'>
					<img className='banner' src={banner} alt='banner' />
					{Form}
					{Btns}
					<Footer />
				</div>
				<ToastContainer />
			</div>
		);
	}
}

const HomewithSocket = (props) => <SocketContext.Consumer>{(socket) => <Home {...props} socket={socket} />}</SocketContext.Consumer>;

export default HomewithSocket;
