import React, { Component } from 'react';
import Axios from 'axios';

export class Player extends Component {
	constructor(props) {
		super(props);

		this.state = {
			nowPlaying: {
				name: 'Not Checked',
				albumArt: ''
			}
		}
	}
	
	componentDidMount() {
		this.getNowPlaying();
	}

	getNowPlaying = async() => {
		const url = 'http://localhost:8888/currentlyPlaying';
		try {
			let resp = await Axios.get(url);
			console.log(resp);
			resp = resp.data.body;

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
		} catch(e) {
			console.log(e);
		}
	}
	
	playNextSong = async() => {
		const url = 'http://localhost:8888/playNext';
		try {
			await Axios.get(url);
			this.getNowPlaying();
		} catch(e) {
			console.log(e);
		}
	}
	
	playPrevSong = async() => {
		const url = 'http://localhost:8888/playPrev';
		try {
			await Axios.get(url);
			this.getNowPlaying();
		} catch(e) {
			console.log(e);
		}
	}

	render() {
		return (
			<div>
				Now Playing: { this.state.nowPlaying.name }
				<img src={ this.state.nowPlaying.albumArt } alt='albumArt' style={{ width: 200, display: 'block', marginLeft: 'auto', marginRight: 'auto', paddingTop: '5px'}}/>
				<button onClick={ this.getNowPlaying }>
					Check Now Playing
				</button>
				<button onClick={ this.playPrevSong }>
					Prev Song
				</button>
				<button onClick={ this.playNextSong }>
					Next Song
				</button>				
			</div>
		)
	}
}

export default Player;
