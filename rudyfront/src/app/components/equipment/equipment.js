angular.module('myApp.equipment', [])
    .controller('equipmentCtrl', function($scope, equipmentHttpService, $rootScope, $state, $stateParams, spinnerService, loadingPortHttpService) {
        $scope.active = {
            page: 'equipment'
        };

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.equipment || !data.setting.equipment.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        loadingPortHttpService.getLoadingPort('', $scope.token).then(function(res) {
            $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
            spinnerService.hide("html5spinner");
        });

        $scope.initEquipment = function(pageNo) {
            spinnerService.show("html5spinner");
            equipmentHttpService.getEquipment(pageNo, $scope.token, '').then(function(res) {
                if (res.data.status == 200) {
                    $scope.equipmentList = res.data.data.docs;
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
                equipmentHttpService.addEquipment($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEquipment(pageNo);
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                equipmentHttpService.updateEquipment($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initEquipment(pageNo);
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
                for (i = 0; i < $scope.equipmentList.length; i++) {
                    item = $scope.equipmentList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.equipmentList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.equipmentList.length; i++) {
                    item = $scope.equipmentList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.equipmentList[i]._id);
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

        $scope.searchEquipment = () => {
            equipmentHttpService.searchEquipment(pageNo, $scope.equipmentName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.equipmentList = res.data.data.docs;
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
                swal("Here's a message!", 'Select atleast one equipment.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this equipment!",
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
                            equipmentHttpService.removeEquipment($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initEquipment(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your equipment has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your equipment file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.openPop = function(type, data) {
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                if (data.loadingPortId) {
                    $scope.myForm.loadingPortId = data.loadingPortId._id;
                }
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
                if (data.loadingPortId) {
                    $scope.myForm.loadingPortId = data.loadingPortId._id;
                }
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