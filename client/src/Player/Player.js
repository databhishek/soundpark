import React, { Component } from 'react';
import cover from '../assets/cover.png';
import Axios from 'axios';

const baseURL = 'http://localhost:8888';
var globalTimer;

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
				uri: ''
			}
		}
	}
	
	componentDidMount() {
	}


	getNowPlaying = async() => {
		console.log('Called now playing!');
		const url = 'http://localhost:8888/currentlyPlaying';
		try {
			let resp = await Axios.get(url);
			// console.log(resp);
			resp = resp.data;

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

	searchSong = async() => {
        const url = 'http://localhost:8888/searchTrack';
        const searchValue = this.state.searchValue;
        console.log(searchValue)
        let resp = await Axios.get(url, { params: { searchValue: searchValue } });
        resp = resp.data;  
		console.log(resp);
        this.setState({
            searchResult: {
				searchedYet: true,
				id: resp.tracks.items[0].id,
                name: resp.tracks.items[0].name,
                album: resp.tracks.items[0].album.name,
                artist: resp.tracks.items[0].artists[0].name,
				uri: resp.tracks.items[0].uri
            }
		});
		
    }

    addToQueue = async() => {
        const url = 'http://localhost:8888/addToQueue';
		const searchResult = this.state.searchResult;
		let resp;
        let track = {
			id: searchResult.id,
            name: searchResult.name,
            artist: searchResult.artist,
            album: searchResult.album, //currently just album name
            uri: searchResult.uri
        };
        try {
            resp = await Axios.post(url, {track});
            console.log('Added to queue');
        } catch(e) {
            console.log(e);
		}
		console.log(resp.data.timeoutValue);
		globalTimer = setTimeout(() => {
			this.getNowPlaying();
		}, resp.data.timeoutValue);
	}

	playPause = async() => {
		const url = 'http://localhost:8888/playPause';
		try {
			let resp = await Axios.post(url);
			this.getNowPlaying();
			console.log(resp);
		} catch(e) {
			console.log(e);
		}
	}

    handleSearch = async(e) => {
		e.preventDefault();
		this.setState({searchValue: e.target.searchValue.value}, this.searchSong);
    }

	render() {
		let result;
		const { searchedYet, name, album, artist } = this.state.searchResult;
		const { nowPlaying } = this.state;
        if(searchedYet) {
            result = (
                <div>
                    <p>Name: {name}</p>
                    <p>Artist: {artist}</p>
                    <p>Album: {album}</p>
                    <button onClick={ this.addToQueue }>
                        Add to Queue
                    </button>
                </div>
            );
        }

		return (
			<div>
				<h3>Now Playing</h3> <h4>{ nowPlaying.name }</h4>
				<img src={ nowPlaying.albumArt } alt='albumArt' style={{ width: 200, display: 'block', marginLeft: 'auto', marginRight: 'auto', paddingBottom: '5px'}}/>
				<button onClick={ this.playPrevSong }>
					Prev
				</button>
				<button onClick={ this.playPause }>
					Play/Pause
				</button>
				<button onClick={ this.playNextSong }>
					Next
				</button>
				<form onSubmit={ this.handleSearch }>
                    <input type='text' placeholder='Search for a song...' name='searchValue'></input>
                    <button type='submit'>
                        Search
                    </button>
			    </form>
                {result}			
			</div>
		)
	}
}

export default Player;
