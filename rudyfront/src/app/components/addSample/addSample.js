angular.module('myApp.addSample', [])
	.controller('addSampleCtrl', function($scope, $state, httpService) {
		$scope.active = {
			page: 'sample'
		};
		$scope.myForm = {};
		$scope.token = JSON.parse(localStorage.getItem('token'));
		$scope.userType = JSON.parse(localStorage.getItem('userType'));
		httpService.getCommodity($scope.token).then(function(res) {
				if (res.data.status == 200) {
					$scope.commoditys = res.data.data;
					// console.log('commdity', JSON.stringify($scope.commodity));
				} else {
					console.log('err', JSON.stringify(res.data));
				}
			},
			function(error) {
				console.log(JSON.stringify(error));
			});

		$scope.getGrade = function(id) {
			$scope.commodityGrades = $scope.commoditys.filter(function(hero) {
				return hero._id == id;
			});
			$scope.grades = $scope.commodityGrades[0].commodityGrade;
		};
	});