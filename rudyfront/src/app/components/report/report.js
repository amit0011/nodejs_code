angular.module('myApp.report', [])
    .controller('reportCtrl', function($scope, httpService, countryHttpService, $state, $rootScope, spinnerService, reportHttpServices, $timeout) {
        $scope.active = {
            page: 'report'
        };

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.report || !data.setting.report.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.myForm = {};
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.initReport = () => {
            httpService.getReport('', id, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.grades = res.data.data;
                    }
                },
                function(error) {
                    //console.log(JSON.stringify(error));
                });
        };
        httpService.getCommodity($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.commoditys = res.data.data;
                }
            },
            function(error) {
                // console.log(JSON.stringify(error));
            });
        $scope.getGrade = function(id) {
            httpService.getGrade('', id, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.grades = res.data.data;
                    }
                },
                function(error) {
                    //console.log(JSON.stringify(error));
                });
            $timeout(function() {
                $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                    return hero._id == id;
                });
            }, 1000);

        };

    });