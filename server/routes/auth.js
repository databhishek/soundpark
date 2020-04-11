const request = require('request');
const querystring = require('querystring');
require('dotenv').config({ path: '../.env' });

var stateKey = 'spotify_auth_state';

let exp = {}

// to generate random state string
var generateRandomString = (length) => {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

exp.login = (req, res) => {
    var state = generateRandomString(16);
	res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-modify-public user-read-playback-position';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
        state: state
    }));
}
    
exp.callback = (req, res) => {
    // your application requests refresh and access tokens
    // after checking the state parameter
    
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== storedState) {
        res.redirect('/#' +
        querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
			},
			json: true
        };
    
        request.post(authOptions, (error, response, body) => {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token;
				var refresh_token = body.refresh_token;

				var options = {
				url: 'https://api.spotify.com/v1/me',
				headers: { 'Authorization': 'Bearer ' + access_token },
				json: true
				};
				
				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {
				console.log(body);
				});
				
				// we can also pass the token to the browser to make requests from there
				res.redirect('http://localhost:3000/?' +
				querystring.stringify({
					access_token: access_token,
					refresh_token: refresh_token
				}));
			} else {
				res.redirect('/#' +
				querystring.stringify({
					error: 'invalid_token'
				}));
			}
		});
		
    }
}

exp.refresh_token = (req, res) => {
	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
	  url: 'https://accounts.spotify.com/api/token',
	  headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
	  form: {
		grant_type: 'refresh_token',
		refresh_token: refresh_token
	  },
	  json: true
	};
  
	request.post(authOptions, (error, response, body) => {
	  if (!error && response.statusCode === 200) {
		var access_token = body.access_token;
		res.send({
		  'access_token': access_token
		});
	  }
	});
};


module.exports = exp;
