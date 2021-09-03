angular.module('myApp.currency', [])
    .controller('currencyCtrl', function($scope, $rootScope, spinnerService, currencyHttpService, $state, freightHttpServices, freightSettingHttpService, pricingHttpServices) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.currency || !data.setting.currency.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'currency'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.currencyPlus = true;
        $scope.currencyInput = false;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));


        freightHttpServices.getLoadingPort($scope.token).then(function(res) {
            $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
        });

        freightSettingHttpService.getfreightSetting('', $scope.token).then(function(res) {
            $scope.freightSettingList = res.data.status == 200 ? res.data.data : [];
        });


        $scope.initcurrency = function(pageNo) {
            spinnerService.show("html5spinner");
            currencyHttpService.getcurrency($scope.token).then(function(res) {
                $scope.currencyList = res.data.status == 200 ? res.data.data : [];
                spinnerService.hide("html5spinner");
            });

            currencyHttpService.getCurrencyHistory(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.currencyHistoryList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initcurrency(page);
        };

        $scope.pluscurrency = function(type) {
            if (type == 'close') {
                $scope.currencyPlus = true;
                $scope.currencyInput = false;
            } else {
                $scope.currencyPlus = false;
                $scope.currencyInput = true;
            }
        };
        $scope.changethumbnail = function(input) {
            var file = input.files[0];
            $scope.myForm.filePath = file;
            var data = {
                'filePath': $scope.myForm.filePath
            };
            if (data) {
                spinnerService.show("html5spinner");
                currencyHttpService.uploadcurrency(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initcurrency(pageNo);
                        spinnerService.hide("html5spinner");
                    } else {
                        spinnerService.hide("html5spinner");
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                console.log('select file');
            }
        };


        pricingHttpServices.getCommodityPricing('', $scope.token).then(function(res) {
            $scope.priceList = res.data.status == 200 ? res.data.data : [];
            spinnerService.hide("html5spinner");
        });

        $scope.save = function(type) {
            if (type == 'Submit') {
                currencyHttpService.addcurrency($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initcurrency();
                        $scope.closepop();
                        $scope.currencyPlus = false;
                        $scope.currencyInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                var updated_obj = {
                    currencyCADUSD: $scope.myForm.currencyCADUSD,
                    currencyUpdate: $scope.myForm.currencyUpdate,
                    exchangeDeduction: $scope.myForm.exchangeDeduction,
                    _id: $scope.myForm._id
                };
                currencyHttpService.updatecurrency(updated_obj, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.exChangeRate = res.data.currencyCADUSD;
                        $scope.initcurrency();
                        $scope.closepop();
                        $scope.currencyPlus = false;
                        $scope.currencyInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };

        $scope.updateCommodityPricing = (data) => {
            $scope.myForm = data;
            $scope.myForm._id = data._id;
            $scope.myForm.commodityId = data.commodityId._id;
            $scope.myForm.gradeId = data.gradeId._id;
            $scope.myForm.price = Number(data.price);
            $scope.myForm.exchangeRate = $scope.exChangeRate;
            if (data.unit == "CWT") {
                $scope.myForm.cdnCwt = Number(data.price);
            } else {
                $scope.myForm.cdnCwt = ((Number(data.price) / 60) * 100);
            }
            pricingHttpServices.updateCommodityPricing($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {} else {
                    swal("ERROR", res.data.userMessage, "error");
                }
            });
        };

        $scope.freightUpdate = (data) => {
            $scope.myForm = data;
            if ($scope.myForm.currencyType == 'CAD') {
                $scope.myForm.freightWithBlFee = {
                    bagToBag: ((Number($scope.myForm.oceanFreight.bagToBag) + Number($scope.myForm.oceanFreight.bagToBag == 0 ? 0 : $scope.myForm.blFee)) / $scope.exChangeRate),
                    bulkToBulk: ((Number($scope.myForm.oceanFreight.bulkToBulk) + Number($scope.myForm.oceanFreight.bulkToBulk == 0 ? 0 : $scope.myForm.blFee)) / $scope.exChangeRate),
                    bulkToBag: ((Number($scope.myForm.oceanFreight.bulkToBag) + Number($scope.myForm.oceanFreight.bulkToBag == 0 ? 0 : $scope.myForm.blFee)) / $scope.exChangeRate)
                };
                $scope.myForm.freightCWT = {
                    bagToBag: Number($scope.myForm.freightWithBlFee.bagToBag) / $scope.myForm.unit,
                    bulkToBulk: Number($scope.myForm.freightWithBlFee.bulkToBulk) / $scope.myForm.unit,
                    bulkToBag: Number($scope.myForm.freightWithBlFee.bulkToBag) / $scope.myForm.unit
                };
                $scope.myForm.freightMT = {
                    bagToBag: Number($scope.myForm.freightCWT.bagToBag) * 22.046,
                    bulkToBulk: Number($scope.myForm.freightCWT.bulkToBulk) * 22.046,
                    bulkToBag: Number($scope.myForm.freightCWT.bulkToBag) * 22.046
                };
            } else {
                $scope.myForm.freightWithBlFee = {
                    bagToBag: (Number($scope.myForm.oceanFreight.bagToBag) + Number($scope.myForm.oceanFreight.bagToBag == 0 ? 0 : $scope.myForm.blFee)),
                    bulkToBulk: (Number($scope.myForm.oceanFreight.bulkToBulk) + Number($scope.myForm.oceanFreight.bulkToBulk == 0 ? 0 : $scope.myForm.blFee)),
                    bulkToBag: (Number($scope.myForm.oceanFreight.bulkToBag) + Number($scope.myForm.oceanFreight.bulkToBag == 0 ? 0 : $scope.myForm.blFee))
                };
                $scope.myForm.freightCWT = {
                    bagToBag: Number($scope.myForm.freightWithBlFee.bagToBag) / $scope.myForm.unit,
                    bulkToBulk: Number($scope.myForm.freightWithBlFee.bulkToBulk) / $scope.myForm.unit,
                    bulkToBag: Number($scope.myForm.freightWithBlFee.bulkToBag) / $scope.myForm.unit
                };
                $scope.myForm.freightMT = {
                    bagToBag: Number($scope.myForm.freightCWT.bagToBag) * 22.046,
                    bulkToBulk: Number($scope.myForm.freightCWT.bulkToBulk) * 22.046,
                    bulkToBag: Number($scope.myForm.freightCWT.bulkToBag) * 22.046
                };
            }
            $scope.loadingPortList.forEach((val) => {
                if (val._id == $scope.myForm.loadingPortId) {
                    $scope.loadingPortName = val.loadingPortName;
                }
            });
            if ($scope.loadingPortName == 'Montreal') {
                $scope.bagToBag = Number($scope.myForm.freightMT.bagToBag) + Number($scope.freightSettingList[0].intermodalMTLUSD);
                $scope.bulkToBulk = Number($scope.myForm.freightMT.bulkToBulk) + Number($scope.freightSettingList[0].intermodalMTLUSD);
                $scope.bulkToBag = Number($scope.myForm.freightMT.bulkToBag) + Number($scope.freightSettingList[0].intermodalMTLUSD);
            } else if ($scope.loadingPortName == 'Vancouver') {
                $scope.bagToBag = Number($scope.myForm.freightMT.bagToBag) + Number($scope.freightSettingList[0].intermodalVCRUSD);
                $scope.bulkToBulk = Number($scope.myForm.freightMT.bulkToBulk) + Number($scope.freightSettingList[0].intermodalVCRUSD);
                $scope.bulkToBag = Number($scope.myForm.freightMT.bulkToBag) + Number($scope.freightSettingList[0].intermodalVCRUSD);
            } else {
                $scope.bagToBag = 0;
                $scope.bulkToBulk = 0;
                $scope.bulkToBag = 0;
            }
            $scope.myForm.freightUSDMTFOB = {
                bagToBag: $scope.bagToBag,
                bulkToBulk: $scope.bulkToBulk,
                bulkToBag: $scope.bulkToBag
            };
            $scope.myForm.validity = moment($scope.myForm.validity);

            if ($scope.myForm._id) {
                freightHttpServices.updateFreight($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {}
                });
            }
        };

        $scope.selected = {};

        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.currencyList.length; i++) {
                    item = $scope.currencyList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.currencyList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.currencyList.length; i++) {
                    item = $scope.currencyList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.currencyList[i]._id);
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
            spinnerService.show("html5spinner");
            currencyHttpService.searchcurrency(pageNo, $scope.cityName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.currencyList = res.data.data.docs;
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
                swal("Here's a message!", 'Select atleast one currency.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this currency!",
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
                            currencyHttpService.removecurrency($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initcurrency(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your currency has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your currency file is safe :)", "error");
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