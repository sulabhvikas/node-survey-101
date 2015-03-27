// Controller for the survey list
function SurveyListCtrl($scope, $location, Survey) {
	$scope.surveys = Survey.querySurveys();
}
function PollListCtrl($scope, $routeParams, socket, $location, Survey) {
	$scope.survey = Survey.queryPolls({
		surveyId : $routeParams.surveyId
	});
	
	$scope.userVotes = {};
	
	$scope.submitPoll = function() {
		var survey = $scope.survey[0],
			surveyId = survey._id,
			choices = null;
			
		$scope.selected_ids = [];
		var userid = $scope.survey[1].user_info.CUID;
		angular.forEach($scope.survey[0].polls, function(questions) {
			//alert(questions);
			angular.forEach(questions.questions, function(question) {
				//alert(question.userVotes);
				$scope.selected_ids.push({userVote: question.userVote, userComments: question.comments});//update comments vote comments and add field for survey comments as well
				//{ ip: ip, userid: logInInfo.userid }
				choices = $scope.selected_ids;
			});		
		});
		
		//alert("vote="+choices);
		if(choices) {
			var voteObj = { survey_id: surveyId, session_userid: userid, suggestions: $scope.anysuggestions, votes: choices };
			socket.emit('send:vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};
	
	socket.on('myvote', function(data) {
		//console.dir("socket-on-myvote="+data);
		//console.dir("data._id="+data[0]._id);
		//console.dir("$routeParams.surveyId="+$routeParams.surveyId);
		if(data[0]._id === $routeParams.surveyId) {
			$scope.poll = data;			
		}
	});
	
	socket.on('vote', function(data) {
		console.dir("socket-on-vote="+data);
		if(data._id === $routeParams.surveyId) {
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
		}		
	});
	
	/*$scope.submitPoll = function() {
		var survey = $scope.survey[0];
		//alert('success'+polls.length);
		// Check that a question was provided

		var survey = new Survey(survey);
		survey.$save(function(p, resp) {
			if(!p.error) {
				// If there is no error, redirect to the main view
				$location.path('surveys');
			} else {
				alert('Could not create poll');
			}
		});		
	};*/
}

// Controller for an individual poll
function PollItemCtrl($scope, $routeParams, socket, Survey) {	
	$scope.poll = Survey.get({pollId: $routeParams.pollId});
	
	socket.on('myvote', function(data) {
		console.dir(data);
		if(data._id === $routeParams.pollId) {
			$scope.poll = data;
		}
	});
	
	socket.on('vote', function(data) {
		console.dir(data);
		if(data._id === $routeParams.pollId) {
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
		}		
	});
	
	$scope.vote = function() {
		var pollId = $scope.poll._id,
				choiceId = $scope.poll.userVote;
		
		if(choiceId) {
			var voteObj = { poll_id: pollId, choice: choiceId };
			socket.emit('send:vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};

}

// Controller for creating a new survey
function SurveyNewCtrl($scope, $location, Survey) {
	// Validate and save the new poll to the database
	$scope.createSurvey = function() {
		var survey = $scope.survey;
		//alert(survey.name);
		// Create a new Survey from the model
		var newsurvey = new Survey(survey);
				
		// Call API to save poll to the database
		newsurvey.$save(function(p, resp) {
			if(!p.error) {
				// If there is no error, redirect to the main view
				$location.path('surveys');
			} else {
				alert('Could not create survey');
			}
		});
	};	
}

// Controller for creating a new poll
function PollNewCtrl($scope, $routeParams, $location, Survey) {

	$scope.survey = Survey.queryPolls({
		surveyId : $routeParams.surveyId
	});
	
	// Define an empty poll model object	
	$scope.poll = {
		category: ''
	};
	
	$scope.question = {
		question: '',
		choices: [ { text: '' }, { text: '' }, { text: '' }]
	};
	
	// Method to add an additional choice option
	$scope.addChoice = function() {
		//$scope.poll.questions.choices.push({ text: '' });
		angular.forEach($scope.poll.polls, function(questions) {
			//alert(questions);
			angular.forEach(questions.questions, function(question) {
				question.choices.push({ text: '' });
			});		
		});		
	};
	
	// Validate and save the new poll to the database
	$scope.createPoll = function() {
		var poll = $scope.poll;
		var question = $scope.question;
		var pollcat = null;
		
		//var isCategorySelected = false;
		
		if ((poll.category.length == 0) && ($scope.pollCat._id != null)) {
			pollcat = {_id: $scope.pollCat._id, category: $scope.pollCat.category, questions:[question]};
			//isCategorySelected = true;
		}
		
		if (poll.category.length > 0) {
			pollcat = {category: poll.category, questions:[question]};
		}
		var survey = {_id: $routeParams.surveyId, polls: [pollcat]};
		var newSurvey = new Survey(survey);
		
		// Call API to save poll to the database
		newSurvey.$save(function(p, resp) {
			if(!p.error) {
				// If there is no error, redirect to the main view
				$location.path('surveys');
			} else {
				//alert(p);
				alert('Could not create poll');
			}
		});
	};
}