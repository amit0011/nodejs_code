angular.module('myApp.analysis', [])
    .controller('analysisCtrl', function($scope, httpService, $rootScope, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.analysisList || !data.setting.analysisList.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'analysis'
        };
        $scope.myForm = {};
        $scope.btn = true;
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initAnalysis = function() {
            httpService.getAnalysis($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.analysisList = res.data.data;
                }
            });
        };

        $scope.save = function() {
            httpService.addAnalysis($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initAnalysis();
                    $scope.closepop();
                    $('#analysisFrom').trigger('reset');
                } else {
                    swal("ERROR", res.data.userMessage, "error");
                }
            });
        };

        $scope.saveChanges = function() {
            httpService.editAnalysis($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initAnalysis();
                    $scope.closepop();
                }
            });
        };

        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one analysis.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this analysis!",
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
                            httpService.removeAnalysis($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initAnalysis();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your analysis has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your analysis file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.analysisList.length; i++) {
                    item = $scope.analysisList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.analysisList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.analysisList.length; i++) {
                    item = $scope.analysisList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.analysisList[i]._id);
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

        $scope.openPop = function(data, type) {
            if (data) {
                $scope.myForm = _.clone(data);
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.btn = true;
            } else {
                $scope.myForm = {};
                $scope.btn = false;
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