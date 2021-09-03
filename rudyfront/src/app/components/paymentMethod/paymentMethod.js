angular.module('myApp.paymentMethod', [])
    .controller('paymentMethodCtrl', function($scope, spinnerService, $rootScope, paymentMethodHttpService, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.paymentMethod || !data.setting.paymentMethod.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });


        $scope.active = {
            page: 'paymentMethod'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.initpaymentMethod = function(pageNo) {
            spinnerService.show("html5spinner");
            paymentMethodHttpService.getpaymentMethod($scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        spinnerService.hide("html5spinner");
                        $scope.paymentMethodList = res.data.data;
                    } else {
                        spinnerService.hide("html5spinner");
                    }
                },
                function(error) {
                    console.log(JSON.stringify(error));
                });
        };
        $scope.initpaymentMethod();
        $scope.save = function(type) {
            if (type == 'Submit') {
                paymentMethodHttpService.addpaymentMethod($scope.myForm, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initpaymentMethod();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            } else {
                paymentMethodHttpService.updatepaymentMethod($scope.myForm, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initpaymentMethod();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            }

        };
        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one payment Method.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this payment Method!",
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
                            paymentMethodHttpService.removepaymentMethod($scope.data, $scope.token).then(function(res) {
                                    if (res.data.status == 200) {
                                        $scope.initpaymentMethod();
                                        $scope.arr = [];
                                        $scope.allChecked = true;
                                        swal("Deleted!", "Your payment Method has been deleted.", "success");
                                    }
                                },
                                function(error) {
                                    console.log(JSON.stringify(error));
                                });
                        } else {
                            swal("Cancelled", "Your payment Method file is safe :)", "error");
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