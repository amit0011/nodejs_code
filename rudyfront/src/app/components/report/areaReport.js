angular
    .module('myApp.areaReport', [])
    .controller('areaReportCtrl',
        function(
            $scope,
            $rootScope,
            reportHttpServices,
            spinnerService,
            $timeout,
            apiUrl,
            $state
        ) {

            $scope.active = {
                page: 'area'
            };

            $scope.$on('access', (event, data) => {
                if (!data || !data.reports || !data.reports.area || !data.reports.area.view) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.page = 1;
            $scope.myForm = {};

            $scope.clear = () => {
                $scope.page = 1;
                $scope.myForm = {};
                $scope.inItList($scope.page);
            };

            $scope.search = (valid) => {
                $scope.submitted = true;
                if (valid) {
                    $scope.inItList(1);
                }

            };

            $scope.inItList = (page) => {
                $scope.myForm.page = page;
                spinnerService.show("html5spinner");
                reportHttpServices
                    .areaReport($scope.myForm, $scope.token)
                    .then(function(res) {
                            if (res.data.status == 200) {
                                $scope.growerList = res.data.data.docs;
                                $scope.page = res.data.data.page;
                                $scope.totalPages = res.data.data.total;
                            }
                            spinnerService.hide("html5spinner");
                        },
                        function(error) {
                            spinnerService.hide("html5spinner");
                        });
            };

            $scope.inItList($scope.page);


            $scope.exportToXl = (valid) => {
                if (valid) {
                    var obj = {
                        'fileName': 'area_report.xlsx',
                        'start': $scope.myForm.start,
                        'end': $scope.myForm.end

                    };
                    $scope.exporting = true;
                    var request = new XMLHttpRequest();
                    request.open("POST", apiUrl + 'grower/exportAreaReport', true);
                    request.responseType = "blob";
                    request.setRequestHeader("Content-type", "application/json");
                    request.onload = function(e) {
                        if (this.status === 200) {
                            var file = window.URL.createObjectURL(this.response);
                            var a = document.createElement("a");
                            a.href = file;
                            a.download = obj.fileName;
                            document.body.appendChild(a);
                            a.click();
                            $scope.$apply(function() {
                                $scope.exporting = false;
                            });

                        }
                    };
                    request.send(JSON.stringify(obj));
                }
            };
        });