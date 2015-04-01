// Connect to MongoDB using Mongoose
var app = require('../app');
var mongoose = require('mongoose');
var db;
var domain = "CTL\\";
var auth_user_static = {
        "EMP_NAME": "Sulabh Vikas",
        "EMP_ID": "165",
        "CUID": "svikas",
        "Level": "7",
        "Division": "Narendra Marikale"
    };

if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   console.log("env = "+env);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'surveyschema');
}

// Get Poll schema and model
var SurveySchema = require('../models/Survey.js').SurveySchema;
var Survey = db.model('surveys', SurveySchema);

// Get Poll schema and model
var UserSchema = require('../models/User.js').UserSchema;
var User = db.model('users', UserSchema);

// Main application view
exports.index = function(req, res) {
	var username = 'svikas'
	//req.session.isAuthSuccess = true;
	//req.session.authUser = username;
	res.render('index', {user: username});
	//res.render('index');
};

exports.index_ntlm = function(req, res) {
	console.log("log in attempt = "+req.ntlm) // { target: 'MYDOMAIN', userid: 'MYUSERID', workstation: 'MYWORKSTATION' }
	var logInInfo = req.ntlm;
	logInInfo = req.ntlm;
	/*res.writeHead(302, {
	  'Location': '/'
	  //add other headers here...
	});
	res.end();*/
	
	app.authusers.forEach(function(user) {
		if ((user.CUID).toLowerCase() == (logInInfo.userid).toLowerCase()) {
			console.log(user);
			req.session.isAuthSuccess = true;
			req.session.authUser = user;
		}
	});	
	
	var username = "";
	if (req.session.authUser != null) {
		username = req.session.authUser.EMP_NAME;
	} else {
		username = logInInfo.userid;
	}
	res.render('index', {user: username});
	//res.redirect(routes.index);
	//res.send(request.ntlm);
};

exports.users = function(req, res) {
		User.find(function(err, users) {
		//console.log(users);
		if(err || !users) {
		  console.log('err='+err);
		  throw 'Error';
		} else {
			//console.log("doc="+users);
			//console.log(users);
			//return users;
			res.json(users);
		}
	});
};

module.exports.pollQuestions = function(req, res) {
	// Query Mongo for surveys
	console.log('surveylist');
	Survey.find({"name": "PEMS Survey"}, {"polls.questions" : 1}, function(err, poll) {
		res.json(poll);
	});
};


exports.surveylist = function(req, res) {
	// Query Mongo for surveys
	//console.log('surveylist');
	/*app.authusers.forEach(function(user) {
		if ((user.CUID).toLowerCase() == (logInInfo.userid).toLowerCase()) {
			console.log(user);
			isAuthSuccess = true;
			authUser = user;
		}
	});*/
	
	Survey.find({}, '', function(error, surveys) {
		//surveys.push({user_info: req.session.authUser, isAuth: req.session.isAuthSuccess});
		surveys.push({user_info: auth_user_static, isAuth: true});
		res.json(surveys);
	});
};

// JSON API for list of polls
exports.polllist = function(req, res) {
	// Query Mongo for polls, just get back the question text
	//console.log("login user2-->"+logInInfo.userid);
	//console.log("login user2 lower-->"+(logInInfo.userid).toLowerCase());
	/*app.authusers.forEach(function(user) {
		if ((user.CUID).toLowerCase() == (logInInfo.userid).toLowerCase()) {
			console.log(user);
			isAuthSuccess = true;
			authUser = user;
		}
	});	*/
	var id = req.params.id;
	//console.log('*******session user='+(req.session.authUser.CUID).toLowerCase());
	
	Survey.find({"_id": id}, '', function(error, survey) {
		//console.log('survey='+survey);
		if(survey) {
			var userVoted = false,
					userChoice,
					totalVotes = 0;
					
			// Loop through poll choices to determine if user has voted
			// on this poll, and if so, what they selected
			survey.forEach(function(polls) {
				polls.polls.forEach(function(questions) {
					questions.questions.forEach(function(question) {
						question.choices.forEach(function(choice) {
							choice.votes.forEach(function(vote) {									
								totalVotes++; // add arrays for userid and ip later		
								//if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
								if (vote.userid == (req.session.authUser.CUID).toLowerCase()) {
									userVoted = true;
									userChoice = { _id: choice._id, text: choice.text };
								}
							});
						}); 					
					});	
				});		
				console.log('survey id='+polls._id);
				/*polls.userVoted = userVoted;
				polls.userChoice = userChoice;
				polls.totalVotes = totalVotes;*/			
			});
			
			//console.log('userVoted='+userVoted);
			//console.log('userChoice='+userChoice);
			//console.log('totalVotes='+totalVotes);
			//console.log('In polllist: session user ='+req.session.authUser.CUID);
			//console.log('In polllist: session isAuthSuccess='+req.session.isAuthSuccess);
			// Attach info about user's past voting on this poll
			survey.push({user_info: req.session.authUser, isAuth: req.session.isAuthSuccess, userVoted: userVoted, userChoice: userChoice, totalVotes: totalVotes}); 
			//console.log('end survey='+survey[0]);
			res.json(survey);
		} else {
			res.json({error:true});
		}		
		//res.json(polls);
	});
};

