import React, { Component } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import './App.scss';
import Header from './Header';
import Footer from './Footer';
import Home from './Home/Home';
import Player from './Player/Player';
import CreateRoom from './CreateRoom/CreateRoom';

class App extends Component {
	render() {
		return (
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
		);
	}
}

export default App;
