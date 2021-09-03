angular.module('myApp.edc', [])
    .controller('edcCtrl', function($scope, $rootScope, spinnerService, edcHttpService, $state) {

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
            page: 'edc'
        };

        $scope.search = {};
        $scope.myForm = {};

        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initEdc = function(pageNo, searchBy) {
            spinnerService.show("html5spinner");
            edcHttpService.getEdc(pageNo, searchBy, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    $scope.edcList = res.data.data.docs;
                }
                spinnerService.hide("html5spinner");
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initEdc(page);
        };

        $scope.save = function(type) {
            var data = {
                name: $scope.myForm.name
            };
            if (type == 'Submit') {
                edcHttpService.addEdc(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.closepop();
                        $scope.initEdc();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                edcHttpService.updateEdc($scope.myForm._id, data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEdc();
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
                    text: "Your will not be able to recover this EDC!",
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
                        edcHttpService.updateEdc(id, {
                            status: 1
                        }, $scope.token).then(function(res) {
                            if (res.data.status == 200) {
                                swal("Deleted!", "EDC has been deleted.", "success");
                                $scope.closepop();
                                $scope.initEdc(pageNo);
                            }
                        });
                    } else {
                        swal("Cancelled", "Your bags file is safe :)", "error");
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