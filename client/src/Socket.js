import openSocket from 'socket.io-client';

const Socket = openSocket('http://localhost:8888');

export { Socket };