angular.module('myApp.scaleTicketNumber', [])
    .controller('scaleTicketNumberCtrl', function($scope, spinnerService, scaleTicketNumberHttpService, $state, $rootScope) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.scaleTicketNumber || !data.setting.scaleTicketNumber.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'scaleTicketNumber'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initscaleTicketNumber = function(pageNo) {
            spinnerService.show("html5spinner");
            scaleTicketNumberHttpService.getscaleTicketNumber($scope.token).then(function(res) {
                $scope.scaleTicketNumberList = res.data.status == 200 ? res.data.data : [];
                spinnerService.hide("html5spinner");
            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initscaleTicketNumber(page);
        };
        $scope.save = function(type) {
            scaleTicketNumberHttpService
                .addscaleTicketNumber($scope.myForm, $scope.token)
                .then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initscaleTicketNumber();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });

        };

        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one scale ticket number.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this scale ticket number!",
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
                            scaleTicketNumberHttpService.removescaleTicketNumber($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initscaleTicketNumber();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your scale ticket number has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your scale ticket number file is safe :)", "error");
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