import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Axios from 'axios';
import Popover from 'react-tiny-popover';
import { faUserFriends, faDoorOpen, faPowerOff } from '@fortawesome/free-solid-svg-icons';
import SocketContext from '../Socket';
import logo from '../assets/soundpark.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const baseURL = 'https://soundpark.live/api';

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
			room: {
				name: 'No Room',
				code: null
			},
			members: []
		};
	}

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
			await Axios.get('/leaveRoom', {
				params: { roomCode: this.state.room.code }
			});
			await sessionStorage.removeItem('roomCode');
			this.props.socket.emit('leave_room', this.state.room.code);
		} catch (err) {
			console.log(err);
		}
	};

	memberPopupToggle = (toggle) => {
		console.log('Making popup: ' + toggle);
		this.setState({
			isMembersOpen: toggle
		});
	};

	render() {
		let { isMembersOpen, room, members } = this.state;

		let membersList = (
			<ul className='members-list'>
				<p className='list-title'>{room.name}</p>
				{members.map((member) => <li key={member.id}>{member.name}</li>)}
			</ul>
		);

		return (
			<div className='main-nav'>
				<img className='logo' src={logo} alt='logo' />
				<div className='nav-controls'>
					<Popover isOpen={isMembersOpen} position={'bottom'} onClickOutside={() => this.memberPopupToggle(false)} content={membersList}>
						<button className='members' onClick={() => this.memberPopupToggle(!isMembersOpen)}>
							<FontAwesomeIcon className='members-icon' icon={faUserFriends} />
						</button>
					</Popover>
					<Link to='/'>
						<button className='leave' onClick={this.leaveRoom}>
							<FontAwesomeIcon className='leave-icon' icon={faDoorOpen} />
						</button>
					</Link>
					<button className='logout' onClick={this.signOut}>
						<FontAwesomeIcon className='logout-icon' icon={faPowerOff} />
					</button>
				</div>
			</div>
		);
	}
}

const HeaderwithSocket = (props) => <SocketContext.Consumer>{(socket) => <Header {...props} socket={socket} />}</SocketContext.Consumer>;

export default HeaderwithSocket;
