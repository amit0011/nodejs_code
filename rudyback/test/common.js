var chai = require('chai');
var server = require('../server');
var chaiHttp = require('chai-http');
var session = require('session');
var fs = require('fs');
var should = chai.should();
var expect = chai.expect;
chai.use(chaiHttp);
var timeout = 20000;
var request = chai.request(server);
exports.request = request;
exports.should = should;
exports.expect = expect;
exports.session = session;
exports.chai = chai;
exports.timeout = timeout;


var execute_test = function() {
	require('./token-gen')(function(token, user) {
		// require all other files and give them module.exports
		// do not generate token all the time for every file.
		// eg this 
		fs.readdirSync(__dirname + '/routes').forEach(function(file) {
			console.log("file ", file);
			if (~file.indexOf('.js')) require(__dirname + '/routes/' + file)(request, token, user);
		});
	});
}


execute_test();