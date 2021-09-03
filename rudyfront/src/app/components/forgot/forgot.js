angular.module('myApp.forgot', [])
	.controller('forgotCtrl', function($scope, $state, httpService) {
		$scope.myForm = {};
		$scope.send = function() {
			httpService.forgot($scope.myForm).then(function(res) {
					if (res.data.status == 200) {
						swal("Message", res.data.userMessage, "success");
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