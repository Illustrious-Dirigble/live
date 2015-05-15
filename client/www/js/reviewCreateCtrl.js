function reviewCreateCtrl($scope, $http, $location, $interval, liveFactory){

  $scope.review = {};
  $scope.max = 5;
  // hide the header bar by setting the hideHeader to false
  liveFactory.toggleHeader();

  $scope.review.artistName = liveFactory.artistNameReview;

  $scope.$on('$ionicView.beforeLeave', function(){
    liveFactory.toggleHeader();
  });

  $scope.goBack = function(){
    $location.path('/artist/' + $scope.review.artistName);
  };
  // post a new review for the artist
  $scope.postReview = function (){
    return $http({
      method: 'POST',
      url: '/newreview',
      data: $scope.review
    })
    .then(function (resp) {
      console.log('response data:', resp.data);
      $scope.getAvgRating();
      return resp.data;
    });
  };

  // Retrieve average rating from all reviews of that artist
  $scope.getAvgRating = function(){
    return $http({
      method: 'GET',
      url: '/getAvgRating',
      params: {artistName: $scope.review.artistName}
    })
    .then(function(resp){
      $scope.obj = {};
      if(resp.data[0]['avg']){
        $scope.obj.avgrating = parseInt(resp.data[0]['avg']);
      }
      else {
        $scope.obj.avgrating = parseInt(resp.data[0]['AVG(rating)']);
      }
      $scope.updateAvgRating();
      console.log('router - avg rating obj:', $scope.obj);
    });
  };

  // Write Avg. Ratings to Artist DB
  $scope.updateAvgRating = function (){
    return $http({
      method: 'POST',
      url: '/updateAvgRating',
      params: {artistName: $scope.review.artistName},
      data: $scope.obj
    })
    .then(function(resp){
      console.log('router - updated avg rating:', resp.data);
      $location.path('/artist/' + $scope.review.artistName);
    });
  };


  $scope.toggle = {};
  $scope.toggle.recordOrSave = "Record";

  $scope.toggleRecordOrSave = function() {
    $scope.toggle.recordOrSave = $scope.toggle.recordOrSave === "Record" ? "Save" : "Record";
  };

  $scope.recordOrSave = function() {
    if ($scope.toggle.recordOrSave === "Record") {
      $scope.recordVideo();
    } else {
      $scope.saveVideo();
    }
  };

  $('#reviewVideoCapture').change(function() {
    $scope.toggleRecordOrSave();
  });

  $scope.recordVideo = function(){
    console.log('record video');
    $('#reviewVideoCapture').trigger('click');
    timer();
  };

  var timer = $interval(function(){
    if ( $('#reviewVideoCapture').get(0).files[0] ) {
      $scope.toggleRecordOrSave();
      timer.cancel();
    }
  }, 50);

  $scope.saveVideo = function(){
    console.log('save video');
    //ionic.trigger('click', {target: $(".reviewVideoCapture")}, true, true);
  };

}

angular.module('liveApp')
.controller('reviewCreateCtrl', ['$scope', '$http', '$location', '$interval', 'liveFactory', reviewCreateCtrl]);

