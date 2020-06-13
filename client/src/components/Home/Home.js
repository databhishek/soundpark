import React, { Component } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import banner from '../../assets/banner.png';
import './Home.scss';
const baseURL = 'http://13.233.142.76/api';

// Axios config
Axios.defaults.baseURL = baseURL;
Axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response.status === 401) {
			window.location.href = '/?loggedIn=false';
		}
		return error;
	}
);

export class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			deviceID: ''
		};
	}

	componentWillMount() {
		let loggedIn = new URLSearchParams(this.props.location.search).get('loggedIn');
		if (loggedIn === 'true') {
			localStorage.setItem('loggedIn', 'true');
		}
	}

	componentDidMount() {
		this.getDevices();
	}

	getDevices = async () => {
		try {
			let resp = await Axios.get('/getDevices');
			resp = resp.data;
			if (resp.length) {
				this.setState({ deviceID: resp[0].id });
			} else console.log('Please open Spotify on a device');
		} catch (err) {
			console.log(err);
		}
	};

	setDevice = async () => {
		try {
			await Axios.post('/setDevice', { deviceID: this.state.deviceID });
		} catch (err) {
			console.log(err);
		}
	};

	handleSubmit = async (e) => {
		try {
			e.preventDefault();
			if (localStorage.getItem('loggedIn') === 'true') {
				let roomCode = e.target.roomCode.value;
				sessionStorage.setItem('roomCode', roomCode);
				await Axios.get('/joinRoom', {
					params: { roomCode: roomCode }
				});
				console.log('Joined room ' + roomCode);
				window.location.href = '/player';
			} else {
				console.log('Not logged in.');
			}
		} catch (err) {
			console.log(err);
		}
	};

	render() {
		let Btns =
			localStorage.getItem('loggedIn') === 'true' ? (
				<div>
					<Link to='/createRoom'>
						<button className='skewBtn blue'>Create</button>
					</Link>
					<Link to='/player'>
						<button className='skewBtn blue'>Player</button>
					</Link>
				</div>
			) : (
				<div>
					<a href={baseURL + '/auth/spotify'}>
						<button className='skewBtn green'>Login</button>
					</a>
				</div>
			);
		this.setDevice();
		return (
			<div className='home-container'>
				<img className='banner' src={banner} alt='banner' />
				<form onSubmit={this.handleSubmit}>
					<input className='inp' type='text' placeholder='Enter room to join.' name='roomCode' />
					<button className='submit-btn' type='submit'>
						&rarr;
					</button>
				</form>
				{Btns}
			</div>
		);
	}
}

export default Home;
