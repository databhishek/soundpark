import React, { Component } from 'react';
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom';
import './App.scss';
import Header from './Header';
import Footer from './Footer';
import Home from './Home/Home';
import Player from './Player/Player';
import CreateRoom from './CreateRoom/CreateRoom';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			uname: '',
			isUserAuthorized: false
		};

		sessionStorage.setItem('isLoggedIn', false);
	}

	componentDidMount() {
		this.setState({
			isUserAuthorized: sessionStorage.getItem('isLoggedIn')
		});
	}

	userLogin = () => {
		window.location.assign('http://localhost:8888/spotify/login');
	};

	render() {
		const { isUserAuthorized } = this.state;
		return (
			<div>
				<Header />
				<Router>
					<div className='App'>
						<Switch>
							<Route exact path='/' component={Home} />
							{/* <Route path='/login' render={(props) => <Login auth={isUserAuthorized} userLogin={this.userLogin}/>}  /> */}
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
