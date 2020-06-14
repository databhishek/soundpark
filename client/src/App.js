import React, { Component } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import io from 'socket.io-client';
import './App.scss';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home/Home';
import Player from './components/Player/Player';
import CreateRoom from './components/CreateRoom/CreateRoom';
import SocketContext from './Socket';

// Setup global socket
const socket = io('http://13.233.142.76', {
	secure: true,
	rejectUnauthorized: true,
	path: '/rooms/socket.io',
	pingTimeout: 10000000
});

class App extends Component {
	render() {
		return (
			<SocketContext.Provider value={socket}>
				<div>
					<Header />
					<Router>
						<div className='App'>
							<Switch>
								<Route exact path='/' component={Home} />
								<Route path='/player' component={Player} />
								<Route path='/createRoom' component={CreateRoom} />
							</Switch>
						</div>
					</Router>
					<Footer />
				</div>
			</SocketContext.Provider>
		);
	}
}

export default App;
