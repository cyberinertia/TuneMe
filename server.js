let express = require('express');
let bodyParser = require('body-parser');
let db = require('./models');

let controllers = require('./controllers');

// generate a new express app
let app = express();

// serve static files in public
app.use(express.static('public', { root: __dirname }));

//body parser config to accept datatypes
app.use(bodyParser.urlencoded({ extended: true }));

// serve static files in public
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/show', function (req, res) {
  res.sendFile(__dirname + '/views/show.html');
});

app.get('/api', controllers.api.index);
app.get('/api/albums', controllers.albums.index);
app.get('/api/albums/:id', controllers.albums.show);
app.get('/api/albums/:id/songs', controllers.albumsSongs.index);

app.post('/api/albums', controllers.albums.create);
app.post('/api/albums/:id/songs', controllers.albumsSongs.create);

app.put('/api/albums/:id', controllers.albums.update);
app.put('/api/albums/:id/songs/:id', controllers.albumsSongs.update);

app.delete('api/albums/:id', controllers.albums.destroy);
app.delete('api/albums/:id/songs/:id', controllers.albumsSongs.destroy);

app.listen(process.env.PORT || 3000, function() {
  console.log('TuneMe app listening on http://localhost:3000/');
});
