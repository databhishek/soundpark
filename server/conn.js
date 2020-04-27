const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/spotify', { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.set('useCreateIndex', true);

mongoose.connection.on('connected', () => {
  console.log('Mongoose is connected.')
})

mongoose.connection.on('error', (err) => {
  console.log(err, 'Mongoose failed to connect.')
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose is disconnected.')
})

let exp = {}

const UserSchema = new mongoose.Schema({
  spotifyID: { type: String, unique: true },
  spotifyAccessToken: String,
  spotifyRefreshToken: String
})

const QueueSchema = new mongoose.Schema({
  trackName: String,
  artist: String,
  albumArt: String,
  uri: String,
  duration: Number
})

exp.User = mongoose.model('User', UserSchema)
exp.Queue = mongoose.model('Queue', QueueSchema)

module.exports = exp;

