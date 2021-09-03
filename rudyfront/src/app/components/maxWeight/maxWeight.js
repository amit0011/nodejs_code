angular.module('myApp.maxWeight', [])
    .controller('maxWeightCtrl', function($scope, $rootScope, spinnerService, maxWeightHttpService, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.eDC || !data.setting.eDC.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'maxWeight'
        };

        $scope.search = {};
        $scope.myForm = {
          name: '',
          weights: []
        };

        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initMaxWeight = function(pageNo, searchBy) {
            spinnerService.show("html5spinner");
            maxWeightHttpService.getMaxWeight(pageNo, searchBy, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    $scope.maxWeightList = res.data.data.docs;
                }
                spinnerService.hide("html5spinner");
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initMaxWeight(page);
        };

        $scope.save = function(type) {
            var data = {
                name: $scope.myForm.name,
                weights: $scope.myForm.weights
            };
            if (type == 'Submit') {
                maxWeightHttpService.addMaxWeight(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.closepop();
                        $scope.initMaxWeight();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                maxWeightHttpService.updateMaxWeight($scope.myForm._id, data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initMaxWeight();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };


        $scope.delete = function(id) {

            $scope.data = {
                idsArray: $scope.arr
            };
            swal({
                    title: "Are you sure?",
                    text: "Your will not be able to recover this Max Weight!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No, cancel!",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        maxWeightHttpService.updateMaxWeight(id, {
                            status: 1
                        }, $scope.token).then(function(res) {
                            if (res.data.status == 200) {
                                swal("Deleted!", "Max Weight has been deleted.", "success");
                                $scope.closepop();
                                $scope.initMaxWeight(pageNo);
                            }
                        });
                    } else {
                        swal("Cancelled", "Your Max Weight file is safe :)", "error");
                    }
                });

        };

        $scope.openPop = function(type, data) {
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            } else {
                $scope.inputField = type;
                $scope.myForm = {
                  name: '',
                  weights: []
                };
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };
        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
        };
        $(".popup_overlay , .close").click(function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
        });
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });
