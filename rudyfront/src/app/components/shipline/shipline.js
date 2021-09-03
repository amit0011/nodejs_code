angular.module('myApp.shipline', [])
    .controller('shiplineCtrl', function($scope, $rootScope, shiplineHttpServices, $state, $stateParams, spinnerService, freightCompanyHttpServices) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.shippingLine || !data.setting.shippingLine.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'shipline'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.userType = JSON.parse(localStorage.getItem('userType'));

        freightCompanyHttpServices.getFreightCompany('', $scope.token).then(function(res) {
            $scope.freightCompanyList = res.data.status == 200 ? res.data.data : [];
            spinnerService.hide("html5spinner");
        });


        $scope.initEquipment = function(pageNo) {
            spinnerService.show("html5spinner");
            shiplineHttpServices.getshipline(pageNo, '', $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.shiplineList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initEquipment(page);
        };
        $scope.save = function(type) {
            if (type == 'Submit') {
                shiplineHttpServices.addshipline($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEquipment();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                shiplineHttpServices.updateshipline($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEquipment();
                        $scope.closepop();
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
                for (i = 0; i < $scope.shiplineList.length; i++) {
                    item = $scope.shiplineList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.shiplineList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.shiplineList.length; i++) {
                    item = $scope.shiplineList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.shiplineList[i]._id);
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
                swal("Here's a message!", 'Select atleast one shipline.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this shipline!",
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
                            shiplineHttpServices.removeshipline($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initEquipment();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your shipline has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your shipline name is safe :)", "error");
                        }
                    });
            }
        };

        $scope.openPop = function(type, data) {
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = data;
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