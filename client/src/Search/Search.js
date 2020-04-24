import React, { Component } from 'react';
import Axios from 'axios';

export class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            searchValue: '',
            searchResult: {
                searchedYet: false,
                name: '',
                artist: '',
                album: '',
                uri: ''
            }
        }
    }

    searchSong = async() => {
        const url = 'http://localhost:8888/searchTrack';
        const searchValue = this.state.searchValue;

        let resp = await Axios.get(url, { params: { searchValue: searchValue } });
        console.log(resp);
        resp = resp.data.body;  

        this.setState({
            searchResult: {
                searchedYet: true,
                name: resp.tracks.items[0].name,
                album: resp.tracks.items[0].album.name,
                artist: resp.tracks.items[0].artists[0].name,
                uri: resp.tracks.items[0].uri
            }
        });
    }

    handleSearch = async(e) => {
		e.preventDefault();
		this.setState({searchValue: e.target.searchValue.value}, this.searchSong);
    }
    
    render() {
        let result;
        const { searchedYet, name, album, artist, uri} = this.state.searchResult;
    
        if(searchedYet) {
            result = (
                <div>
                    <p>Name: {name}</p>
                    <p>Artist: {artist}</p>
                    <p>Album: {album}</p>
                </div>
            );
        }

        return (
            <div>
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

export default Search
