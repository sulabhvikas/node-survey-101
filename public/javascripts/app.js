// Angular module, defining routes for the app
angular.module('surveys', ['surveyServices']).
	config(['$routeProvider', function($routeProvider) {
		$routeProvider.
			when('/surveys', { templateUrl: 'partials/surveylist.html', controller: SurveyListCtrl }).
			when('/surveys/:surveyId', { templateUrl: 'partials/polllist.html', controller: PollListCtrl }).
			when('/newsurvey', { templateUrl: 'partials/newsurvey.html', controller: SurveyNewCtrl }).			
			when('/poll/:pollId', { templateUrl: 'partials/item.html', controller: PollItemCtrl }).
			when('/newpoll/:surveyId', { templateUrl: 'partials/newpoll.html', controller: PollNewCtrl }).
			// If invalid route, just redirect to the main list view
			otherwise({ redirectTo: '/surveys' });
	}]);