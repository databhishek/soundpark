module.exports = (passport) => {
	let exp = {};

	exp.redirectSpotify = (req, res) => {
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

	exp.callbackSpotify = (req, res) => {
		return passport.authenticate('spotify', {
			failureRedirect:
				process.env.MODE === 'PROD'
					? process.env.SERVER_URI + '?loggedIn=false'
					: 'http://localhost:3000/?loggedIn=false'
		});
	};

	return exp;
};
