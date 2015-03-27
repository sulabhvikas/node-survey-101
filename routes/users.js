// Connect to MongoDB using Mongoose
var app = require('../app');
var mongoose = require('mongoose');
var db;
var domain = "CTL\\";
var users_from_db = [];

if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'surveydb');
}

// Get Poll schema and model
var UserSchema = require('../models/User.js').UserSchema;
var User = db.model('users', UserSchema);

module.exports.AuthUser = User;

module.exports.square = function(width) {
  return {
    area: function() {
      return width * width;
    }
  };
}

//var users;
module.exports.users = function() {
	return {
		authorized_users: function() {
		  User.find(function(err, data) {
				//console.log(users);
				if(err || !data) {
				  console.log('err='+err);
				  throw 'Error';
				} else {
					//users = data;
					exports.users_from_db = data;
					console.log(data);
				}
			});			
			//return users;
		}
	};
}

/*module.exports.users = function() {
	User.find(function(err, users) {
		//console.log(users);
		if(err || !users) {
		  console.log('err='+err);
		  throw 'Error';
		} else {
			//console.log("doc="+users);
			//console.log(users);
			return users;
			//res.json(users);
		}
	});
};*/