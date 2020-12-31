var db = require('../models');

function index(req, res) {
  console.log(req.params);
  db.Album.findById(req.params.id, function(err, locatedAlbum) {
    if (err) {
      console.log('cannot locate song: ', err);
    }
    res.json(locatedAlbum.songs);
  });
}

function create(req, res) {
  db.Album.findById(req.params.id, function (err, locateAlbum) {
    if (err) {
      console.log('error: ', err)
    }
    var newSong = new db.Song({
      name: req. body.name,
      trackNumber: req.body.trackNumber
    });
    locateAlbum.songs.push(newSong);
    locateAlbum.save(function (err, savedAlbum) {
      if (err) {
        console.log(err);
      }
      res.json(locateAlbum);
    });
  });
}

function update(req, res) {
  db.Album.findById(req.body.albumID, function (err, foundAlbum) {
    var songToBeUpdated = foundAlbum.songs.id(req.body.songID);
    if (songToBeUpdated) {
      songToBeUpdated.trackNumber = req.body.trackNumber;
      songToBeUpdated.name = req.body.name;

      foundAlbum.save(function(err, savedAlbum) {
        res.json(songToBeUpdated);
      });
    } else {
      res.send(404);
    }
  });
}

function destroy(req, res) {
  db.Album.findById(req.body.albumID, function(err, foundAlbum) {
    if(err) {
      console.log('error finding album: ', err);
    }
    var songToBeDeleted = foundAlbum.songs.id(req.body.songID);
    if (songToBeDeleted) {
      songToBeDeleted.remove();
      foundAlbum.save(function (err, savedAlbum) {
        if (err) {
          console.log('error saving album: ', err);
        }
        res.json(songToBeDeleted);
      });
    } else {
      res.send(404);
    }
  });
}

module.exports = {
  index: index,
  create: create,
  update: update,
  destroy: destroy
}
