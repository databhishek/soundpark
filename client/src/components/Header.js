import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import Popover from 'react-tiny-popover';
import { faUserFriends, faDoorOpen, faPowerOff, faMobileAlt } from '@fortawesome/free-solid-svg-icons';
import SocketContext from '../Socket';
import logo from '../assets/soundpark.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const baseURL = 'https://soundpark.live/api';
// const baseURL = 'http://localhost:8888';

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
export class Header extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isMembersOpen: false,
			isDevicesOpen: false,
			room: {
				name: 'No Room',
				code: null
			},
			members: [],
			devices: []
		};
	}

	getDevices = async () => {
		try {
			let resp = await Axios.get('/getDevices');
			resp = resp.data;
			if (resp.length > 0) {
				sessionStorage.setItem('deviceID', resp[0].id);
				// console.log(resp[0].id);
			}
			this.setState({
				devices: resp
			});
		} catch (err) {
			console.log(err);
		}
	};

	setDevice = async (device) => {
		try {
			sessionStorage.setItem('deviceID', device.id);
			await Axios.post('/setDevice', { deviceID: sessionStorage.getItem('deviceID') });
			await Axios.get('/transferPlayback');
		} catch (err) {
			console.log(err);
		}
	};

	componentDidMount() {
		this.setState({
			isMembersOpen: false
		});
		this.props.socket.on('joined_room', (data) => {
			this.setState({
				room: {
					name: data.roomName,
					code: sessionStorage.getItem('roomCode')
				},
				members: data.users
			});
		});
		this.props.socket.on('left_room', (data) => {
			this.setState({
				members: data
			});
		});
	}

	signOut = async () => {
		try {
			await Axios.post('/signOut');
			window.location.href = '/?loggedIn=false';
		} catch (err) {
			console.log(err);
		}
	};

	leaveRoom = async () => {
		try {
			// await Axios.get('/leaveRoom', {
			// 	params: { roomCode: this.state.room.code }
			// });
			sessionStorage.removeItem('roomCode');
			this.props.socket.emit('leave_room', { name: localStorage.getItem('dispName'), room: this.state.room.code });
		} catch (err) {
			console.log(err);
		}
	};

	memberPopupToggle = (toggle) => {
		this.setState({
			isMembersOpen: toggle
		});
	};

	devicePopupToggle = (toggle) => {
		this.setState({
			isDevicesOpen: toggle
		});
	};

	render() {
		let { isMembersOpen, isDevicesOpen, room, members, devices } = this.state;

		let membersList = (
			<ul className='members-list'>
				<p className='list-title'>{room.name}</p>
				{members.map((member) => <li key={member.id}>{member.name}</li>)}
			</ul>
		);

		let devicesList = (
			<ul className='devices-list'>
				<p className='list-title'>Available Devices</p>
				{devices.map((device) => (
					<li key={device.id} onClick={() => this.setDevice(device)}>
						{device.name}
					</li>
				))}
			</ul>
		);

		return (
			<div className='main-nav'>
				<img className='logo' src={logo} alt='logo' />
				<div className='nav-controls'>
					<Popover isOpen={isDevicesOpen} position={'bottom'} onClickOutside={() => this.devicePopupToggle(false)} content={devicesList}>
						<button
							className='devices'
							title='Switch Device'
							onClick={async () => {
								if (isDevicesOpen === false) await this.getDevices();
								this.devicePopupToggle(!isDevicesOpen);
							}}>
							<FontAwesomeIcon className='devices-icon' icon={faMobileAlt} />
						</button>
					</Popover>
					<Popover isOpen={isMembersOpen} position={'bottom'} onClickOutside={() => this.memberPopupToggle(false)} content={membersList}>
						<button className='members' title='View Members' onClick={() => this.memberPopupToggle(!isMembersOpen)}>
							<FontAwesomeIcon className='members-icon' icon={faUserFriends} />
						</button>
					</Popover>
					<Link to='/'>
						<button className='leave' title='Leave Room' onClick={this.leaveRoom}>
							<FontAwesomeIcon className='leave-icon' icon={faDoorOpen} />
						</button>
					</Link>
					<button className='logout' title='Sign Out' onClick={this.signOut}>
						<FontAwesomeIcon className='logout-icon' icon={faPowerOff} />
					</button>
				</div>
			</div>
		);
	}
}

const HeaderwithSocket = (props) => <SocketContext.Consumer>{(socket) => <Header {...props} socket={socket} />}</SocketContext.Consumer>;

export default HeaderwithSocket;
