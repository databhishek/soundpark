import React, { Component } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import Axios from 'axios';
const baseURL = 'http://localhost:8888';

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
			console.log(roomName);
			let resp = await Axios.post(baseURL + '/createRoom', { roomName });
			console.log(resp.status);
			if (resp.status === 200) {
				console.log(resp.data);
				this.setState({ roomCode: resp.data.roomCode });
			}
		} catch (e) {
			console.log(e);
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
		} catch (e) {
			console.log(e);
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
				<ToastContainer />
			</div>
		);
	}
}

export default CreateRoom;
