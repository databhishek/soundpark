import React, { Component } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import banner from '../assets/banner.png';
import './Home.scss';
const baseURL = 'http://localhost:8888';

export class Home extends Component {
	handleSubmit = async (e) => {
		try {
			e.preventDefault();
			let roomCode = e.target.roomCode.value;
			localStorage.setItem('roomCode', roomCode);
			let resp = await Axios.get(baseURL + '/joinRoom', {
				params: { roomCode: roomCode }
			});
		} catch(e) {
			console.log(e);
		}
	};

	render() {
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
				<a href='http://localhost:8888/spotify/login'>
					<button className='skewBtn green'>Login</button>
				</a>
				<Link to='/createRoom'>
					<button className='skewBtn blue'>Create</button>
				</Link>
			</div>
		);
	}
}

export default Home;
