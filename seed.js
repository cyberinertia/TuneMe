var db = require("./models");

var albumsList =[
  	{
	  artistName: 'Nine Inch Nails',
	  name: 'The Downward Spiral',
	  releaseDate: '1994, March 8',
	  genres: [ 'industrial', 'industrial metal' ]
	}, {

	  artistName: 'Metallica',
	  name: 'Metallica',
	  releaseDate: '1991, August 12',
	  genres: [ 'heavy metal' ]
	}, {

	  artistName: 'The Prodigy',
	  name: 'Music for the Jilted Generation',
	  releaseDate: '1994, July 4',
	  genres: [ 'electronica', 'breakbeat hardcore', 'rave', 'jungle' ]
	}, {

	  artistName: 'Johnny Cash',
	  name: 'Unchained',
	  releaseDate: '1996, November 5',
	  genres: [ 'country', 'rock' ]
	}
];

var songsList = [{
	  name: 'Swamped',
	  trackNumber: 1
	}, {
	  name: "Heaven's true",
	  trackNumber: 2
	}, {
	  name: 'Daylight Dancer',
	  trackNumber: 3
	}, {
	  name: 'Humane',
	  trackNumber: 4
	}, {
	  name: 'Self Deception',
	  trackNumber: 5
	}, {
	  name: 'Aeon',
	  trackNumber: 6
	}, {
	  name: 'Tight Rope',
	  trackNumber: 7
}];

albumsList.forEach(function (albumObject) {
	albumObject['songs'] = songsList;
})

db.Album.remove({}, function(err, albums){
  // code in here runs after all albums are removed
  db.Album.create(albumsList, function(err, albums){
    // code in here runs after all albums are created
    if (err) { return console.log('ERROR', err); }
    console.log("all albums:", albumsList);
    console.log("created", albumsList.length, "albums");
    process.exit();
  });
});