// JSON API for getting a single poll
exports.poll = function(req, res) {
	// Poll ID comes in the URL
	var pollId = req.params.id;
	
	// Find the poll by its ID, use lean as we won't be changing it
	Survey.findById(pollId, '', { lean: true }, function(err, poll) {
		if(poll) {
			var userVoted = false,
					userChoice,
					totalVotes = 0;

			// Loop through poll choices to determine if user has voted
			// on this poll, and if so, what they selected
			for(c in poll.choices) {
				var choice = poll.choices[c]; 

				for(v in choice.votes) {
					var vote = choice.votes[v];
					totalVotes++;

					if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
						userVoted = true;
						userChoice = { _id: choice._id, text: choice.text };
					}
				}
			}

			// Attach info about user's past voting on this poll
			poll.userVoted = userVoted;
			poll.userChoice = userChoice;

			poll.totalVotes = totalVotes;
		
			res.json(poll);
		} else {
			res.json({error:true});
		}
	});
};

// JSON API for creating a new survey
exports.createSurvey = function(req, res) {
	var reqBody = req.body,
		surveyObj = null;
	var newpolls = null;
	if (reqBody._id == null) {
		// Build up poll object to save
		surveyObj = {name: reqBody.name};
		var survey = new Survey(surveyObj);	
		// Save poll to DB
		survey.save(function(err, doc) {
			if(err || !doc) {
				throw 'Error';
			} else {
				res.json(doc);
			}		
		});
	} else {		
		var isAdded = false;		
		newpolls = reqBody.polls.filter(function(v) { return v.category != ''; }),
		surveyObj = {name: reqBody.name, polls: newpolls};
		console.log('newpolls ID->'+newpolls[0]._id);
		console.log('newpolls category->'+newpolls[0].category);
		
		/*var newpollcategory = null;
		newpolls.forEach(function(mynewpoll) {
			newpollcategory = mynewpoll.category;
			console.log('mynewquestion.category--->'+mynewpoll.category);
		});*/

		Survey.findById(reqBody._id, function(err, survey) {
			if ((newpolls[0]._id == null) && !isAdded) {
					console.log('<---new category --->');
					survey.polls.push(newpolls[0]);
					isAdded = true;
			}
			survey.polls.forEach(function(questions) {
				if ((newpolls[0].category == questions.category) && !isAdded) {
					console.log('<---existing category --->');
					questions.questions.push(newpolls[0].questions[0]);		
					isAdded = true;
				} 				
			}); 

			survey.save(function(err, doc) {
				if(err || !doc) {
				  console.log('err='+err);
				  if (err.name == 'ValidationError') {
					for (field in err.errors) {
					  console.log("err-fields->"+field);
					}
				  } 
				  throw 'Error';
				} else {
					console.log("doc="+doc);
					res.json(doc);
				}
			});
		});
		
		/*Survey.update({ _id: reqBody._id }, { "$pushAll": 
			   { polls: polls }}, { upsert: true}, function(err, doc) {
			if(err || !doc) {
			  console.log('err='+err);
			  throw 'Error';
			} else {
			  res.json(doc);
			}   
		  });*/
	}
	console.log("create survey="+reqBody.name);			
	// Create poll model from built up poll object

};

