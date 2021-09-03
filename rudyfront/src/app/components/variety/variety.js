angular.module('myApp.variety', [])
    .controller('varietyCtrl', function($scope, httpService, $rootScope, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.variety || !data.setting.variety.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'variety'
        };
        $scope.myForm = {};
        $scope.btn = true;
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.init = function() {
            httpService.getVariety($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.varietyList = res.data.data;
                }
            });
        };

        $scope.save = function() {
            if (!$scope.myForm.varietyName) {
                swal("Here's a message!", 'Please fill Variety Name first.', "error");
            } else {
                var data = {
                    'varietyName': $scope.myForm.varietyName
                };
                httpService.addVariety(data, $scope.token).then(function(res) {
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
            httpService.editVariety($scope.myForm, $scope.token).then(function(res) {
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
                for (i = 0; i < $scope.varietyList.length; i++) {
                    item = $scope.varietyList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.varietyList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.varietyList.length; i++) {
                    item = $scope.varietyList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.varietyList[i]._id);
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
                swal("Here's a message!", 'Select atleast one variety.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this variety!",
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
                            httpService.removeVariety($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.init();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your variety has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your variety file is safe :)", "error");
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