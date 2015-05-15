// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('liveApp', ['ionic', 'ionic.rating'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
//setting up the states the app can be in
//each state has an unqique url and controller
.config(function($stateProvider, $urlRouterProvider, $sceDelegateProvider){
  $urlRouterProvider.otherwise('/');

  $sceDelegateProvider.resourceUrlWhitelist([
    'self',
    'https://hr26livetranscode.s3.amazonaws.com/**'
  ]);

//home page
  $stateProvider.state('home', {
    url: '/',
    templateUrl: './views/home.html',
    controller: 'homeCtrl'
  });
// creating a new artist to save to the databse
  $stateProvider.state('newArtist', {
    url: '/newartist',
    templateUrl: './views/newArtist.html',
    controller: 'newArtistCtrl'
  });

  // Search results from calling Spotify API to create a new artist
  $stateProvider.state('searchResults', {
    url: '/results',
    templateUrl: './views/searchResults.html',
    controller: 'searchResultsCtrl'
  });

  //Route for review creation.
  $stateProvider.state('newReview', {
    url: '/newreview',
    templateUrl: './views/reviewCreate.html',
    controller: 'reviewCreateCtrl'
  });

  // Artist page
  $stateProvider.state('artistPage', {
    url: '/artist/:artistName',
    templateUrl: './views/artistPage.html',
    controller: 'artistPageCtrl'
  });

});

