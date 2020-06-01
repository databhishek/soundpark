const SpotifyStrategy = require('passport-spotify').Strategy;
const db = require('./conn');

module.exports = (passport) => {
	passport.serializeUser((User, done) => {
		console.log(User);
		return done(null, User);
	});

	passport.deserializeUser((User, done) => {
		console.log(User);
		return done(null, User);
	});

	passport.use(
		new SpotifyStrategy(
			{
				clientID: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				callbackURL: process.env.SPOTIFY_REDIRECT_URI
			},
			(accessToken, refreshToken, expires_in, profile, done) => {
				db.User.findOneAndUpdate(
					{
						spotifyID: profile.id
					},
					{
						spotifyAccessToken: accessToken,
						spotifyRefreshToken: refreshToken
					},
					{
						upsert: true
					},
					(err) => {
						if (err) console.log(err);
						else
							return done(null, {
								profile: profile,
								accessToken: accessToken,
								refreshToken: refreshToken
							});
					}
				);
			}
		)
	);
};
