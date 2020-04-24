import React, { Component } from 'react';

export class Login extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            username: ''
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({ username: e.target.uname.value });
        console.log(this.state.username);
        this.props.userLogin(this.state.username);
    }


    render() {
        let login;
        if(this.props.auth) {
            login = <h2>Welcome!</h2>;
        }
        else {
            login = (
                <form onSubmit={ this.handleSubmit }>
                    <input type='text' name='uname'></input>
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
