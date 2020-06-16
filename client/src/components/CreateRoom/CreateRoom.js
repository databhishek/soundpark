import React, { Component } from 'react';
import Axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CreateRoom.scss';

const baseURL = 'http://13.233.142.76/api';

// Axios config
Axios.defaults.baseURL = baseURL;
Axios.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		if (error.response.status === 401) {
			window.location.href = '/?loggedIn=false';
		}
		return error;
	}
);

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
				this.setState({ roomCode: resp.data });
				toast.success('Room Code: ' + resp.data, {
					toastId: 'createRoom',
					position: 'top-center',
					autoClose: false,
					closeOnClick: false,
					pauseOnHover: true,
					draggable: false,
					limit: 1
				});
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
				<ToastContainer />
				<div className='createRoom-container'>
					<h2 className='page-title'>Create Room</h2>
					<form className='create-form' onSubmit={this.handleSubmit}>
						<input type='text' name='roomName' placeholder='Room Name' />
						<button type='submit'>&rarr;</button>
					</form>
				</div>
			</div>
		);
	}
}

export default CreateRoom;
