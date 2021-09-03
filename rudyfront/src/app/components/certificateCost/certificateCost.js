angular.module('myApp.certificateCost', [])
    .controller('certificateCostCtrl', function($scope, spinnerService, $state, certificateCostHttpService, $rootScope) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.certificateCost || !data.setting.certificateCost.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'certificateCost'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.certificateCostPlus = true;
        $scope.certificateCostInput = false;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initcertificateCost = function(pageNo) {
            spinnerService.show("html5spinner");
            certificateCostHttpService.getcertificateCost(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.certificateCostList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initcertificateCost(page);
        };

        $scope.pluscertificateCost = function(type) {
            if (type == 'close') {
                $scope.certificateCostPlus = true;
                $scope.certificateCostInput = false;
            } else {
                $scope.certificateCostPlus = false;
                $scope.certificateCostInput = true;
            }
        };
        $scope.save = function(type) {
            if (type == 'Submit') {
                certificateCostHttpService.addcertificateCost($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initcertificateCost(pageNo);
                        $scope.closepop();
                        $scope.certificateCostPlus = false;
                        $scope.certificateCostInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                certificateCostHttpService.updatecertificateCost($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initcertificateCost(pageNo);
                        $scope.closepop();
                        $scope.certificateCostPlus = false;
                        $scope.certificateCostInput = true;
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
                for (i = 0; i < $scope.certificateCostList.length; i++) {
                    item = $scope.certificateCostList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.certificateCostList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.certificateCostList.length; i++) {
                    item = $scope.certificateCostList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.certificateCostList[i]._id);
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

        $scope.searchCity = () => {
            certificateCostHttpService.searchcertificateCost(pageNo, $scope.cityName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.certificateCostList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    spinnerService.hide("html5spinner");
                }
            });
        };

        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one certificateCost.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this Certificate cost!",
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
                            certificateCostHttpService.removecertificateCost($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initcertificateCost(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your certificate Cost has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your certificate Cost file is safe :)", "error");
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