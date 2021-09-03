var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

module.exports = function(request, token, user) {
	console.log("users route");
	describe('users route testing here', function() {
		/*==================================
		***   user login api testing  ***
		====================================*/

		it('should test /api/login', function(done) {

			request
				.post('/api/login')
				.send({
					email: user.email,
					password: user.password,
					pushToken: new Date(),
					deviceId: new Date(),
					platform: "ios"
				})
				.end(function(err, res) {
					res.should.have.status(200);
					res.should.be.json;
					expect(res.body.error).to.equal(false);
					expect(res.body.errors).to.equal(null);
					done();
				})

		});

		/*-----  End of /api/login  ------*/
	});
}