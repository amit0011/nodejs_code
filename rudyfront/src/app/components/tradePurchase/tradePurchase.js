angular
    .module('myApp.tradePurchase', [])
    .controller('tradePurchaseCtrl',
        function (
            $scope,
            tradePurchaseHttpServices,
            $state,
            $stateParams,
            spinnerService,
            apiUrl,
            imageUrl,
            $rootScope,
            $window,
            httpService,
            commonService
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.sales || !data.sales.tradePurchaseContract || (!data.sales.tradePurchaseContract.viewMenu && !data.sales.tradePurchaseContract.add && !data.sales.tradePurchaseContract.edit)) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });


            $scope.active = {
                page: 'tradePurchaseContract'
            };

            $scope.token = JSON.parse(localStorage.getItem('token'));
            var pageNo = 1;

            httpService.getCommodity($scope.token).then(function (res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            },
                function (error) {
                    console.log(JSON.stringify(error));
                });


            $scope.getGrade = (id) => {
                if (id) {
                    httpService.getGrade('', id, $scope.token).then(function (res) {
                        $scope.grades = res.data.status == 200 ? res.data.data : [];
                    });
                } else {
                    $scope.grades = [];
                }

            };

            $scope.canChangeStatus = function(contract) {
                return commonService.canChangeStatus(contract, $rootScope.loggedInUser);
            };

            $scope.editTradePurchaseContract = (tradeId) => {
                var url = `editTradePurchaseScale/${tradeId}`;
                $window.open(url, '_blank');
            };

            $scope.buyerDetails = (buyerId) => {
                if ($rootScope.loginUserAccess.sales.buyers.view) {
                    $state.go('buyerDetails', {
                        buyerId: buyerId
                    });
                }
            };

            $scope.DoCtrlPagingAct = function (page) {
                page = page || pageNo;

                var prev_filter = localStorage.getItem('trade_purchase_filter');
                if (prev_filter) {
                    $scope.searchModel = JSON.parse(prev_filter);
                } else {
                    $scope.searchModel = {};
                }

                var keys = Object.keys($scope.searchModel);
                if (keys.length) {
                    if ($scope.searchModel && $scope.searchModel.commodityId) {
                        $scope.getGrade($scope.searchModel.commodityId);
                    }
                    $scope.search();
                } else {
                    $scope.initTradePurchase(page);
                }
            };

            $scope.clear = function() {
              localStorage.removeItem('trade_purchase_filter');
              $scope.initTradePurchase();
            };

            $scope.initTradePurchase = (pageNo) => {
                $scope.searchModel = {
                    limit: '10'
                };
                $scope.grades = [];
                spinnerService.show("html5spinner");

                tradePurchaseHttpServices.getTradePurchase(pageNo, $scope.token, $scope.searchModel.limit).then(function (res) {
                    if (res.data.status == 200) {
                        $scope.tradePurchaseList = res.data.data.docs;
                        $scope.page = res.data.data.page;
                        $scope.totalPages = res.data.data.total;

                        for (var i = 0; i < $scope.tradePurchaseList.length; i++) {

                            if ($scope.tradePurchaseList[i].shipmentScheldule) {
                                var newArr = $scope.tradePurchaseList[i].shipmentScheldule
                                    .filter(function(val) { return !(val == null || Object.entries(val).length === 0); });
                                $scope.tradePurchaseList[i].shipmentScheldule = newArr;
                                if ($scope.tradePurchaseList[i].shipmentScheldule.length > 0) {
                                    $scope.tradePurchaseList[i].shimStartDate = $scope.tradePurchaseList[i].shipmentScheldule[0].startDate;
                                    $scope.tradePurchaseList[i].shimEndDate = $scope.tradePurchaseList[i].shipmentScheldule[$scope.tradePurchaseList[i].shipmentScheldule.length - 1].endDate;
                                }
                            }
                            $scope.tradePurchaseList[i].status = $scope.tradePurchaseList[i].status.toString();
                        }
                        spinnerService.hide("html5spinner");
                    }
                },
                    function (error) {
                        console.log(JSON.stringify(error));
                    });
            };

            $scope.search = function (page) {
                localStorage.setItem('trade_purchase_filter', JSON.stringify($scope.searchModel));
                spinnerService.show("html5spinner");

                var searchParam = Object.assign({}, $scope.searchModel);
                searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
                searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');
                searchParam.shippingStartDate = commonService.adjustDate(searchParam.shippingStartDate);
                searchParam.shippingEndDate = commonService.adjustDate(searchParam.shippingEndDate, ']');

                tradePurchaseHttpServices.searchSaleContract(searchParam, $scope.token).then(function (res) {
                    if (res.data.status == 200) {
                        $scope.tradePurchaseList = res.data.data.docs;
                        $scope.page = res.data.data.page;
                        $scope.totalPages = res.data.data.total;
                        for (var i = 0; i < $scope.tradePurchaseList.length; i++) {
                            if ($scope.tradePurchaseList[i].shipmentScheldule) {
                                var newArr = $scope.tradePurchaseList[i].shipmentScheldule
                                    .filter(function(val) { return !(val == null || Object.entries(val).length === 0); });
                                $scope.tradePurchaseList[i].shipmentScheldule = newArr;
                                if ($scope.tradePurchaseList[i].shipmentScheldule.length > 0) {
                                    $scope.tradePurchaseList[i].shimStartDate = $scope.tradePurchaseList[i].shipmentScheldule[0].startDate;
                                    $scope.tradePurchaseList[i].shimEndDate = $scope.tradePurchaseList[i].shipmentScheldule[$scope.tradePurchaseList[i].shipmentScheldule.length - 1].endDate;
                                }
                            }
                            $scope.tradePurchaseList[i].status = $scope.tradePurchaseList[i].status.toString();
                        }
                    }
                    spinnerService.hide("html5spinner");
                },
                    function (error) {
                        console.log(JSON.stringify(error));
                    });
            };

            $scope.getShippedQuantityLbs = (scale) => {
                var totalShippedQuantityLbs = 0;
                if (scale && scale.length > 0) {
                    scale.forEach((val) => {
                        // convert kb to pounds ( Number(val.netWeight) * 2.2046)
                        totalShippedQuantityLbs += (val.unloadWeidht  && !val.void) ? Number(val.unloadWeidht) * 2.2046 : 0;
                    });
                }
                return totalShippedQuantityLbs;
            };

            $scope.reloadWeight = function(contractNumber) {
              tradePurchaseHttpServices.reloadTradePurchaseWeight(contractNumber, $scope.token).then(function(res) {
                if (res.data.status === 200) {
                  $scope.search($scope.page);
                }
              });
            };

            $scope.exportSheet = (data) => {
                var newData = data.map((scale) => {
                    if (scale.buyerId) {
                        $scope.businessName = scale.buyerId.businessName;
                    }
                    if (scale.pricingTerms) {
                        $scope.pricingT = scale.pricingTerms.pricingTerms;
                    }
                    if (scale.gradeId) {
                        $scope.gradeName = scale.gradeId.gradeName;
                    }
                    return {
                        'Date': moment(scale.date).format('MM/DD/YYYY'),
                        'Contract Number': scale.contractNumber,
                        'Name': $scope.businessName,
                        'Commodity': scale.commodityId.commodityName || '',
                        'Grade': $scope.gradeName,
                        'Amount': scale.amount,
                        'Amount Unit': scale.grossWeightMT,
                        'Contrat Qty': scale.contractQuantity,
                        'destination': scale.destination,
                        'Bags': scale.noOfBags || '',
                        'Quantity Lbs': scale.quantityLbs,
                        'pricingTerms': $scope.pricingT,
                        'Created At': moment(scale.createdAt).format('MM/DD/YYYY')
                    };
                });

                var obj = {
                    'data': newData,
                    'fileName': 'TradePurchase' + ' contract.xlsx'
                };
                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'export', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
                request.onload = function (e) {
                    if (this.status === 200) {
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



            $scope.selectedFile = (input) => {
                $scope.file = input.files[0];
                if ($scope.file.name.split('.').pop() !== 'pdf') {
                    $scope.errMsg = "Invalid pdf file";
                    $scope.file = '';
                }
            };

            $scope.uploadPdf = () => {
                if ($scope.file) {
                    spinnerService.show("html5spinner");
                    var data = {
                        file: $scope.file
                    };
                    tradePurchaseHttpServices.uploadPdf(data, $scope.selectedContract._id, $scope.token).then(function (res) {
                        spinnerService.hide("html5spinner");
                        if (res.data.status == 200) {
                            $scope.selectedContract.contractIsSigned = true;
                            $scope.closepop();
                            swal("Success", "Pdf uploaded successfully.", "success");
                        } else {
                            $scope.errMsg = res.data.userMessage;
                        }
                    },
                        function (error) {
                            spinnerService.hide("html5spinner");
                        });
                } else {
                    $scope.errMsg = $scope.errMsg ? $scope.errMsg : "Please select file";
                }
            };

            $scope.deleteSignedContract = (data) => {
                swal({
                    title: "Are you sure?",
                    text: "Your will not be able to recover this signed contract!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No, cancel!",
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {
                        if (isConfirm) {
                            spinnerService.show("html5spinner");
                            tradePurchaseHttpServices.removeSignedContract(data._id, $scope.token).then(function (res) {
                                spinnerService.hide("html5spinner");
                                if (res.data.status == 200) {
                                    data.contractIsSigned = false;
                                    swal("Deleted!", "Signed contract deleted.", "success");
                                }
                            },
                                function (error) {
                                    spinnerService.hide("html5spinner");
                                });
                        } else {
                            swal("Cancelled", "Your signed contract is safe :)", "error");
                        }
                    });
            };



            $scope.openPop = function (type, data) {
                $scope.selectedContract = data;
                $scope.file = '';
                $scope.errMsg = '';
                angular.element("input[type='file']").val(null);
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            };
            $scope.closepop = function () {
                $(".add_coomm").fadeOut();
                $(".popup_overlay").fadeOut();
            };
            $(".popup_overlay , .close").click(function () {
                $(".add_coomm").fadeOut();
                $(".popup_overlay").fadeOut();
            });
            $('body').on('click', '.popup_overlay', function () {
                $scope.closepop();
            });

            $scope.changeTradePurchaseStatus = (contract) => {
                var data = {
                    _id: contract._id,
                    status: Number(contract.status)
                };
                if(contract.status == 1) {
                    swal({
                        title: "Are you sure?",
                        text: "You want to adjust the purchase to the delivered qty?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, Complete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: true,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            $scope.tradePurchaseContractStatusChange(data);
                        } else {
                            swal("Cancelled", "Your contract file is safe :)", "error");
                            $scope.initTradePurchase();
                        }
                    });
                } else {
                    $scope.tradePurchaseContractStatusChange(data);
                }
            };

            $scope.tradePurchaseContractStatusChange = (data) => {
                spinnerService.show("html5spinner");
                tradePurchaseHttpServices.changeTradePurchaseContractStatus(data, $scope.token).then(function (res) {
                    if (res.data.status == 200) {
                        swal("Alert", res.data.userMessage, "success");
                    } else {
                        swal("Alert", res.data.userMessage, "error");
                    }
                    $scope.initTradePurchase();
                    spinnerService.hide("html5spinner");
                });
            };


            $scope.delete = function (id) {
                if (id) {
                    $scope.arr = [id];
                }
                if ($scope.arr.length == 0) {
                    swal("Here's a message!", 'Select atleast one Sales Contract.', "error");
                } else {
                    $scope.data = {
                        idsArray: $scope.arr
                    };
                    swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this Sales Contract!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                        function (isConfirm) {
                            if (isConfirm) {
                                tradePurchaseHttpServices.removetradePurchase($scope.data, $scope.token).then(function (res) {
                                    if (res.data.status == 200) {
                                        $scope.initTradePurchase();
                                        $scope.arr = [];
                                        $scope.allChecked = true;
                                        swal("Deleted!", "Your Sales Contract has been deleted.", "success");
                                    }
                                },
                                    function (error) {
                                        console.log(JSON.stringify(error));
                                    });
                            } else {
                                swal("Cancelled", "Your Sales Contract name is safe :)", "error");
                            }
                        });
                }
            };

        });
