import React, { Component } from 'react';
import Popover from 'react-tiny-popover';
import spotifyLogo from '../assets/Spotify_Logo_RGB_Green.png';
import Abhishek from '../assets/Abhishek.jpeg';
import Arav from '../assets/Arav.jpeg';

export class Footer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isContactOpen: false
		};
	}

	contactPopupToggle = (toggle) => {
		this.setState({
			isContactOpen: toggle
		});
	};

	render() {
		let { isContactOpen } = this.state;
		let us = (
			<ul className='us'>
				<li>
					<img src={Abhishek} alt='Abhishek'/>
					<div className='us-info'>
						<h4>Abhishek</h4>
						<p>abhi.aryan98@gmail.com</p>
						<a href='https://github.com/databhishek' target='_blank' rel='noopener noreferrer'>
							GitHub
						</a>
					</div>
				</li>
				<li>
					<img src={Arav} alt='Arav'/>
					<div className='us-info'>
						<h4>Arav</h4>
						<p>aravsaraff@gmail.com</p>
						<a href='https://github.com/aravsaraff' target='_blank' rel='noopener noreferrer'>
							GitHub
						</a>
					</div>
				</li>
			</ul>
		);
		return (
			<div className='main-footer'>
				<Popover isOpen={isContactOpen} position={'top'} onClickOutside={() => this.contactPopupToggle(false)} content={us}>
					<button className='contact-us' onClick={() => this.contactPopupToggle(!isContactOpen)}>
						Contact Us
					</button>
				</Popover>

				<div>
					<p className='powered'>Powered by </p>
					<img className='spotify-logo' src={spotifyLogo} alt='Spotify' />
				</div>
			</div>
		);
	}
}

export default Footer;
