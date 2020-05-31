import React, { Component } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import banner from '../assets/banner.png';
import './Home.scss';
Axios.defaults.baseURL = 'http://localhost:8888';

export class Home extends Component {
	componentDidMount() {
		let loggedIn = new URLSearchParams(this.props.location.search).get(
			'loggedIn'
		);
		if (loggedIn === 'true') {
			localStorage.setItem('loggedIn', 'true');
		}
	}

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
					<a href='http://localhost:8888/auth/spotify'>
						<button className='skewBtn green'>Login</button>
					</a>
				</div>
			);
		return (
			<div className='home-container'>
				<img className='banner' src={banner} alt='banner' />
				<form onSubmit={this.handleSubmit}>
					<input
						className='inp'
						type='text'
						placeholder='Enter room to join.'
						name='roomCode'
					/>
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
