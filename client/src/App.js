import React, { Component } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import io from 'socket.io-client';
import './App.scss';
import Home from './components/Home/Home';
import Player from './components/Player/Player';
import SocketContext from './Socket';

// Setup global socket
const socket = io('http://localhost:8888', {
	secure: true,
	rejectUnauthorized: true,
	path: '/socket.io',
	transports: ['websocket'],
	upgrade: false
});

class App extends Component {
	render() {
		return (
			<SocketContext.Provider value={socket}>
				<div>
					{/* <Header /> */}
					<Router>
						<div className='App'>
							<Switch>
								<Route exact path='/' component={Home} />
								<Route path='/player' component={Player} />
							</Switch>
						</div>
					</Router>
					{/* <Footer /> */}
				</div>
			</SocketContext.Provider>
		);
	}
}

export default App;
