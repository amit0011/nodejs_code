angular.module('myApp.bidPeriod', [])
    .controller('bidPeriodCtrl', function($scope, bidPeriodHttpService, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.bidPeriod || !data.setting.bidPeriod.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'bidPeriod'
        };
        $scope.myForm = {};
        $scope.btn = true;
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.init = function() {
            bidPeriodHttpService.getbidPeriod($scope.token).then(function(res) {
                $scope.bidPeriodList = res.data.status == 200 ? res.data.data : [];
            });
        };

        $scope.save = function() {
            if (!$scope.myForm.bidPeriodName) {
                swal("Here's a message!", 'Please fill bidPeriod Name first.', "error");
            } else {
                var data = {
                    'bidPeriodName': $scope.myForm.bidPeriodName
                };
                bidPeriodHttpService.addbidPeriod(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.init();
                        $scope.closepop();
                        $scope.myForm = {};
                    } else {
                        swal("Here's a message!", res.data.userMessage, "error");
                    }
                });
            }
        };

        $scope.saveChanges = function() {
            bidPeriodHttpService.editbidPeriod($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.init();
                    $scope.closepop();
                } else {
                    swal("Here's a message!", res.data.userMessage, "error");
                }
            });
        };
        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.bidPeriodList.length; i++) {
                    item = $scope.bidPeriodList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.bidPeriodList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.bidPeriodList.length; i++) {
                    item = $scope.bidPeriodList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.bidPeriodList[i]._id);
                    $scope.allChecked = true;
                }
            }
        };
        $scope.checkBox = function(id) {
            if ($scope.arr.indexOf(id) > -1) {
                $scope.arr.splice(id, 1);
            } else {
                $scope.arr.push(id);
            }
        };

        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one bidPeriod.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this bidPeriod!",
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
                            bidPeriodHttpService.removebidPeriod($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.init();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your bidPeriod has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your bidPeriod file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.toggleAll = function() {
            var toggleStatus = !$scope.isAllSelected;
            angular.forEach($scope.options, function(itm) {
                itm.selected = toggleStatus;
            });
        };

        $scope.openPop = function(data, type) {
            if (data) {
                $scope.myForm = _.clone(data);
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.btn = true;
            } else {
                $scope.myForm = {};
                $scope.btn = false;
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