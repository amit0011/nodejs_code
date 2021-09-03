angular.module('myApp.commodityPricing', [])
    .controller('commodityPricingCtrl', function($scope, httpService, $rootScope, $state, pricingHttpServices, spinnerService, $timeout, apiUrl, currencyHttpService, commonService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.sales || !data.sales.commodityPricing || !data.sales.commodityPricing.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'commodityPricing'
        };
        $scope.myForm = {};
        $scope.searchForm = {
            date: moment().format('YYYY-MM-DD'),
            reportName: 'CommodityPricingExcel',
            entityName: 'CommodityPricing'
        };
        var pageNo = 1;
        $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $scope.defaultForm = {};
        $scope.editing = false;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.selectedRow = null; // initialize our variable to null
        $scope.setClickedRow = function(index) { //function that sets the value of selectedRow to current index
            $scope.selectedRow = index;
        };
        $scope.cropYears = commonService.cropYears();
        currencyHttpService.getcurrency($scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.currencyList = res.data.data[0].currencyCADUSD;
                $scope.exchangeRate = $scope.currencyList;
                $scope.currencyUpdate = res.data.data[0].currencyUpdate;
            }
        });

        $scope.editAppKey = function(field) {
            $scope.getGrade(field.commodityId._id);
        };

        $scope.cancel = function(index) {
            if ($scope.editing != false) {
                $scope.editing = false;
            }
        };

        $scope.updatePricePer = function(result) {
            if (result.priceAsPer == 'Quantity') {
                result.priceAsPer = 'Quote Only';
                result.quantity = '';
                result.quantityUnit = '';
                result.checked = true;
            } else {
                result.priceAsPer = 'Quantity';
                result.checked = false;
            }
        };

        $scope.applyDefault = function() {
          if (!($scope.defaultForm.shippingPeriodFrom && $scope.defaultForm.shippingPeriodTo)) {
            return swal("ERROR", 'Please both "Shipping Period From" and "Shipping Period To" values.');
          }

          pricingHttpServices.applyDefault($scope.defaultForm, $scope.token).then(function(res) {
            if (res.data.status === 200)
              $scope.initPricing();
          });
        };

        $scope.saveField = function(data) {
            if (data.priceAsPer == 'Quantity' && !data.quantity) {
                swal("ERROR", 'Please fill quantity', "error");
            } else if (data.priceAsPer == 'Quantity' && !data.quantityUnit) {
                swal("ERROR", 'Please fill quantity unit', "error");
            } else if (!data.currencyType) {
                swal("ERROR", 'Please select currency', "error");
            } else {
                if (data.gradeId && data.gradeId._id && data.margin) {
                    $scope.myForm = data;
                    $scope.myForm._id = data._id;
                    $scope.myForm.commodityId = data.commodityId._id;
                    $scope.myForm.gradeId = data.gradeId._id;
                    $scope.myForm.price = Number(data.price);
                    $scope.myForm.shippingPeriodEntry = data.default ? 'Default' : 'Manual';
                    if (data.unit == "CWT") {
                        $scope.myForm.cdnCwt = Number(data.price);
                    } else {
                        $scope.myForm.cdnCwt = ((Number(data.price) / 60) * 100);
                    }
                    $scope.myForm.exchangeRate = $scope.exchangeRate;
                    pricingHttpServices.updateCommodityPricing($scope.myForm, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.editMode = false;
                            $scope.initPricing();
                        } else {
                            swal("ERROR", res.data.userMessage, "error");
                        }
                    });
                    if ($scope.editing != false) {
                        $scope.editing = false;
                    }
                } else {
                    swal("ERROR", "Some fields are empty", "error");
                }
            }

        };

        $scope.initPricing = function(pageNo) {
            spinnerService.show("html5spinner");
            pricingHttpServices.getCommodityPricing('', $scope.token, $scope.searchModel).then(function(res) {
                if (res.data.status == 200) {
                    $scope.allChecked = true;
                    $scope.priceList = res.data.data.map(price => {
                      price.default = price.shippingPeriodEntry !== 'Manual';
                      return price;
                    });
                    $scope.priceList.sort(function(a, b) {
                        if (a.commodityId.commodityName < b.commodityId.commodityName) {
                            return -1;
                        }
                        if (a.commodityId.commodityName > b.commodityId.commodityName) {
                            return 1;
                        }
                        return 0;
                    });
                    spinnerService.hide("html5spinner");
                }
            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initPricing(page);
        };

        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });

        $scope.getGrade = function(id) {
            spinnerService.show("html5spinner");
            httpService.getGrade('', id, $scope.token).then(function(res) {
                $scope.grades = res.data.status == 200 ? res.data.data : [];
                spinnerService.hide("html5spinner");

            });
            $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                return hero._id == id;
            });
        };


        $scope.calCWD = () => {
            if ($scope.myForm.unit == "CWT") {
                $scope.myForm.cdnCwt = $scope.myForm.price;
            } else {
                $scope.myForm.cdnCwt = (($scope.myForm.price / 60) * 100);
            }
        };
        $scope.submit = () => {
            if (!$scope.myForm.commodityId) {
                swal("ERROR", 'Please fill commodity', "error");
            } else if (!$scope.myForm.gradeId) {
                swal("ERROR", 'Please fill grade', "error");
            } else if (!$scope.myForm.cropYear) {
                swal("ERROR", 'Please fill crop year', "error");
            } else if (!$scope.myForm.currencyType) {
                swal("ERROR", 'Please select currency', "error");
            } else if (!$scope.myForm.priceAsPer) {
                swal("ERROR", 'Please select price as per.', "error");
            } else if ($scope.myForm.priceAsPer == 'Quote Only' && !$scope.myForm.price) {
                swal("ERROR", 'Please fill price', "error");
            } else if ($scope.myForm.priceAsPer == 'Quote Only' && !$scope.myForm.unit) {
                swal("ERROR", 'Please fill price unit', "error");
            } else if ($scope.myForm.priceAsPer == 'Quantity' && !$scope.myForm.quantity) {
                swal("ERROR", 'Please fill quantity', "error");
            } else if ($scope.myForm.priceAsPer == 'Quantity' && !$scope.myForm.quantityUnit) {
                swal("ERROR", 'Please fill quantity unit', "error");
            } else if ($scope.myForm.priceAsPer == 'Quantity' && !$scope.myForm.price) {
                swal("ERROR", 'Please fill price', "error");
            } else if ($scope.myForm.priceAsPer == 'Quantity' && !$scope.myForm.unit) {
                swal("ERROR", 'Please fill price unit', "error");
            } else if (!$scope.myForm.margin) {
                swal("ERROR", 'Please select margin', "error");
            } else {

                if ($scope.myForm.priceAsPer == 'Quote Only') {
                    $scope.myForm.quantity = '';
                    $scope.myForm.quantityUnit = '';
                }

                $scope.myForm.exchangeRate = $scope.exchangeRate;
                spinnerService.show("html5spinner");
                pricingHttpServices.addCommodityPricing($scope.myForm, $scope.token).then(function(res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status == 200) {
                        $scope.initPricing(1);
                        $scope.closepop();
                        $scope.myForm = {};
                    } else {
                        swal("ERROR", res.data.userMessage, "error");
                    }
                });
            }
        };
        $scope.saveChanges = () => {
            spinnerService.show("html5spinner");
            $scope.myForm.exchangeRate = $scope.exchangeRate;
            pricingHttpServices.updateCommodityPricing($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initPricing();
                    $scope.closepop();
                    spinnerService.hide("html5spinner");
                } else {
                    swal("ERROR", res.data.userMessage, "error");
                }
            });
        };
        $scope.excelReport = function() {
            if ($scope.searchForm.date === moment().format("YYYY-MM-DD")) {
                $scope.exportSheet($scope.priceList);
                return;
            }
            spinnerService.show("html5spinner");
            httpService.getArchiveExcel($scope.token, $scope.searchForm)
                .then(function(res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status === 200 && res.data.data) {
                        window.location.href = res.data.data.reportUrl;
                        return;
                    }
                    alert('Excel not present in archive.');
                });
        };
        $scope.exportSheet = function(data) {
            var newData = data.map(function(price) {
                return {
                    'Commodity': price.commodityId.commodityName || '',
                    'Commodity Code': price.commodityId.commodityCode || '',
                    'Grade': price.gradeId.gradeName || '',
                    'Year': price.cropYear || '',
                    'shippingPeriodFrom': price.shippingPeriodFrom || '',
                    'shippingPeriodTo': price.shippingPeriodTo || '',
                    'quantity': price.quantity + 'Fcls' || '',
                    'price': price.price || '',
                    'unit': price.unit || '',
                    'cdnCwt': price.cdnCwt || '',
                    'margin': price.margin || '',
                    'targetFOB': price.targetFOB || '',
                    'bagged_USD_CWT_FOBPlant': price.bagged_USD_CWT_FOBPlant || '',
                    'bagged_USD_MT_FOBPlant': price.bagged_USD_MT_FOBPlant || '',
                    'bulk_USD_MTFOBPlant': price.bulk_USD_MTFOBPlant || '',
                    'bagged_USD_MT_Montreal': price.bagged_USD_MT_Montreal || '',
                    'bagged_USD_MT_Vancouver': price.bagged_USD_MT_Vancouver || '',
                    'bulk_USD_MT_Montreal': price.bulk_USD_MT_Montreal || '',
                    'bulk_USD_MT_Vancouver': price.bulk_USD_MT_Vancouver || '',
                    'createdAt': moment(price.createdAt).format('MM/DD/YYYY, h:mm:ss a')
                };
            });
            var currentDate = moment().format('MM/DD/YYYY');
            var obj = {
                'data': newData,
                'fileName': currentDate + ' price.xlsx'
            };
            var request = new XMLHttpRequest();
            request.open("POST", apiUrl + 'export', true);
            request.responseType = "blob";
            request.setRequestHeader("Content-type", "application/json");
            request.onload = function(e) {
                if (this.status === 200) {
                    // $col.removeLoader();
                    var file = window.URL.createObjectURL(this.response);
                    var a = document.createElement("a");
                    a.href = file;
                    a.download = obj.fileName;
                    document.body.appendChild(a);
                    a.click();
                }
            };
            request.send(JSON.stringify(obj));
        };
        $scope.delete = function(id) {
            spinnerService.show("html5spinner");
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one commodity price.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this commodity price!",
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
                            spinnerService.show("html5spinner");
                            pricingHttpServices.removeCommodityPricing($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initPricing();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    spinnerService.hide("html5spinner");
                                    swal("Deleted!", "Your commodity price has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your commodity price file is safe :)", "error");
                        }
                    });
            }
        };
        $scope.openPop = function(data, type) {
            $scope.myForm = {};
            $(".add_coomm").fadeIn();
            $(".popup_overlay").fadeIn();
            $scope.inputField = 'ADD';
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.commodityId = data.commodityId._id;
                $timeout(function() {
                    $scope.getGrade($scope.myForm.commodityId);
                    $scope.myForm.gradeId = data.gradeId._id;
                }, 1000);
            } else if (type == 'view') {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.commodityId = data.commodityId._id;
                $timeout(function() {
                    $scope.getGrade($scope.myForm.commodityId);
                    $scope.myForm.gradeId = data.gradeId._id;
                }, 300);
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
