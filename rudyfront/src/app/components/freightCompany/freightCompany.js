angular.module('myApp.freightCompany', [])
    .controller('freightCompanyCtrl', function($scope, $rootScope, freightCompanyHttpServices, $state, countryHttpService, spinnerService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.freightCompany || !data.setting.freightCompany.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'freightCompany'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.userType = JSON.parse(localStorage.getItem('userType'));

        $scope.initEquipment = function(pageNo) {
            spinnerService.show("html5spinner");
            freightCompanyHttpServices.getFreightCompany(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.freightCompanyList = res.data.data.docs;
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
                freightCompanyHttpServices.addFreightCompany($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEquipment();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                freightCompanyHttpServices.updateFreightCompany($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEquipment();
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };

        countryHttpService.getCountryList($scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.countryList = res.data.data;
            }
            spinnerService.hide("html5spinner");
        });

        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.freightCompanyList.length; i++) {
                    item = $scope.freightCompanyList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.freightCompanyList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.freightCompanyList.length; i++) {
                    item = $scope.freightCompanyList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.freightCompanyList[i]._id);
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
                swal("Here's a message!", 'Select atleast one Freight Company.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this Freight Company!",
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
                            freightCompanyHttpServices.removeFreightCompany($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initEquipment();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your Freight Company has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your Freight Company name is safe :)", "error");
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