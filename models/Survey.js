var mongoose = require('mongoose');

// Subdocument schema for votes
var voteSchema = new mongoose.Schema({ 
	ip: String,
	userid: String,
	comments: String
});

// Subdocument schema for poll choices
var choiceSchema = new mongoose.Schema({ 
	text: String,
	votes: [voteSchema]
});

// Document schema for polls
var questionSchema = new mongoose.Schema({
	question: { type: String, required: true },
	choices: [choiceSchema]
});

var suggestionSchema = new mongoose.Schema({
	userid: String,
	suggestions: String
});

// Document schema for polls
var pollSchema = new mongoose.Schema({
	category: { type: String, required: true },
	questions: [questionSchema]
});

// Document schema for polls
exports.SurveySchema = new mongoose.Schema({
	name: { type: String, required: true },
	suggestions: [suggestionSchema],
	polls: [pollSchema]
});