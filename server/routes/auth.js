const axios = require('axios');
const qs = require('query-string');
const db = require('../config/conn');

module.exports = (passport) => {
	let exp = {};
	var userIntervals = {};

	exp.redirectSpotify = () => {
		return passport.authenticate('spotify', {
			scope: [
				'user-read-private',
				'user-read-email',
				'user-read-playback-state',
				'user-modify-playback-state',
				'user-read-currently-playing',
				'playlist-modify-public',
				'user-read-playback-position'
			],
			showDialog: true
		});
	};

	exp.callbackSpotify = () => {
		return passport.authenticate('spotify', {
			failureRedirect:
				process.env.MODE === 'PROD'
					? process.env.SERVER_URI + '?loggedIn=false'
					: 'http://localhost:3000/?loggedIn=false'
		});
	};

	exp.refreshToken = (req, res) => {
		try {
			// Set interval for refreshing token every hour with id as spotify id
			userIntervals[req.user.profile.id] = setInterval(async () => {
				console.log('Refreshing token for user: ' + req.user.profile.id);

				const reqBody = {
					grant_type: 'refresh_token',
					refresh_token: req.user.refreshToken
				};

				const config = {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization:
							'Basic ' +
							new Buffer.from(
								process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
							).toString('base64')
					}
				};

				let resp = await axios.post('https://accounts.spotify.com/api/token', qs.stringify(reqBody), config);

				if (resp.status === 200) {
					db.User.updateOne(
						{ spotifyID: req.user.profile.id },
						{
							$set: {
								spotifyAccessToken: resp.data.access_token
							}
						}
					);
					// Update session object
					let userObj =  {
						profile: req.user.profile,
						accessToken: resp.data.access_token,
						refreshToken: req.user.refreshToken,
					};
					req.login(userObj, (err) => {
						if(err) console.log(err);
					});
				}
			}, 3600000);

			// Successful authentication, redirect home.
			console.log('Successful login.');
			res.redirect(
				process.env.MODE === 'PROD'
					? process.env.SERVER_URI + '?loggedIn=true'
					: 'http://localhost:3000/?loggedIn=true'
			);
		} catch (e) {
			console.log(e);
		}
	};

	return exp;
};
