// hard-coded data
var sampleAlbums = [{
  artistName: 'Ladyhawke',
  name: 'Ladyhawke',
  releaseDate: '2008, November 18',
  genres: [ 'new wave', 'indie rock', 'synth pop' ]
}, {
  artistName: 'The Knife',
  name: 'Silent Shout',
  releaseDate: '2006, February 17',
  genres: [ 'synth pop', 'electronica', 'experimental' ]
}, {
  artistName: 'Juno Reactor',
  name: 'Shango',
  releaseDate: '2000, October 9',
  genres: [ 'electronic', 'goa trance', 'tribal house' ]
}, {
  artistName: 'Philip Wesley',
  name: 'Dark Night of the Soul',
  releaseDate: '2008, September 12',
  genres: [ 'piano' ]
}];


$(document).ready(function() {
  console.log('app.js loaded!');

  // Ajax call to get all albums

  $.ajax({
    method: 'GET',
    url: '/api/albums',
    success: getAllAlbumsSuccess,
    error: function (err) {
      console.log(err);
    }
  });

  // Ajax call to create a new album
  $('#album-form').on('submit', function (e) {
    console.log('new album created', $('#album-form').serialize());

    $.ajax({
      method: 'POST',
      url: '/api/albums',
      data: $('#album-form').serialize(),
      success: postNewAlbumSuccess,
      error: postNewAlbumError
    });
  });

  // Ajax call to show album
  $('#albums').on('click', '.album-art', function (e) {
    var id = $(this).closest('.album').data('album-id');
    console.log('clicked album');
    console.log('album id: ', id);

    $.ajax({
      method: 'GET',
      url: '/api/albums/' + id,
      success: showAlbumSuccess,
      error: showAlbumError
    });
});

  // Ajax call to delete album
  $('#albums').on('click','.delete-album', function (e) {
    console.log('clicked delete button to', '/api/albums' + $('.delete-album').attr('data-id'));
    var con = confirm('Are you sure you want to delete this album?');
    if (con === true) {
      $.ajax({
        method: 'DELETE',
        url: '/api/albums/' + $(this).attr('data-id'),
        success: deleteAlbumSuccess,
        error: deleteAlbumError
      });
    } else {
      window.location.reload();
    }
  });

  // Ajax call to add songs
  $('#albums').on('click', '.add-songs', function (e) {
  var id = $(this).closest('.album').data('album-id');

  $('#songModal').data('album-id', id);
  $('#songModal').modal();
  });

  $('#albums').on('click', '.save-song-btn', function (e) {
    var albumId = $('#songModal').data('albumId');
    var songName = $('#song-name').val();
    var trackNumber = $('#track-number').val();

    $('#songModal').modal('hide');
    $.ajax({
      method: 'POST',
      url: '/api/albums/' + albumId + '/songs',
      data: {name: songName, trackNumber: trackNumber},
      success: handleNewSongSuccess,
      error: handleNewSongError
    });
  });

  // Ajax call to edit songs of one album
  $('#albums').on('click', '.edit-songs', function (e) {
    var id = $(this).closest('.album').data('album-id');
    $('#editSongsModal').data('album-id', id);
    $('#editSongsModal').modal('show');
    console.log('edit song modal clicked');

    $.ajax({
      method: 'GET',
      url: '/api/albums/' + id,
      success: function (album) {
        // console.log(album.songs)
        album.songs.map(function (song) {
          var songHTML = `
                    <fieldset class='song-field form-horizontal' data-id="${song._id}">
                      <!-- Text input-->
                        <div class="form-group pull-left" id="song-input-field" data-id="${song._id}">
                          <label class="col-md-4 control-label pull-left" for="song-name">Song Name</label>

                          <div class="col-md-4 pull-left data-id=${song._id}">
                            <input id="edit-song-name" name="song-name"  value="${song.name}" type="text" placeholder="" class="form-control input-md pull-left" required="">
                          </div>
                          <div class="col-sm-4 pull-left data-id=${song._id}">
                            <input id="edit-track-number" name="track-number" value="${song.trackNumber}" type="text" placeholder="" class="form-control input-sm-4 pull-right" required="">
                          </div>
                          <div class="col-md-4">
                            <button class='delete-song btn btn-danger pull-right' data-id=${song._id}>Delete Song</button>
                          </div>
                          <label class="col-md-4 control-label" value="${song._id}" for="song-id">Song ID: ${song._id}</label>
                        </div>
                    </fieldset>
                    <br />

                    `
                $('#editSongsModalBody').append(songHTML);
                // window.location.reload();
        });
      },
      error: function (err) {
        console.log('error getting songs: ', err);
      }
    });
  });

  // Ajax call to update a song
  $('#albums').on('click', '.save-edit-songs-btn', function(e) {
    var albumId = $(this).closest('#editSongsModal').data('album-id');
    var songId = $('.song-field').attr('data-id');

    console.log('save edit songs btn clicked');
    console.log('album id is: ', albumId);
    console.log('song id is: ', songId);

    var updatedSongs = [];
    var songToBeUpdated = {};
    songToBeUpdated._id = songId;
    songToBeUpdated.name = $('#edit-song-name').val();
    songToBeUpdated.trackNumber = $('#edit-track-number').val();
    updatedSongs.push(songToBeUpdated);
    $('#editSongsModal').modal('hide');

    function updateSongs(albumId, updatedSongs) {
      console.log('album id is:', albumId);
      var url = '/api/albums/' + albumId + '/songs/';
      var songsPool = [];

      updatedSongs.forEach(function (songToBeUpdated) {
        var putRequest = $.ajax({
                          method: 'PUT',
                          url: url + songToBeUpdated._id,
                          data: songToBeUpdated,
                          success: function handleSongUpdate(data) {
                                    console.log(data);
                                    var updatedSongId = data._id;

                          },
                          error: function (err) {
                            console.log('error updating songToBeUpdated: ', songToBeUpdated.name, err);
                          }
        });
        songsPool.push(putRequest);
      });
      $.when.apply(null, songsPool).always(function() {
        console.log('album id is: ', albumId);
        console.log('all updates received');
        fetchAndReRenderAlbumById(albumId);
      });
    }
  });

// Ajax call to delete a song
  $('#albums').on('click', '.delete-song', function(e) {
    var albumId = $(this).closest('#editSongsModal').data('album-id');
    var songId = $(this).closest('.delete-song').attr('data-id');

    console.log('delete song button clicked');
    console.log('album id is: ', albumId);
    console.log('song id is: ', songId);

    $.ajax({
      method: 'DELETE',
      url: '/api/albums/' + albumId + '/songs/' + songId,
      data: {albumID: albumId, songID: songId},
      success: function handleSongDelete(data) {
        console.log(data);
        var songId = data._id;
        var deleteSongRow = $('#song-input-field' + songId);
        var albumId = $('#editSongsModal').data('album-id');
        deleteSongRow.remove();

        function fetchAndReRenderAlbumById(albumId) {
          $.ajax({
            method: 'GET',
            url: '/api/albums' + albumId,
            success: function(data) {
              $('div[data-album-id=' + albumId + ']').remove();
              renderAlbum(data);
            },
            error: function (err) {
              console.log(err);
            }
          });
        }
        window.location.reload();
      },
      error: function (err) {
        console.log(err);
      }
    });
  });

  // Ajax call to edit an album
  $('#albums').on('click', '.edit-album', function(e) {
    var id = $(this).closest('.album').data('album-id');
    $('#editModal').data('album-id', id);
    $('#editModal').modal();
    console.log('clicked edit album');
    console.log('album id: ', id);
    console.log($(this).closest('.album').data('album-art'));

    $.ajax({
      method: 'GET',
      url: '/api/albums/' + id,
      success: function (album) {
                  console.log(album);
                      $('#edit-album-name').val(album.name);
                      $('#edit-artist-name').val(album.artistName);
                      $('#edit-release-date').val(album.releaseDate);
                      $('#edit-genre').val(album.genres);
                      $('#edit-album-image').val(album.image);
                },

      error: function (err) {
        console.log(err);
      }
    });
  });

  $('#albums').on('click', '.save-edit-album-btn', function(e) {
    var albumId = $('#editModal').data('albumId');

    var albumName = $('#edit-album-name').val();
    var artistName = $('#edit-artist-name').val();
    var releaseDate = $('#edit-release-date').val();
    var editGenre = $('#edit-genre').val();
    var editImage = $('#edit-album-image').val();

    $('#editModal').modal('hide');
    $.ajax({
      method: 'PUT',
      url: '/api/albums/' + albumId,
      data: {name: albumName, image: editImage, artistName: artistName, releaseDate: releaseDate, genres: editGenre},
      success: handleEditAlbumSuccess,
      error: handleEditAlbumError

    });
  });

});

  function handleEditAlbumSuccess (editedAlbum) {
    $('#edit-album-name').val('');
    $('#edit-artist-name').val('');
    $('#edit-release-date').val('');
    $('#edit-genre').val('');
    $('#edit-album-image').val('');
    var albumId = $('#editModal').data('albumId');
    var getAlbumUrl = '/api/albums/' + albumId;

    $.get(getAlbumUrl, function (editedAlbum) {
      $('[data-album-id=' + albumId + ']').remove();
      console.log(editedAlbum);
      renderAlbum(editedAlbum);
    }) ;

    window.location.reload()
  }

  function handleEditAlbumError (err) {
    console.log('error edit album: ', err)
  }

  function handleNewSongSuccess (updatedAlbum) {
    $('#song-name').val('');
    $('#track-number').val('');
    var albumId = $('#songModal').data('albumId');
    var albumGetUrl = '/api/albums/' + albumId;

    $.get(albumGetUrl, function(updatedAlbum) {
      // remove current instance of album
      $('[data-album-id=' + albumId + ']').remove();

      renderAlbum(updatedAlbum);

    });
    window.location.reload()
  }


  function handleNewSongError(err) {
    console.log('new song submit error: ', err);
  }

  function showAlbumError(err) {
    console.log(err);
  }

  function getAllAlbumsSuccess(albums) {
    // console.log(albums);
    albums.forEach(function (albumsObject) {
      renderAlbum (albumsObject);
    })
  }

  function postNewAlbumSuccess(newAlbum) {
    console.log('album created: ', newAlbum);
    renderAlbum(newAlbum);
  }

  function postNewAlbumError(err) {
        console.log('error posting album: ' + err);
  }

  function deleteAlbumSuccess(deletedAlbum) {
    console.log('Album deleted: ' ,deletedAlbum);

    var deletedAlbumId = deletedAlbum._id;
    $(`#${deletedAlbumId}`).remove();
    window.location.reload();
  }

  function deleteAlbumError() {
    console.log('delete album error');
  }

  function validateForm(){
    var form = document.getElementById("album-form"), inputs = form.getElementsByTagName("input"), input = null, flag = true;
    for(var i = 0, len = inputs.length; i < len; i++) {
        input = inputs[i];
        if(!input.value) {
            flag = false;
            input.focus();
            alert("Please fill all the inputs");
            break;
        }
    }
    return(flag);
  }

