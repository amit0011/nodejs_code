angular.module('myApp.subAdmin', [])
    .controller('subAdminCtrl', function($scope, sudAdminHttpService, $state, $stateParams, spinnerService, $rootScope) {


        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.subAdmin || !data.setting.subAdmin.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'subAdmin'
        };

        $scope.userAccess = $rootScope.loginUserAccess;

        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.initAdmins = function(pageNo) {
            spinnerService.show("html5spinner");
            sudAdminHttpService.getadmin(pageNo, $scope.token).then(function(res) {
                $scope.gradeList = res.data.status == 200 ? res.data.data : [];
                spinnerService.hide("html5spinner");
            });
        };


        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initAdmins(page);
        };


        $scope.changeState = (id) => {
            $state.go('accessRole', {
                id: id
            });
        };


        $scope.signatureImage = function(input) {
            var file = input.files[0];
            var data = {
                'avatar': file
            };
            if (data) {
                sudAdminHttpService.uploadImage(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.myForm.signature = res.data.data;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                console.log('select file');
            }
        };
        $scope.save = function(type) {
            if (type == 'Submit') {
                sudAdminHttpService.addadmin($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initAdmins();
                        $state.go('subAdmin');
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                sudAdminHttpService.updateadmin($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initAdmins();
                        $scope.data = res.data.data;
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

        $scope.delete = function(data) {
            if (data._id) {
                $scope.id = data._id;
            }
            if (!$scope.id) {
                swal("Here's a message!", 'Select atleast one sub admin.', "error");
            } else {
                $scope.data = {
                    id: $scope.id,
                    status: data.status == 0 ? 1 : 0
                };
                swal({
                        title: "Are you sure ?",
                        text: `Your want to ${data.status == 0?'deactivate':'activate'} this sub admin!`,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: `Yes, ${data.status == 0?'deActivate':'activate'} it!`,
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            sudAdminHttpService.removeadmin($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initAdmins();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your grade has been deleted.", "success");
                                } else {
                                    console.log('err', JSON.stringify(res.data));
                                }
                            });
                        } else {
                            swal("Cancelled", "Your grade file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.openPop = function(type, data) {
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = angular.copy(data);
                $scope.data = data;
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
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });