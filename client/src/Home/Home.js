import React, { Component } from 'react';
import banner from '../assets/banner.png';
import './Home.scss';

export class Home extends Component {
	render() {
		return (
			<div className='home-container'>
				<img className='banner' src={banner} alt='banner' />
				<form>
					<input
						className='inp'
						type='text'
						placeholder='Enter room to join.'
					/>
					<button className='submit-btn' type='submit'>
						&rarr;
					</button>
				</form>
				<a href='http://localhost:8888/spotify/login'>
					<button className='skewBtn green'>Login</button>
				</a>
			</div>
		);
	}
}

export default Home;
