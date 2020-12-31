var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/TuneMe-app', { useNewUrlParser: true });

mongoose.Promise = global.Promise;

module.exports.Album = require('./album.js');
module.exports.Song = require('./song.js');
