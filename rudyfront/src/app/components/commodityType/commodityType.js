angular.module('myApp.commodityType', [])
    .controller('commodityTypeCtrl', function($scope, httpService, $rootScope, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.commodityType || !data.setting.commodityType.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'commodityType'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.btn = true;
        var i, item;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.totalDamageOptions = [
            {text: 'Yes', value: true},
            {text: 'No', value: false}
        ];

        $scope.init = function() {
            httpService.getCommodityType($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.commodityList = res.data.data;
                    $scope.allChecked = true;
                }
            });
        };

        $scope.save = function() {
            httpService.addCommodityType($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.init();
                    $scope.closepop();
                    $('#commodity_type').trigger('reset');
                } else {
                    swal("Here's a message!", res.data.userMessage, "error");
                }
            });
        };

        $scope.saveChanges = function() {
            httpService.updateCommodityType($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.init();
                    $scope.closepop();
                } else {
                    swal("Here's a message!", res.data.userMessage, "error");
                }
            });
        };


        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.commodityList.length; i++) {
                    item = $scope.commodityList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.commodityList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.commodityList.length; i++) {
                    item = $scope.commodityList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.commodityList[i]._id);
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
                swal("Here's a message!", 'Select atleast one commodity type.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this commodity type!",
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
                            httpService.removeCommodityType($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.init();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your commodity type has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your commodity type is safe :)", "error");
                        }
                    });
            }
        };

        $scope.openPop = function(data, type) {
            $scope.byProducts = $scope.commodityList.filter(function(ct) {
                return ct.parentTypeId;
            });
            $scope.byProducts.forEach(function(byProduct) {
                byProduct.selected = undefined;
            });

            if (data) {
                $scope.myForm = _.clone(data);

                var dummyCall = data.byProducts && data.byProducts.length && $scope.byProducts.forEach(function(byProduct) {
                    byProduct.selected = data.byProducts.includes(byProduct._id);
                });
                if ($scope.myForm.parentTypeId) {
                    $scope.myForm.parentTypeId = $scope.myForm.parentTypeId._id;
                }
                if (!$scope.myForm.byProducts) {
                    $scope.myForm.byProducts = [];
                }
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.btn = true;
            } else {
                $scope.myForm = {byProducts: []};
                $scope.btn = false;
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };

        $scope.manageByProduct = function (byProduct) {
            if (byProduct.selected) {
                $scope.myForm.byProducts.push(byProduct._id);
            } else {
                $scope.myForm.byProducts = $scope.myForm.byProducts.filter(function(bp) {
                    return bp != byProduct._id;
                });
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