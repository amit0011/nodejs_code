angular.module('myApp.origin', [])
    .controller('originCtrl', function($scope, spinnerService, originHttpService, $rootScope, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.origin || !data.setting.origin.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = { page: 'origin' };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.originPlus = true;
        $scope.originInput = false;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initOrigin = function(pageNo) {
            console.log(pageNo);
            spinnerService.show("html5spinner");
            originHttpService.getOrigin(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.originList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");

            });
        };
        $scope.save = function(type) {
            if (type == 'Submit') {
                originHttpService.addOrigin($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initOrigin();
                        $scope.closepop();
                        $scope.originPlus = false;
                        $scope.originInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                originHttpService.updateOrigin($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initOrigin();
                        $scope.closepop();
                        $scope.originPlus = false;
                        $scope.originInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };

        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.originList.length; i++) {
                    item = $scope.originList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.originList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.originList.length; i++) {
                    item = $scope.originList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.originList[i]._id);
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

        $scope.searchOrigin = () => {
            originHttpService.searchOrigin(pageNo, $scope.originName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.originList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    spinnerService.hide("html5spinner");
                }
            });
        };

        $scope.delete = function(id, status) {
            var newStatus = status == 0 ? 1 : 0;
            var msg = status == 0 ? 'Deactivate' : 'Recover';
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one origin.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr,
                    status: newStatus
                };
                swal({
                        title: "Are you sure?",
                        text: "Your want to " + msg + " this origin!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, " + msg + " it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            originHttpService.removeOrigin($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initOrigin(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal(msg + "!", "Your origin has been deactivate.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your origin file is safe :)", "error");
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
                $scope.myForm = data;
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