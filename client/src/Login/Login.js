import React, { Component } from 'react';

export class Login extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            username: ''
        }
    }

    onChange = (e) => this.setState({ username: e.target.value });

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.userLogin(this.state.username);
        this.setState({ username: '' });
    }


    render() {
        let login;
        if(this.props.auth === true) {
            login = <h2>Welcome!</h2>;
        }
        else {
            login = (
                <form ref='loginForm' onSubmit={ this.handleSubmit }>
                    <input type='text' name='uname' value={this.state.username} onChange={this.onChange}></input>
                    <button id='uname' type='submit'>
                        Set Username and Login
                    </button>
		        </form>
            );
        }

        return (
            <div>
                {login}
            </div>
        )
    }
}

export default Login;
