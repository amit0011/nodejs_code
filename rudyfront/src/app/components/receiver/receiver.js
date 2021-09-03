angular.module('myApp.receiver', [])
    .controller('receiverCtrl', function($scope, sudAdminHttpService, $state, $stateParams, spinnerService, $rootScope) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.receiver || !data.setting.receiver.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });



        $scope.active = {
            page: 'receiver'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;



        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initReceiver = function(pageNo) {
            spinnerService.show("html5spinner");
            sudAdminHttpService.getreceiver(pageNo, $scope.token, 'RECEIVER').then(function(res) {
                if (res.data.status == 200) {
                    $scope.gradeList = res.data.data;
                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initReceiver(page);
        };


        $scope.save = function(type) {
            var data = {
                fullName: $scope.myForm.fullName,
                userName: $scope.myForm.fullName,
                mobileNumber: '8989898989',
                email: 'receiver@rudyagro.com',
                type: 'RECEIVER'
            };
            if (type == 'Submit') {
                sudAdminHttpService.addadmin(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initReceiver();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                data._id = $scope.myForm._id;
                sudAdminHttpService.updateadmin(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initReceiver();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };

        $scope.checkUserName = () => {
            sudAdminHttpService.checkUsername($scope.myForm.userName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    if (res.data.data == false) {
                        $scope.showCheck = 'show';
                    } else {
                        $scope.showCheck = 'hide';
                        swal("Error", 'User name already taken.', "error");
                    }
                } else {
                    swal("Error", res.data.userMessage, "error");
                }
            });
        };
        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.gradeList.length; i++) {
                    item = $scope.gradeList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.gradeList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.gradeList.length; i++) {
                    item = $scope.gradeList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.gradeList[i]._id);
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
                swal("Here's a message!", 'Select atleast one receiver.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this receiver!",
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
                            sudAdminHttpService.removeReceiver($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initReceiver();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your receiver has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your receiver file is safe :)", "error");
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
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });