angular.module('myApp.profile', [])
	.controller('profileCtrl', function($scope, $state, profileHttpServices, $location, imageUrl, spinnerService) {
		$scope.myForm = {};
		$scope.active = {
			page: 'profile'
		};
		$scope.token = JSON.parse(localStorage.getItem('token'));
		$scope.imageUrl = imageUrl;
		$scope.initAdmins = () => {
			profileHttpServices.profile($scope.token).then(function(res) {
					if (res.data.status == 200) {
						$scope.userInfo = res.data.data;
					} else {
						// alert(res.data.userMessage);
						swal("Here's a message!", res.data.userMessage, "error");
						console.log('err', JSON.stringify(res.data));
					}
				},
				function(error) {
					if (error.status == -1) {
						swal("Here's a message!", 'Server not responding.', "error");
						// $state.go('login');
						console.log('error', JSON.stringify(error));
					}
				});
		};
		$scope.signatureImage = function(input, type) {
			var file = input.files[0];
			var data = {
				'avatar': file
			};
			if (data) {
				spinnerService.show("html5spinner");
				profileHttpServices.uploadImage(data, $scope.token).then(function(res) {
						if (res.data.status == 200) {
							if (type == 'image') {
								$scope.userInfo.avatar = res.data.data;
								console.log('$scope.myForm.avatar===', JSON.stringify($scope.myForm.signature));
							} else {
								$scope.userInfo.signature = res.data.data;
								console.log('$scope.myForm.signature===', JSON.stringify($scope.myForm.signature));
							}
							spinnerService.hide("html5spinner");
						} else {
							swal("Error", res.data.userMessage, "error");
						}
					},
					function(error) {
						console.log(JSON.stringify(error));
					});
			} else {
				console.log('select file');
			}
		};
		$scope.saveChanges = () => {
			spinnerService.show("html5spinner");
			profileHttpServices.updateProfile($scope.userInfo, $scope.token).then(function(res) {
					if (res.data.status == 200) {
						swal("Alert!", res.data.userMessage, "success");
						spinnerService.hide("html5spinner");
						$scope.initAdmins();
					} else {
						swal("Error", res.data.userMessage, "error");
						console.log('err', JSON.stringify(res));
					}
				},
				function(error) {
					console.log(JSON.stringify(error));
				});
		};
		$scope.updatePassword = () => {
			spinnerService.show("html5spinner");
			profileHttpServices.changePassword($scope.myForm, $scope.token).then(function(res) {
					if (res.data.status == 200) {
						swal("Alert!", res.data.userMessage, "success");
						spinnerService.hide("html5spinner");
						$scope.myForm = {};
					} else {
						swal("Error", res.data.userMessage, "error");
						console.log('err', JSON.stringify(res));
					}
				},
				function(error) {
					console.log(JSON.stringify(error));
				});
		};
	});