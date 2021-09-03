angular.module('myApp.bin', [])
    .controller('binCtrl', function($scope, spinnerService, binHttpService, $state) {


        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.bin || !data.setting.bin.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });


        $scope.active = {
            page: 'bin'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.initbin = function(pageNo) {
            spinnerService.show("html5spinner");
            binHttpService.getbin($scope.token, pageNo).then(function(res) {
                if (res.data.status == 200) {
                    spinnerService.hide("html5spinner");
                    $scope.binList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                } else {
                    spinnerService.hide("html5spinner");
                }
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initbin(page);
        };
        $scope.save = function(type) {
            if (type == 'Submit') {
                binHttpService.addbin($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initbin();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                binHttpService.updatebin($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initbin();
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
                swal("Here's a message!", 'Select atleast one bin.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this bin!",
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
                            binHttpService.removebin($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initbin();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your bin has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your bin file is safe :)", "error");
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