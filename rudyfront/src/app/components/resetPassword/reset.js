angular.module('myApp.resetPassword', [])
	.controller('resetPasswordCtrl', function($scope, $state, httpService, $location) {
		$scope.myForm = {};
		$scope.submit = function() {
			$scope.myForm.resetToken = $location.search().resetToken;
			httpService.resetPassword($scope.myForm).then(function(res) {
					if (res.data.status == 200) {
						swal("Message", res.data.userMessage, "success");
						$state.go('login');
					} else {
						$scope.errormsg = res.data.userMessage;
						console.log('err', JSON.stringify(res.data.userMessage));
					}
				},
				function(error) {
					if (error.status == -1) {
						console.log('error', JSON.stringify(error));
					}
				});
		};
	});