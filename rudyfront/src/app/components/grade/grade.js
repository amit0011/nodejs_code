angular
    .module('myApp.grade', [])
    .controller('gradeCtrl', function($scope, httpService, $rootScope, $state, $stateParams, spinnerService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.grade || !data.setting.grade.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'grade'
        };
        $scope.myForm = {};
        $scope.search = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.gradeDisplays = {
          "All": "All (Inv + Contract + Call as)",
          "Inventory Grade": "Inventory Grade",
          "Contract Grade": "Contract Grade",
          "Both": "Both (Inv + Contract)",
          "Call as": "Call as",
        };
        $scope.initGrade = function(pageNo) {
            spinnerService.show("html5spinner");
            httpService.getGrade(pageNo, $scope.search.commodityId, $scope.token, $scope.search.gradeSearch).then(function(res) {
                if (res.data.status == 200) {
                    spinnerService.hide("html5spinner");
                    $scope.gradeList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");

            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initGrade(page);
        };


        httpService.getCommodity($scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.commoditys = res.data.data;
            }
        });


        $scope.save = function(type) {
            if (type == 'Submit') {
                httpService.addGrade($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initGrade($scope.page);
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                        $scope.closepop();
                    }
                });
            } else {
                httpService.updateGrade($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initGrade($scope.page);
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
            if (data && data._id) {
                $scope.arr = [data._id];
            }
            var msg = data.status == 0 ? "deActivate" : "activate";
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one grade.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: `Do you want to ${msg} this grade ?`,
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: `Yes, ${msg} it!`,
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            if (data.status == 0) {
                                httpService.removeGrade($scope.data, $scope.token).then(function(res) {
                                        if (res.data.status == 200) {
                                            $scope.initGrade($scope.page);
                                            $scope.arr = [];
                                            $scope.allChecked = true;
                                            swal("Deleted!", "Your grade has been deleted.", "success");
                                        } else {
                                            $scope.allChecked = true;
                                            swal("Deleted!", "Your grade has been deleted.", "success");
                                        }
                                    },
                                    function(error) {
                                        console.log(JSON.stringify(error));
                                    });
                            } else {
                                httpService.activateGrade($scope.data, $scope.token).then(function(res) {
                                        if (res.data.status == 200) {
                                            $scope.initGrade($scope.page);
                                            $scope.arr = [];
                                            $scope.allChecked = true;
                                            swal("Deleted!", "Your grade has been activated.", "success");
                                        } else {
                                            $scope.allChecked = true;
                                            swal("Deleted!", "Your grade has been activated.", "success");
                                        }
                                    },
                                    function(error) {
                                        console.log(JSON.stringify(error));
                                    });
                            }
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
                $scope.myForm.commodityId = $scope.myForm.commodityId._id;

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
                $scope.myForm = angular.copy(data);
                $scope.myForm.commodityId = $scope.myForm.commodityId._id;


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
