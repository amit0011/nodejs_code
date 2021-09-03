angular.module('myApp.variance', [])
    .controller('varianceCtrl', function($scope, spinnerService, $rootScope, varianceHttpService, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.variance || !data.setting.variance.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'variance'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initvariance = function(pageNo) {
            spinnerService.show("html5spinner");
            varianceHttpService.getvariance($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.varianceList = res.data.data;
                }
                spinnerService.hide("html5spinner");
            });
        };
        $scope.initvariance();

        $scope.save = function(type) {
            if (type == 'Submit') {
                varianceHttpService.addvariance($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initvariance();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                varianceHttpService.updatevariance($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initvariance();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };
        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one variance.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this variance!",
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
                            varianceHttpService.removevariance($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initvariance();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your variance has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your variance file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.openPop = function(type, data) {
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            } else if (type == 'add') {
                $scope.myForm = {};
                $scope.inputField = type;
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            } else {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
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