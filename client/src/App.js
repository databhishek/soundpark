import React, { Component } from "react";
import "./App.css";
import Login from "./Login/Login";
import Player from "./Player/Player";
import Search from "./Search/Search";
import queryString from "query-string";
import Axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uname: "",
      isUserAuthorized: false,
    };
  }

  componentDidMount() {
    const urlParams = queryString.parse(window.location.search);
    this.setState({ isUserAuthorized: urlParams.authorized === 'true' ? true: false});
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
