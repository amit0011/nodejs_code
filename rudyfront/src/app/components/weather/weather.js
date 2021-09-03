angular.module('myApp.weather', [])
    .controller('weatherCtrl', function($scope, spinnerService, weatherHttpService, imageUrl, $rootScope, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.weather || !data.setting.weather.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'weather'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.weatherPlus = true;
        $scope.weatherInput = false;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initweather = function(pageNo) {
            spinnerService.show("html5spinner");
            weatherHttpService.getweather(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    spinnerService.hide("html5spinner");
                    $scope.weatherList = res.data.data.docs;
                    if (res.data.data.docs != 0) {
                        $scope.weatherMap = imageUrl + res.data.data.docs[0].weatherMap;
                        $scope.plantJpeg = imageUrl + res.data.data.docs[0].plantJpeg;
                    }
                } else {
                    spinnerService.hide("html5spinner");
                }
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initweather(page);
        };
        $scope.uploadMap = function(input) {
            var file = input.files[0];
            var data = {
                'avatar': file
            };
            if (data) {
                spinnerService.show("html5spinner");
                weatherHttpService.uploadweather(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        spinnerService.hide("html5spinner");
                        $scope.myForm.weatherMap = res.data.data;
                    } else {
                        spinnerService.hide("html5spinner");
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                console.log('select file');
            }
        };
        $scope.uploadImage = function(input) {
            var file = input.files[0];
            var data = {
                'avatar': file
            };
            if (data) {
                spinnerService.show("html5spinner");
                weatherHttpService.uploadweather(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        spinnerService.hide("html5spinner");
                        $scope.myForm.plantJpeg = res.data.data;
                    } else {
                        spinnerService.hide("html5spinner");
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                console.log('select file');
            }
        };
        $scope.plusweather = function(type) {
            if (type == 'close') {
                $scope.weatherPlus = true;
                $scope.weatherInput = false;
            } else {
                $scope.weatherPlus = false;
                $scope.weatherInput = true;
            }
        };
        $scope.save = function(type) {
            console.log(type);
            if (type == 'Submit') {
                weatherHttpService.addweather($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initweather(pageNo);
                        $scope.closepop();
                        $scope.weatherPlus = false;
                        $scope.weatherInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                weatherHttpService.updateweather($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initweather(pageNo);
                        $scope.closepop();
                        $scope.weatherPlus = false;
                        $scope.weatherInput = true;
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
                for (i = 0; i < $scope.weatherList.length; i++) {
                    item = $scope.weatherList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.weatherList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.weatherList.length; i++) {
                    item = $scope.weatherList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.weatherList[i]._id);
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
            weatherHttpService.searchweather(pageNo, $scope.cityName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.weatherList = res.data.data.docs;
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
                swal("Here's a message!", 'Select atleast one weather.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this weather!",
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
                            weatherHttpService.removeweather($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initweather(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your weather has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your weather file is safe :)", "error");
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
                $scope.weatherMap = imageUrl + $scope.myForm.weatherMap;
                $scope.plantJpeg = imageUrl + $scope.myForm.plantJpeg;

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