// this function takes a single album and renders it to the page
  function renderAlbum(album) {
    // console.log('rendering album:', album);
    // console.log(album.songs);
    // console.log(album.genres);
    album.genres = album.genres.join(', ');

    var albumSongsList = album.songs.map(function (song) {
      return `- (${ song.trackNumber }) ${ song.name }`;
    });
    var albumSongsListStr = albumSongsList.join(', ');

       var listedAlbum  =
       ` <!-- one album -->
            <div class="row album" data-album-id="${album._id}">

              <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                  <div class="panel-body">

                  <!-- begin album internal row -->
                    <div class='row album-internal-row'>
                      <div class="col-md-3 col-xs-12 thumbnail album-art">
                        <img src="${album.image}" alt="album image">
                      </div>

                      <div class="col-md-9 col-xs-12">
                        <ul class="list-group">
                          <li class="list-group-item">
                            <h4 class='inline-header'>Album Name:</h4>
                            <span class='album-name'>${album.name}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>Artist Name:</h4>
                            <span class='artist-name'>${album.artistName}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>Released date:</h4>
                            <span class='album-releaseDate'>${album.releaseDate}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>genres</h4>
                            <span class='album-genres'>${album.genres}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>Songs</h4>
                            <br />
                            <span class='album-songs'>${ albumSongsListStr }</span>
                            <br />

                          </li>
                        </ul>
                      </div>

                    </div>
                    <!-- end of album internal row -->

                    <div class='panel-footer'>
                    <button class='delete-album btn btn-danger pull-right' data-id=${album._id}>Delete Album</button>
                    <button class='add-songs btn btn-primary pull-left' data-id=${album._id}>Add Songs</button>

                    <div class="col-md-4 pull-right">
                      <button class='edit-album btn btn-info pull-right' data-id=${album._id}>Edit Album</button>
                    </div>

                    <div class="col-md-4 text-center">
                      <button class='edit-songs btn btn-info pull-left' data-id=${album._id}>Edit Songs</button>
                    </div>

                        <!-- begin songModal: this is not visible until you call .modal() on it -->

                          <div class="modal fade" tabindex="-1" role="dialog" id="songModal" data-id=${album._id}>
                            <div class="modal-dialog">
                              <div class="modal-content">

                                <div class="modal-header">
                                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                  <h4 class="modal-title">Create Song</h4>
                                </div>

                                <div class="modal-body">
                                  <fieldset class='form-horizontal' >

                                    <!-- Text input-->
                                    <div class="form-group" id="song-input-field">
                                      <label class="col-md-4 control-label" for="song-name">Song Name</label>
                                      <div class="col-md-4">
                                        <input id="song-name" name="song-name" value="" type="text" placeholder="" class="form-control input-md" required="">
                                      </div>
                                    </div>

                                    <!-- Text input-->
                                    <div class="form-group">
                                      <label class="col-md-4 control-label" for="track-number">Track Number</label>
                                      <div class="col-md-4">
                                        <input id="track-number" name="track-number" value="" type="text" placeholder="" class="form-control input-md" required="">
                                      </div>
                                    </div>

                                  </fieldset>
                                </div>

                                <div class="modal-footer">
                                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                  <button type="button" class="btn btn-primary save-song-btn">Save changes</button>
                                </div>

                              </div><!-- /.modal-content -->
                            </div><!-- /.modal-dialog -->
                          </div><!-- /.modal -->

                          <!-- begin Edit Album Modal: this is not visible until you call .modal() on it -->

                          <div class="modal fade" tabindex="-1" role="dialog" id="editModal" data-id=${album._id}>
                            <div class="modal-dialog">
                              <div class="modal-content">

                                <div class="modal-header">
                                  <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                  <h4 class="modal-title">Create Song</h4>
                                </div>

                                <div class="modal-body">
                                  <fieldset class='form-horizontal' >

                                    <!-- Text input-->
                                    <div class="form-group">
                                      <label class="col-md-4 control-label" for="edit-album-name">Album Name</label>
                                      <div class="col-md-4">
                                        <input id="edit-album-name" name="edit-album-name" value="${album.name}" type="text" placeholder="" class="form-control input-md" required="">
                                      </div>
                                    </div>

                                    <!-- Text input-->
                                    <div class="form-group">
                                      <label class="col-md-4 control-label" for="edit-artist-name">Artist Name</label>
                                      <div class="col-md-4">
                                        <input id="edit-artist-name" name="edit-artist-name" value="${album.artistName}" type="text" placeholder="" class="form-control input-md" required="">
                                      </div>
                                    </div>

                                    <!-- Text input-->
                                    <div class="form-group">
                                      <label class="col-md-4 control-label" for="edit-release-date">Release Date</label>
                                      <div class="col-md-4">
                                        <input id="edit-release-date" name="edit-release-date" value="${album.releaseDate}" type="text" placeholder="" class="form-control input-md" required="">
                                      </div>
                                    </div>

                                    <!-- Text input-->
                                    <div class="form-group" id="song-input-field">
                                      <label class="col-md-4 control-label" for="edit-genre">Edit Genre</label>
                                      <div class="col-md-4">
                                        <input id="edit-genre" name="edit-genre" type="text" value="${album.genres}" placeholder="" class="form-control input-md" required="" required="">
                                      </div>
                                    </div>

                                    <!-- Text input-->
                                    <div class="form-group">
                                      <label class="col-md-4 control-label" for="edit-album-image">Edit Image</label>
                                      <div class="col-md-4">
                                        <input id="edit-album-image" name="edit-album-image" value="${album.image}" type="text" placeholder="" class="form-control input-md" required="">
                                      </div>
                                    </div>

                                  </fieldset>
                                </div>

                                <div class="modal-footer">
                                  <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                  <button type="button" class="btn btn-primary save-edit-album-btn">Save changes</button>
                                </div>

                              </div><!-- /.modal-content -->
                            </div><!-- /.modal-dialog -->
                          </div><!-- /.modal -->

                          <!-- Edit Songs Modal -->
                            <div class="modal fade bs-modal-lg" id="editSongsModal" data-id=${album._id} tabindex="-1" role="dialog" aria-labelledby="editSongsModalTitle">
                              <div class="modal-dialog  modal-lg" role="document">

                                <div class="modal-content">
                                  <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                    <h4 class="modal-title" id="editSongsModalTitle">Edit Song List</h4>
                                  </div>

                                  <div class="modal-body" id='editSongsModalBody' >

                                  </div>

                                  <div class="modal-footer">
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary save-edit-songs-btn">Save changes</button>
                                  </div>
                                </div><!-- /.modal-content -->

                              </div><!-- /.modal-dialog -->
                            </div><!-- /.modal -->

                    </div>

                  </div>

                </div>

              </div>

            </div>
            <!-- end one album -->`
            $('#albums').prepend(listedAlbum);

  }

