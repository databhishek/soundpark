import React, { Component } from 'react';
import banner from '../assets/banner.png';
import './Home.scss';

export class Home extends Component {
    render() {
        return (
            <div className='Home'>
                <img src={banner} alt='banner'/>
                
                <a href='http://localhost:8888/spotify/login'>
                <button className='btn green'>Login Using Spotify</button>
                </a>
            </div>
        )
    }
}

export default Home;
