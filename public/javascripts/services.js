// Angular service module for connecting to JSON APIs
angular.module('surveyServices', ['ngResource']).
	factory('Survey', function($resource) {
		return $resource('surveys/:surveyId', {}, {
			// Use this method for getting a list of polls
				querySurveys : {
					method : 'GET',
					params : {
						surveyId : 'surveys'
					},
					isArray : true
				},
				queryPolls : {
					method : 'GET',
					isArray : true
				}				
		})
	}).
	factory('socket', function($rootScope) {
		var socket = io.connect();
		return {
			on: function (eventName, callback) {
	      socket.on(eventName, function () {  
	        var args = arguments;
	        $rootScope.$apply(function () {
	          callback.apply(socket, args);
	        });
	      });
	    },
	    emit: function (eventName, data, callback) {
	      socket.emit(eventName, data, function () {
	        var args = arguments;
	        $rootScope.$apply(function () {
	          if (callback) {
	            callback.apply(socket, args);
	          }
	        });
	      })
	    }
		};
	});