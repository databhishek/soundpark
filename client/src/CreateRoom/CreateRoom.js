import React, { Component } from 'react';
import Axios from 'axios';
Axios.defaults.baseURL = 'http://13.233.142.76/api';

export class CreateRoom extends Component {
	constructor(props) {
		super(props);

		this.state = {
			roomName: '',
			roomCode: ''
		};
	}

	createRoom = async () => {
		try {
			let roomName = this.state.roomName;
			let resp = await Axios.post('/createRoom', { roomName });
			console.log(resp.status);
			if (resp.status === 200) {
				console.log(resp.data);
				this.setState({ roomCode: resp.data.roomCode });

			}
		} catch (err) {
			console.log(err);
		}
	};

	handleSubmit = async (e) => {
		try {
			e.preventDefault();
			this.setState(
				{
					roomName: e.target.roomName.value
				},
				this.createRoom
			);
		} catch (err) {
			console.log(err);
		}
	};

	render() {
		return (
			<div>
				<h2>Create Room</h2>
				<form onSubmit={this.handleSubmit}>
					<input
						type='text'
						name='roomName'
						placeholder='Room Name'
					/>
					<button type='submit'>Submit</button>
				</form>
				{this.state.roomCode}
			</div>
		);
	}
}

export default CreateRoom;
