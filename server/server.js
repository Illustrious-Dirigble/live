var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var db = require('./config');
var http = require('http');
var hstore = require('pg-hstore')();
var methodOverride = require('method-override');

var app = express();

app.set('views', '../client/www');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/../client/www'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());

var port = process.env.PORT || 5000;

db.sequelize.sync().then(function() {
  http.createServer(app).listen(port, function(){
    console.log('Express server listening on port ' + port);
  });
});

//testing function 
app.get('/art', function(req, res){
  db.Artist.findAll({})
  .then(function (artists) {
    res.status(200).json(artists);
  })
  .catch(function(error) {
    console.log('error: ', error);
  });
});

// get the artist from the Artists table 
app.get('/artist', function(req, res){
  db.Artist.find({
    where: { artistName: req.query.artistName }
  })
  .then(function (artist) {
    res.status(200).json(artist);
  });
});

//get the all the reviews of the artist from the reviews table 
app.get('/getreviews', function(req, res){
  db.Review.findAndCountAll({
    where: { artistName: req.query.artistName }
  })
  .then(function (review) {
    res.status(200).json(review);
  });
});

// get the average rating of the artist 
var query = ' \
  SELECT AVG(rating) FROM "Reviews" \
  WHERE "artistName" = :artistName \
';

app.get('/getAvgRating', function(req, res){
  // db.sequelize.query("SELECT AVG(rating) FROM `Reviews` WHERE artistName = :artistName ", {replacements: {artistName: req.query.artistName}, type: sequelize.QueryTypes.SELECT})
  // The above line works in SQLite but fails with Postgres.
  // Use the following code instead.
  // Sequelize gives feedback that the method below has been deprecated, but it is the only way we found to have it work with Postgres.
  db.sequelize.query(query, null, {raw: true}, { 
  artistName: req.query.artistName
})
  .then(function(avgrating) {
    console.log('average rating: ', avgrating[0]);
    res.status(200).json(avgrating[0]);
  });
});

// add a new artist row to the Artists table 
app.post('/newartist', function(req, res) {
  db.Artist
    .build( req.body )
    .save()
    .then(function(body) {
      res.status(201).send(body);
    })
    .catch(function(error) {
      console.log('error: ', error);
    });
});

// add a new review entry in the Reviews table
app.post('/newreview', function(req, res) {
  db.Review
    .build( req.body )
    .save()
    .then(function(body) {
      res.status(201).send(body);
    }).catch(function(error) {
      console.log('error: ', error);
    });
});

app.post('/submit-video', function(req, res) {
  var videoInfo = req.files;
});


// update the average rating of the artist after 
//the user add a new review for the artist 
var query2 = ' \
  UPDATE "Artists" \
  SET avgrating = :avgrating, \
  reviewcount = reviewcount + 1 \
  WHERE "artistName" = :artistName \
';

app.post('/updateAvgRating', function(req, res) {
  db.sequelize.query(query2, null, {raw: true}, {
    avgrating: req.body.avgrating,
    artistName: req.query.artistName
  })
  .then(function(body) {
    console.log('req', body);
    res.status(201).send(body);
  })
  .catch(function(error) {
    console.log('error: ', error);
  })
})


