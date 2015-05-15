//controller for index.html
function mainCtrl($scope, $location, liveFactory){

  $scope.q="";
// This function is invoked when the user clicks on the Live logo in the corner.

// When invoked the home view is served
// in the index.html we capture the user query in the header when they perform a search and store it in
// $scope.query, and $scope.q is used as a filter for displaying the artist search result
// both q and query are set to null initially
  $scope.goHome = function(){
    $location.path('/');
    $scope.query = null;
    $scope.q = null;
    liveFactory.getAllArtists();
  };
/* index.html listens to artistSearch() with ng-submit, so only upon a user's click of the submit button during
a particular artist search we set q to the captured artist name that's stored in query, serves the home page
and clears query so the search bar is empty*/

//Upon submission of artist search this function is invoked

//We want to assign the search query(artistname) to the liveFactory.artist
//This is used when we hit the spotify API which is hit when we dont have that artist in our database.

  $scope.artistsSearch = function(){
    $scope.q = $scope.query;
    liveFactory.artist = $scope.query;
    $location.path('/');
    $scope.query = null;
  };

  $scope.obj = liveFactory;

  $scope.Record = function(){
    console.log('record video');
    //angular.element("#captureVideo").trigger('click');
    $("#videoCapture").trigger('click');
  };

}

angular.module('liveApp')
.controller('mainCtrl', ['$scope', '$location', 'liveFactory', mainCtrl]);
