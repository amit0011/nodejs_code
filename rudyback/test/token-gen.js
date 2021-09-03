var common = require('./common');
var expect = common.expect;
var request = common.request;
var should = common.should;
var chai = common.chai;
var token = null;
var now = (new Date()).getTime();
var email = now + '@connects4u.com';
var password = 'test1234';
var timeout = common.timeout;

module.exports = function(cb) {

	describe('signup testing', function() {

		it('should create a new user account', function(done) {
			this.timeout(timeout);
			request
				.post('/api/signup')
				.send({
					email: email,
					password: password,
					pushToken: new Date(),
					deviceId: new Date(),
					platform: "ios"
				})
				.end(function(err, res) {
					console.log(res.body);
					res.body.data.should.have.property('authToken');
					token = res.body.data.authToken;
					res.should.have.status(200);
					res.should.be.json;
					expect(res.body.error).to.equal(false);
					done();
					cb(token, res.body.data);
				});
		});
	});
}