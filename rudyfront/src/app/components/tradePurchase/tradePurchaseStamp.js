angular.module('myApp.tradePurchaseStamp', [])
    .controller('tradePurchaseStampCtrl',
        function(
            $scope,
            salesContractHttpServices,
            tradePurchaseHttpServices,
            brokerHttpService,
            countryHttpService,
            pricingTermsHttpService,
            paymentTermsHttpService,
            paymentMethodHttpService,
            tradeRulesHttpService,
            documentsHttpService,
            equipmentHttpService,
            loadingPortHttpService,
            varianceHttpService,
            certificateCostHttpService,
            sudAdminHttpService,
            freightHttpServices,
            tagsHttpService,
            bagsHttpService,
            httpService,
            $state,
            $stateParams,
            freightSettingHttpService,
            freightCompanyHttpServices,
            currencyHttpService,
            $timeout,
            spinnerService,
            buyerHttpServices,
            apiUrl,
            salesStampHttpServices,
            imageUrl,
            $rootScope) {


            $scope.$on('access', (event, data) => {
                if (!data || !data.sales || !data.sales.tradePurchaseContract || (!data.sales.tradePurchaseContract.viewMenu || !data.sales.tradePurchaseContract.edit)) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });



            $scope.myForm = {};
            $scope.active = {
                page: 'tradePurchaseContract'
            };
            var pageNo = 1;

            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.imagePath = imageUrl;
            $scope.myForm.date = moment(new Date()).format('YYYY-MM-DD');


            currencyHttpService.getcurrency($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.currencyList = res.data.data;
                    $scope.myForm.exchangeRate = $scope.currencyList[0].currencyCADUSD;
                    $scope.exchangeDeduction = $scope.currencyList[0].exchangeDeduction;
                }
            });

            bagsHttpService.getbags('', $scope.token).then(function(res) {
                $scope.bagsList = res.data.status == 200 ? res.data.data : [];
            });


            certificateCostHttpService.getcertificateCost('', $scope.token).then(function(res) {
                $scope.certificateCostList = res.data.status == 200 ? res.data.data : [];
            });


            $scope.checkShipingPriceWithTotalUSDPrice = (d) => {
                var rem_price = $scope.calculateRemainingPrice();
                if (rem_price < 0) {
                    d.ship = 0;
                    d.ship = $scope.calculateRemainingPrice();
                }
            };


            function calculatePriceCWT() {
                if ($scope.myForm.amountUnit == "MT") {
                    $scope.myForm.pricePerCWT = $scope.myForm.amount / 22.0462;
                    $scope.myForm.qtyCWT = $scope.myForm.contractQuantity * 22.0462;
                } else if ($scope.myForm.amountUnit == "Lbs") {
                    $scope.myForm.pricePerCWT = $scope.myForm.amount * 100;
                    $scope.myForm.qtyCWT = $scope.myForm.contractQuantity / 100;
                } else if ($scope.myForm.amountUnit == "Bu") {
                    $scope.myForm.pricePerCWT = $scope.myForm.amount * (100 / $scope.myForm.commodityId.commodityWeight);
                    $scope.myForm.qtyCWT = $scope.myForm.contractQuantity * (100 / $scope.myForm.commodityId.commodityWeight); //*bu weight can be found in commodity settings
                } else {
                    $scope.myForm.pricePerCWT = $scope.myForm.amount;
                    $scope.myForm.qtyCWT = $scope.myForm.contractQuantity;
                }
            }

            function calculateCurrencyBasesPrice() {
                if ($scope.myForm.contractCurrency == 'CAD') {
                    $scope.myForm.priceCwtUSD = $scope.myForm.pricePerCWT / $scope.myForm.exchangeRate;
                    $scope.myForm.priceMT = ($scope.myForm.priceCwtUSD * $scope.myForm.exchangeRate) * 22.0462;
                } else {
                    $scope.myForm.priceCwtUSD = $scope.myForm.pricePerCWT;
                    $scope.myForm.priceMT = $scope.myForm.priceCwtUSD * 22.0462;
                }
            }


            $scope.calculateBrokerCommissionPrice = () => {
                if ($scope.myForm.commissionType == "%") {
                    $scope.myForm.brokerageCWT = $scope.myForm.priceCwtUSD * (Number($scope.myForm.brokerCommision) / 100);
                } else {
                    $scope.myForm.brokerageCWT = $scope.myForm.brokerCommision;
                }
                $scope.myForm.brokerageCWT = $scope.myForm.brokerageCWT && (Number($scope.myForm.brokerageCWT)).toFixed(2);
                $scope.myForm.commisionCWT = $scope.myForm.brokerageCWT;
            };

            function monthDiff(d1, d2) {
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months <= 0 ? 0 : months;
            }

            $scope.calculateExchageRate = (d) => {
                var totalMonthDiff = monthDiff(new Date($scope.myForm.date), new Date(d.end_date)) + 1;
                d.exchangeRate = Number($scope.myForm.exchangeRate) - (Number($scope.exchangeDeduction) * totalMonthDiff);
                d.exchangeRate = (d.exchangeRate.toFixed(4)).toString();
            };


            Array.prototype.sum = function(prop) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++)
                    if (this[i][prop]) total += Number(this[i][prop]);
                return $scope.myForm.priceUSD - total;
            };
            $scope.calculateRemainingPrice = () => {
                return $scope.currencyPosition.sum('ship');
            };



            if ($stateParams.tradeId && $stateParams.contractNumber) {
                tradePurchaseHttpServices.getTradePurchaseDetails($stateParams.tradeId, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            spinnerService.hide("html5spinner");
                            $scope.myForm = res.data.data;

                            if ($scope.myForm.shipmentScheldule && $scope.myForm.shipmentScheldule.length > 0) {
                                $scope.shipmentScheldule = $scope.myForm.shipmentScheldule;
                                $scope.shipmentScheldule.forEach((val) => {
                                    val.ship = ((val.quantity * 100) / Number($scope.myForm.contractQuantity)).toFixed(2);
                                    val.end_date = moment(val.endDate).add(1, 'M').format('YYYY-MM');
                                    $scope.calculateExchageRate(val);
                                });

                            } else {
                                $scope.shipmentScheldule = [{
                                    ship: $scope.calculateRemainingPrice()
                                }];
                            }

                            if (!$scope.myForm.salesStampGenerated) {

                                $scope.myForm.noOfShipment = res.data.data.shipmentScheldule.length;

                                calculatePriceCWT();
                                calculateCurrencyBasesPrice();
                                $scope.calculateBrokerCommissionPrice();

                                $scope.myForm.blFee = $scope.myForm.blFee || 100;
                                $scope.myForm.documentCosting = 90;

                                if ($scope.myForm.unitFcl) {
                                    $scope.myForm.blFeeCWT = $scope.myForm.blFee / $scope.myForm.unitFcl;
                                    $scope.myForm.documentCostingCWT = $scope.myForm.documentCosting / $scope.myForm.unitFcl * $scope.myForm.packedIn;
                                }

                                $scope.myForm.interestRate = $scope.myForm.interestRate || 8;
                                $scope.myForm.interestDays = $scope.myForm.interestDays || 35;

                                $scope.myForm.insuranceRate = $scope.myForm.insuranceRate || 0.0025;
                                $scope.myForm.insuranceRateCWT = ($scope.myForm.insuranceRate || 0) * $scope.myForm.priceCwtUSD;

                                $scope.myForm.ariPolicy = $scope.myForm.ariPolicy || 0.0030;
                                $scope.myForm.ariPolicyCWT = $scope.myForm.ariPolicy * $scope.myForm.priceCwtUSD;

                                $scope.myForm.lcCost = $scope.myForm.lcCost || 0;
                                $scope.myForm.lcCostCWT = ($scope.myForm.lcCost / 100) * $scope.myForm.pricePerCWT;

                                $scope.myForm.stuffingCWT = $scope.myForm.stuffingCWT || 0;

                                $scope.inlandFrtStuffingBuffer = $scope.inlandFrtStuffingBuffer || 756;

                                //stuffing_cost as stuffingBuffer
                                $scope.myForm.stuffingBuffer = $scope.myForm.stuffingBuffer || 0;

                                $scope.myForm.bagCostType = $scope.myForm.packingUnit.name;
                                $scope.myForm.bagCostCWT = $scope.myForm.packingUnit.bagCost;
                                $scope.myForm.coaCost = $scope.myForm.certificateAnalysis.cost / $scope.myForm.qtyCWT;
                                $scope.myForm.certificateAnalysisName = $scope.myForm.certificateAnalysis.certificateName;
                                $scope.myForm.certificateAnalysis = $scope.myForm.certificateAnalysis;
                                $scope.myForm.cropYear = res.data.data.cropYear;
                                $scope.myForm.date = moment(res.data.data.date).format('YYYY-MM-DD');
                                $scope.myForm.packingUnit = $scope.myForm.packingUnit._id;


                                $scope.myForm.freightCWT = $scope.myForm.freight;
                                $scope.myForm.oceanFreightBL = $scope.myForm.freight;
                                $scope.myForm.oceanFreightCWT = $scope.myForm.oceanFreightBL / $scope.myForm.unitFcl;
                                $scope.myForm.totalBlFeeCWT = $scope.myForm.oceanFreightCWT + $scope.myForm.blFeeCWT;
                                $scope.myForm.oceanFreightCWTUSD = $scope.myForm.blFeeCWT + $scope.myForm.freightCWT;

                                if ($scope.myForm.contractCurrency == "CAD") {
                                    $scope.myForm.oceanFreightCWTUSD = $scope.myForm.oceanFreightCWT / $scope.myForm.exchangeRate;
                                }
                                if ($scope.myForm.contractCurrency != "CAD") {
                                    $scope.myForm.oceanFreightCWTUSD = $scope.myForm.oceanFreightCWT;
                                }

                                $scope.getTragetFob($scope.myForm.commodityId, $scope.myForm.gradeId, $scope.myForm.cropYear);
                            }
                        } else {
                            spinnerService.hide("html5spinner");
                            swal("Error", res.data.userMessage, "error");
                        }
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            }




            freightSettingHttpService.getfreightSetting(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    spinnerService.hide("html5spinner");
                    $scope.freightSettingPrice = res.data.data.docs;
                } else {
                    spinnerService.hide("html5spinner");
                }
            });




            $scope.getTragetFob = (commodityId, gradeId, cropYear) => {
                salesStampHttpServices.getCommodityPricing(commodityId, gradeId, cropYear, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.commodityPricingList = res.data.data;
                        if ($scope.commodityPricingList) {
                            $scope.myForm.targetFOBCAD = $scope.commodityPricingList.targetFOB.toFixed(2);
                        } else {
                            $scope.myForm.targetFOBCAD = 0;
                        }
                        updatePrice();
                    }
                });
            };
            $scope.getDocumentCosting = (type) => {
                if (type == 'DOC') {
                    if (!$scope.myForm.packedIn || !$scope.myForm.unitFcl) {
                        swal("Error", 'Please fill FCL/Shipments & Unit FCL first.', "error");
                    } else {
                        $scope.myForm.documentCostingCWT = ($scope.myForm.documentCosting || 0) / ($scope.myForm.unitFcl || 0) * $scope.myForm.packedIn;
                    }
                } else if (type == 'LC') {
                    $scope.myForm.lcCostCWT = ($scope.myForm.lcCost / 100) * $scope.myForm.pricePerCWT;
                } else if (type == 'Insurance') {
                    $scope.myForm.insuranceRateCWT = $scope.myForm.insuranceRate * $scope.myForm.priceCwtUSD;
                } else if (type == 'ARI') {
                    $scope.myForm.ariPolicyCWT = $scope.myForm.ariPolicy * $scope.myForm.priceCwtUSD;
                } else if (type == 'Interest') {
                    if ($scope.myForm.interestDays && $scope.myForm.cadCWT) {
                        $scope.myForm.interestRateCWT = ((Number($scope.myForm.interestDays) / 365) * (Number($scope.myForm.interestRate) / 100)) * $scope.myForm.cadCWT;
                    }
                } else if (type == 'Inline Freight') {
                    if ($scope.myForm.inlineFreight == 'Intermodal VCR') {
                        $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalVCR;
                    } else if ($scope.myForm.inlineFreight == 'Intermodal MTL') {
                        $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalMTL;
                    } else if ($scope.myForm.inlineFreight == 'Hoppercar') {
                        $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalVCR;
                    } else if ($scope.myForm.inlineFreight == 'Boxcar') {
                        $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalVCR;
                    }
                } else if (type == 'Target') {
                    $scope.myForm.underTarget = $scope.myForm.netFOBCAD - $scope.myForm.targetFOBCAD;
                }
                $scope.myForm.priceUSD = ($scope.myForm.pricePerCWT - ($scope.myForm.totalBlFeeCWT + $scope.myForm.documentCostingCWT + $scope.myForm.insuranceRateCWT + $scope.myForm.ariPolicyCWT)) * $scope.myForm.qtyCWT;

                if ($scope.myForm.priceUSD) {
                    $scope.myForm.priceCAD = $scope.myForm.priceUSD * $scope.myForm.exchangeRate;
                    $scope.myForm.cadCWT = $scope.myForm.priceCAD / $scope.myForm.qtyCWT;
                }

                if (!$scope.myForm.netFOBCAD) {
                    $scope.myForm.netFOBCAD = ($scope.myForm.cadCWT || 0) - (($scope.myForm.interestRateCWT || 0) + (Number($scope.myForm.stuffingCWT) || 0) + ($scope.myForm.inlineFreightCWT || 0) + (Number($scope.myForm.bagCostCWT) || 0) + (Number($scope.myForm.coaCost) || 0) + (Number($scope.myForm.stuffingBuffer) || 0) + (Number($scope.myForm.missCostCWT1) || 0) + (Number($scope.myForm.missCostCWT2) || 0) + (Number($scope.myForm.missCostCWT3) || 0));
                }
            };



            function updatePrice() {

                $scope.myForm.priceUSD = ($scope.myForm.priceCwtUSD - (($scope.myForm.oceanFreightCWTUSD || 0) + $scope.myForm.documentCostingCWT + $scope.myForm.insuranceRateCWT + $scope.myForm.ariPolicyCWT)) * $scope.myForm.qtyCWT;

                if ($scope.myForm.priceUSD) {
                    $scope.myForm.priceCAD = $scope.myForm.priceUSD * $scope.myForm.exchangeRate;
                    // price_CAD_per_cwt
                    $scope.myForm.cadCWT = $scope.myForm.priceCAD / $scope.myForm.qtyCWT;
                }

                if ($scope.myForm.interestDays && $scope.myForm.cadCWT) {
                    $scope.myForm.interestRateCWT = ((Number($scope.myForm.interestDays) / 365) * (Number($scope.myForm.interestRate) / 100)) * $scope.myForm.cadCWT;
                }
                if (!$scope.myForm.netFOBCAD) {
                    $scope.myForm.netFOBCAD = ($scope.myForm.cadCWT || 0) - (($scope.myForm.interestRateCWT || 0) - (Number($scope.myForm.stuffingCWT) || 0) - ($scope.myForm.inlineFreightCWT || 0) - (Number($scope.myForm.bagCostCWT) || 0) - (Number($scope.myForm.coaCost) || 0) - (Number($scope.myForm.stuffingBuffer) || 0) - (Number($scope.myForm.missCostCWT1) || 0) - (Number($scope.myForm.missCostCWT2) || 0) - (Number($scope.myForm.missCostCWT3) || 0));
                }
            }

            $scope.submit = () => {
                $scope.myForm.shipmentScheldule = $scope.shipmentScheldule;
                $scope.myForm.salesStampGenerated = true;
                spinnerService.show("html5spinner");
                tradePurchaseHttpServices.updateTradePurchaseStamp($scope.myForm, $scope.token).then(function(res) {
                        spinnerService.show("html5spinner");
                        if (res.data.status == 200) {
                            $scope.myForm = {};
                            $scope.commoditySampleAnalysis = [];
                            $state.go('tradePurchase');
                        }
                    },
                    function(error) {
                        spinnerService.show("html5spinner");
                    });
            };


            $scope.changeBlFeeCWT = () => {
                if ($scope.myForm.blFee) {
                    $scope.myForm.blFeeCWT = $scope.myForm.blFee / $scope.myForm.unitFcl;
                } else {
                    $scope.myForm.blFeeCWT = 0;
                }
            };
        });