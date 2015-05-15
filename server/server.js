var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('sequelize');
var db = require('./config');
var http = require('http');
var hstore = require('pg-hstore')();
var methodOverride = require('method-override');
// var favicon      = require('serve-favicon');
var aws = require('aws-sdk');
var app = express();
var uuid = require('uuid');

/*
 * Load the S3 information from the environment variables.
 */
var AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
var AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
var S3_BUCKET = process.env.S3_BUCKET

app.set('views', '../client/www');
app.set('view engine', 'jade');

app.use(express.static(__dirname + '/../client/www'));
// app.use(favicon(__dirname + '/favicon.ico'));


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
});


/*
 * Respond to GET requests to /sign_s3.
 * Upon request, return JSON containing the temporarily-signed S3 request and the
 * anticipated URL of the image.
 */
app.get('/sign_s3', function(req, res){
    var uniqueFileName = uuid.v1();
    aws.config.update({accessKeyId: AWS_ACCESS_KEY , secretAccessKey: AWS_SECRET_KEY });
    var s3 = new aws.S3(); 
    var s3_params = { 
        Bucket: S3_BUCKET, 
        Key: uniqueFileName,
        Expires: 60, 
        ContentType: req.query.file_type, 
        ACL: 'public-read'
    }; 
    s3.getSignedUrl('putObject', s3_params, function(err, data){ 
        if(err){ 
            console.log(err); 
        }
        else{ 
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+uniqueFileName 
            };
            console.log('return_data',return_data.url);
            res.write(JSON.stringify(return_data));
            res.end();
        } 
    });
});



