var mongoose = require('mongoose');
var Song = require('./song.js');
var Schema = mongoose.Schema;

var AlbumSchema = new Schema({
	name: String,
	image: String,
	artistName: String,
	releaseDate: String,
	genres: [String],
	songs: [Song.schema]
});

var Album = mongoose.model('Album', AlbumSchema);

module.exports = Album;
