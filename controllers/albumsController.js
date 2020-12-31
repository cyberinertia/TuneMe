var db = require('../models');

function index(req, res) {
  db.Album.find( function(err, allAlbums) {
    if(err) {
      console.log('index error: ' + err);
      res.sendStatus(500);
    }
    res.json(allAlbums);
  })
}

function create(req, res) {
  // create new album with data
  var newAlbum = new db.Album({
    name: req.body.name,
    artistName: req.body.artistName,
    releaseDate: req.body.releaseDate,
    genres: req.body.genres
  });
  newAlbum.save(function (err, newAlbumInDb) {
    console.log('new album: ', newAlbumInDb);
    res.json(newAlbumInDb);
  });
}

function show(req, res) {
  db.Album.findById(req. params.id, function(err, locateAlbum) {
    console.log(locateAlbum);
    res.json(locateAlbum);
  });
}

function update(req, res) {
  var albumId = req.params.id
  db.Album.findByIdAndUpdate(albumId, {
    name: req.body.name,
    image: req.body.image,
    artistName: req.body.artistName,
    releaseDate: req.body.releaseDate,
    genres: req.body.genres
  }, {new:true}, function(err, updatedAlbum) {
    res.json(updatedAlbum);
  });
}

function destroy(req, res) {
  var albumId = req.params.id;
  db.Album.findByIdAndDelete(albumId, function(err, deletedAlbum) {
    console.log(deletedAlbum);
    res.json(deletedAlbum);
  });
}

module.exports = {
  index: index,
  create: create,
  show: show,
  destroy: destroy,
  update: update
};
