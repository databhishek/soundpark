import React, { Component } from "react";
import queryString from "query-string";
import Axios from "axios";
import "./App.css";
import Login from "./Login/Login";
import Player from "./Player/Player";
import Search from "./Search/Search";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uname: "",
      isUserAuthorized: false,
	};
	
	sessionStorage.setItem('isLoggedIn', false);
  }

  componentDidMount() {
    this.setState({ isUserAuthorized: sessionStorage.getItem('isLoggedIn')});
  }

  userLogin = (username) => {
    const url = "http://localhost:8888/login";
    console.log(username);
    this.setState({ uname: username }, () => {
    	Axios.post(url, username)
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
		});
		sessionStorage.setItem('isLoggedIn', true);
    });
    window.location.assign("http://localhost:8888/spotify/login");
  };

  render() {
    const { uname, isUserAuthorized } = this.state;
    return (
      <div className="App">
        <Login auth={isUserAuthorized} userLogin={this.userLogin} />
        <Player />
        <Search />
      </div>
    );
  }
}

export default App;
