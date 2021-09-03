angular.module('myApp.login', [])
    .controller('loginCtrl', function($scope, $state, httpService, $rootScope, spinnerService) {
        spinnerService.hide("html5spinner");
        $scope.myForm = {};
        $scope.login = function() {
            $scope.loginRequest = true;
            httpService.login($scope.myForm).then(function(res) {
                    if (res.data.status == 200) {
                        localStorage.setItem('loginUserInfo', JSON.stringify(res.data.data));
                        localStorage.setItem('token', JSON.stringify(res.data.data.authToken));
                        $state.go('dashboard');
                        $rootScope.isLogin = true;
                    } else {
                        $scope.errormsg = res.data.userMessage;
                    }
                    $scope.loginRequest = false;
                },
                function(error) {
                    $scope.loginRequest = false;
                    if (error.status == -1) {
                        $scope.errormsg = 'Server not respond. Please after some time.';
                    }
                });
        };
    });