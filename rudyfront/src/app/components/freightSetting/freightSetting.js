angular.module('myApp.freightSetting', [])
    .controller('freightSettingCtrl', function($scope, $rootScope, spinnerService, freightSettingHttpService, currencyHttpService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.freightSettings || !data.setting.freightSettings.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'freightSetting'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.freightSettingPlus = true;
        $scope.freightSettingInput = false;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initfreightSetting = function(pageNo) {
            spinnerService.show("html5spinner");
            freightSettingHttpService.getfreightSetting(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.freightSettingList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initfreightSetting(page);
        };
        $scope.plusfreightSetting = function(type) {
            if (type == 'close') {
                $scope.freightSettingPlus = true;
                $scope.freightSettingInput = false;
            } else {
                $scope.freightSettingPlus = false;
                $scope.freightSettingInput = true;
            }
        };

        currencyHttpService.getcurrency($scope.token).then(function(res) {
            $scope.currency = res.data.status == 200 ? res.data.data[0].currencyCADUSD : 1.3075;
        });

        $scope.initFreightNote = function() {
            freightSettingHttpService
                .getFreightNote($scope.token)
                .then(function(res) {
                    if (res.data.status == 200) {
                        $scope.freightNoteList = res.data.data.reverse();
                        for (i = 0; i < $scope.freightNoteList.length; i++) {
                            if ($scope.freightNoteList[i].createdBy) {
                                $scope.freightNoteList[i].fullName =
                                    $scope.freightNoteList[i].createdBy.fullName;
                            } else {
                                $scope.freightNoteList[i].fullName =
                                    $scope.freightNoteList[i].userName;
                            }
                        }
                    }
                });
        };

        $scope.freightNoteSubmit = function() {
            if (!$scope.noteForm.message) {
                swal("Error", "Please enter value first.", "error");
            } else {
                var data = {
                    message: $scope.noteForm.message
                };
                freightSettingHttpService.addFreightNote(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initFreightNote();
                        $scope.noteForm = {};
                    }
                });
            }
        };

        $scope.save = function(type) {

            $scope.myForm.intermodalVCRUSD = ($scope.myForm.intermodalVCR * 22.0462) / $scope.currency;
            $scope.myForm.intermodalMTLUSD = ($scope.myForm.intermodalMTL * 22.0462) / $scope.currency;
            if (type == 'Submit') {
                freightSettingHttpService.addfreightSetting($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initfreightSetting();
                        $scope.closepop();
                        $scope.freightSettingPlus = false;
                        $scope.freightSettingInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                freightSettingHttpService.updatefreightSetting($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initfreightSetting();
                        $scope.closepop();
                        $scope.freightSettingPlus = false;
                        $scope.freightSettingInput = true;
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
                for (i = 0; i < $scope.freightSettingList.length; i++) {
                    item = $scope.freightSettingList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.freightSettingList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.freightSettingList.length; i++) {
                    item = $scope.freightSettingList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.freightSettingList[i]._id);
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
            freightSettingHttpService.searchfreightSetting(pageNo, $scope.cityName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.freightSettingList = res.data.data.docs;
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
                swal("Here's a message!", 'Select atleast one freightSetting.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this freightSetting!",
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
                            freightSettingHttpService.removefreightSetting($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initfreightSetting(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your freightSetting has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your freightSetting file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.initFreightNote();

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