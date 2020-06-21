const SpotifyStrategy = require('passport-spotify').Strategy;
const db = require('./conn');

module.exports = (passport) => {
	passport.serializeUser((user, done) => {
		return done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		db.User.find({ id: id }, (err, user) => {
			return done(err, user[0]);
		});
	});

	passport.use(
		new SpotifyStrategy(
			{
				clientID: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				callbackURL: 'https://soundpark.live/api/callback'
			},
			(accessToken, refreshToken, expires_in, profile, done) => {
				db.User.findOneAndUpdate(
					{
						id: profile.id
					},
					{
						username: profile.username,
						displayName: profile.displayName,
						profileUrl: profile.profileUrl,
						subscription: profile.product,
						accessToken: accessToken,
						refreshToken: refreshToken,
						currentDevice: ''
					},
					{
						upsert: true
					},
					(err, data) => {
						if (err) console.log(err);
						else return done(null, data);
					}
				);
			}
		)
	);
};
