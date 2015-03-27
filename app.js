/*jshint node:true*/
var express = require('express');
var ntlm = require('express-ntlm');
var routes = require('./routes');
var users = require('./routes/users');
var http = require('http');
var path = require('path');
//var ioCookieParser = require('socket.io-cookie');
//var SessionSockets = require('session.socket.io');
var MongoStore = require('connect-mongo')(express);
//var wincmd = require('node-windows');
var fs = require('fs');
var isAuthSuccess = null;

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var windows_user = null;
/*wincmd.list(function(svc){
  svc.forEach(function(s) {
	if (s.ImageName == 'node.exe') {
		exports.windows_user = s.UserName;
		console.log('windows_user ---> '+s.UserName);
		//console.log('s.UserName --->'+s.UserName);
	}
  });
},true);*/

/*var users = null;
fs.readFile('users.json', 'utf8', function (err, data) {
  if (err) throw err;
  exports.users = JSON.parse(data);
});*/

//var users = JSON.parse(fs.readFileSync('users.json'));

users.AuthUser.find(function(err, data) {
	//console.log(users);
	if(err || !data) {
	  console.log('err='+err);
	  throw 'Error';
	} else {
		//users = data;
		exports.authusers = data;
		//console.log(data);
	}
});	

app.set('port', process.env.VCAP_APP_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
app.use(express.favicon(path.join(__dirname, 'public','images','favicon.ico'))); 
app.use(express.logger('dev'));
app.use(express.bodyParser());
//app.use(express.bodyParser({uploadDir:'./uploads'}));
app.use(express.methodOverride());
var cookieParser = express.cookieParser('S3CRE7')
app.use(cookieParser);
var sessionStore = new MongoStore({
    db: 'surveyschema',
    host: '127.0.0.1'
  });
//var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
//app.use(express.cookieSession());
app.use(express.session({
  store: sessionStore
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
// Handle Errors gracefully
app.use(function(err, req, res, next) {
	if(!err) return next();
	console.log(err.stack);
	res.json({error: true});
});

app.all('/', ntlm());

app.get('/', routes.index_ntlm);
// Main App Page - Use this when you don't need NTLM authentication
//app.get('/', routes.index);

// MongoDB API Routes
app.get('/surveys/surveys', routes.surveylist);
app.get('/surveys/:id', routes.polllist);
//app.get('/questions', routes.pollQuestions);
app.post('/surveys', routes.createSurvey);
app.post('/surveys/polls', routes.createPoll);
app.post('/vote', routes.vote);
//app.get('/users', routes.users);
app.post('/fileUpload', function(req, res, next) {
    console.log(req.body);
    console.log(req.files);
});
//var mySquare = users.square(2);
//console.log('square-->'+mySquare.area());
console.log('users from file'+users);
//var authUsers = users.users();
//authUsers.authorized_users();
//console.log('users method-->'+authUsers.authorized_users());
//console.log('users.users_from_db'+users.users_from_db);
//var users = routes.users;
//console.log('in app-->'+users);
module.exports = app;
//console.log('end-->'+windows_user);
//exports.windows_user = windows_user;

io.sockets.on('connection', routes.vote);
/*sessionSockets.on('connection', routes.vote, function (err, socket, session) {
  //your regular socket.io code goes here
  //and you can still use your io object
  //console.log('socket-cookies ='+socket.request.headers.cookie.connect.sess);
  console.log('In session sessionSockets on');
});*/

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