function showAlbumSuccess (album) {
    console.log(album);
    album.genres = album.genres.join(', ');
    var albumSongsList = album.songs.map(function (song) {
      return `- (${ song.trackNumber }) ${ song.name }`;
    });
    var albumSongsListStr = albumSongsList.join(', ');
     var showAlbum =  `  <!-- one album -->
            <div class="row album" data-album-id="${album._id}">

              <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                  <div class="panel-body">

                  <!-- begin album internal row -->
                    <div class='row'>
                      <div class="col-md-3 col-xs-12 thumbnail album-art">
                        <img src="${album.image}" alt="album image">
                      </div>

                      <div class="col-md-9 col-xs-12">
                        <ul class="list-group">
                          <li class="list-group-item">
                            <h4 class='inline-header'>Album Name:</h4>
                            <span class='album-name'>${album.name}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>Artist Name:</h4>
                            <span class='artist-name'>${album.artistName}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>Released date:</h4>
                            <span class='album-releaseDate'>${album.releaseDate}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>genres</h4>
                            <span class='album-genres'>${album.genres}</span>
                          </li>

                          <li class="list-group-item">
                            <h4 class='inline-header'>Songs</h4>
                            <br />
                            <span class='album-songs'>${ albumSongsListStr }</span>
                            <br />

                          </li>
                        </ul>
                      </div>

                    </div>
                    <!-- end of album internal row -->

                  <div class='panel-footer'>
                    </div>
                  </div>

              </div>
            </div>
          </div>

          <-- end one album --> `

          $('#show-album').prepend(showAlbum);

          window.location.href = '/show';

}