// JSON API for creating a new poll
exports.createPoll = function(req, res) {
	var reqBody = req.body,
			// Filter out choices with empty text
			choices = reqBody.choices.filter(function(v) { return v.text != ''; }),
			// Build up poll object to save
			pollObj = {question: reqBody.question, choices: choices};
				
	// Create poll model from built up poll object
	var poll = new Survey(pollObj);
	
	// Save poll to DB
	poll.save(function(err, doc) {
		if(err || !doc) {
			throw 'Error';
		} else {
			res.json(doc);
		}		
	});
};

exports.vote = function(socket) {
	socket.on('send:vote', function(data) {
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address;
		//db.surveys.find({"_id" : ObjectId("543d0608e279268828537905")}, {"polls.questions._id": 1, "polls.questions.question" : 1});
		//console.log('data.survey_id'+data.survey_id);
		//choices = {userVote: question.userVote, userComments: question.comments}
		var selectedChoices = data.votes;
		var polls;
		var surveyResults = [];
		Survey.findById(data.survey_id, function(err, survey) {
			console.log("survey.length: "+survey.length);
			//var choice = poll.polls.id(data.choice);
			//var questions = poll.polls
			//survey.forEach(function(poll_data) {
				//polls = poll_data.polls;
				//console.log("poll_data"+poll_data.polls);	
				survey.polls.forEach(function(questions) {
					//console.log("questions="+questions);	
					questions.questions.forEach(function(question) {
						//console.log("ques="+question);	
						question.choices.forEach(function(choice) {
							//console.log(choice._id == selectedChoice);	
							selectedChoices.forEach(function(selectedChoice) {
								//console.log('selected coice -->'+selectedChoice);
								if (choice._id == selectedChoice.userVote) {
									console.log('selected='+choice._id);	
									choice.votes.push({ ip: ip, userid: (data.session_userid).toLowerCase(), comments: selectedChoice.userComments });
									//choice.set({comments: selectedChoice.userComments});
									//console.log("afterset-votes="+choice);
									/*Survey.update({ _id: data.survey_id }, 
										{$set: {"polls": poll}},
										{ upsert: true}, 
										function(err, doc) {
											if(err || !doc) {
											  console.log('err='+err);
											  throw 'Error';
											} else {
											  //res.json(doc);
											}  
									});*/									
								}
							});
						}); 
					}); 					
				}); 
			//}); 
			survey.suggestions.push({userid: data.session_userid, suggestions: data.suggestions});
			//choice.votes.push({ ip: ip, userid: 'svikas' });
			/*var survey_votes = new Survey(survey);
			console.log('survey-->'+survey);
			console.log('surveyid-->'+survey._id+survey_votes._id);
			console.log('surveyname-->'+survey.name);*/
			
			survey.save(function(err, doc) {
				if(err || !doc) {
				  console.log('err='+err);
				  if (err.name == 'ValidationError') {
					for (field in err.errors) {
					  console.log("err-fields->"+field);
					}
				  } 
				  throw 'Error';
				} else {
					console.log("doc._id="+doc._id);				

					doc.polls.forEach(function(questions) {
						//console.log("questions="+questions);	
						questions.questions.forEach(function(question) {
							//console.log("ques="+question);	
							question.choices.forEach(function(choice) {
								var theDoc = { 
									_id: doc._id, 
									choices: question.choices, 
									question: question.question, 
									userVoted: false, 
									totalVotes: 0
								};
								choice.votes.forEach(function(vote) {						
									
									theDoc.totalVotes++; // add arrays for userid and ip later		
									//if(vote.ip === ip) { //chnage it to userid based restriction
									if (vote.userid === (data.session_userid).toLowerCase()) {
										theDoc.userVoted = true;
										theDoc.userChoice = { _id: choice._id, text: choice.text };
									}
									surveyResults.push(theDoc);
								});
							}); 
						}); 					
					}); 					
					console.log('surveyResults'+surveyResults);
					socket.emit('myvote', surveyResults);
					socket.broadcast.emit('vote', surveyResults);
				}
				
			});
		});
	});
};