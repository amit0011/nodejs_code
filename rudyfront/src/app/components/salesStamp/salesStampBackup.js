angular.module('myApp.salesStamp', [])
    .controller('salesStampCtrl',
        function(
            $scope,
            salesContractHttpServices,
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
            imageUrl) {
            $scope.myForm = {};
            $scope.active = {
                page: 'salesContract'
            };
            $scope.isError = "";
            var brokerPage = '';
            $scope.backShow = false;
            var pageNo = 1;
            //$scope.shipmentScheldule = [{}];


            Array.prototype.sum = function(prop) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++)
                    if (this[i][prop]) total += Number(this[i][prop]);
                return $scope.myForm.priceUSD - total;
            };
            $scope.calculateRemainingPrice = () => {
                return $scope.currencyPosition.sum('ship');
            };

            $scope.newDateObject = new Date();


            function monthDiff(d1, d2) {
                var months;
                months = (d2.getFullYear() - d1.getFullYear()) * 12;
                months -= d1.getMonth() + 1;
                months += d2.getMonth();
                return months <= 0 ? 0 : months;
            }

            $scope.calculateExchageRate = (d) => {
                var totalMonthDiff = monthDiff(new Date($scope.myForm.date), new Date(d.end_date)) + 1;
                d.exchangeRate = Number($scope.myForm.exchangeRate) - (Number($scope.myForm.exchangeDeduction) * totalMonthDiff);
                d.exchangeRate = (d.exchangeRate.toFixed(4)).toString();
            };

            $scope.checkShipingPriceWithTotalUSDPrice = (d) => {
                var rem_price = $scope.calculateRemainingPrice();
                if (rem_price < 0) {
                    d.ship = 0;
                    d.ship = $scope.calculateRemainingPrice();
                }
            };
            $scope.calculateMinDate = (index) => {
                date = index == 0 ? $scope.myForm.date : $scope.shipmentScheldule[index - 1].startDate;
                return moment(date).add(1, 'M').format('YYYY-MM');
            };

            $scope.plusshipmentScheldule = function() {
                var total = $scope.calculateRemainingPrice();
                if (total > 0) {
                    $scope.shipmentScheldule.push({
                        ship: total
                    });
                }
            };

            $scope.removeshipmentScheldule = function(index) {
                $scope.shipmentScheldule.splice(index, 1);
            };


            $scope.userProfile = JSON.parse(localStorage.getItem('userProfile'));
            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.imagePath = imageUrl;
            $scope.myForm.date = moment(new Date()).format('YYYY-MM-DD');


            currencyHttpService.getcurrency($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.currencyList = res.data.data;
                    $scope.myForm.exchangeRate = $scope.currencyList[0].currencyCADUSD;
                    $scope.myForm.exchangeDeduction = $scope.currencyList[0].exchangeDeduction;
                }
            });

            certificateCostHttpService.getcertificateCost('', $scope.token).then(function(res) {
                $scope.certificateCostList = res.data.status == 200 ? res.data.data : [];
            });


            bagsHttpService.getbags('', $scope.token).then(function(res) {
                $scope.bagsList = res.data.status == 200 ? res.data.data : [];
            });


            // freightCompanyHttpServices.getFreightCompany(' ', $scope.token).then(function(res) {
            //     $scope.freightCompanyList = res.data.status == 200 ? res.data.data : [];
            // });

            // varianceHttpService.getvariance($scope.token).then(function(res) {
            //     $scope.varianceList = res.data.status == 200 ? res.data.data : [];
            // });




            // sudAdminHttpService.getadmin('', $scope.token).then(function(res) {
            //     if (res.data.status == 200) {
            //         $scope.updatedAdminList = [];
            //         for (var i = 0; i < res.data.data.length; i++) {
            //             if (res.data.data[i].type == 'ADMIN' || res.data.data[i].roles == 'Sales') {
            //                 $scope.updatedAdminList.push(res.data.data[i]);
            //             } else {
            //                 $scope.adminList = res.data.data;
            //             }
            //         }
            //     }
            // });


            // equipmentHttpService.getEquipment('', $scope.token, '').then(function(res) {
            //     if (res.data.status == 200) {
            //         $scope.inlandEquipmentList = [];
            //         for (var i = 0; i < res.data.data.length; i++) {
            //             if (res.data.data[i].equipmentType == 'Inland') {
            //                 $scope.inlandEquipmentList.push(res.data.data[i]);
            //             } else {
            //                 $scope.equipmentList = res.data.data;
            //             }
            //         }
            //     }
            // });


            // tagsHttpService.gettags($scope.token).then(function(res) {
            //     $scope.tagsList = res.data.status == 200 ? res.data.data : [];
            // });


            // $scope.inittradeRules = () => {
            //     tradeRulesHttpService.gettradeRules($scope.token).then(function(res) {
            //         $scope.tradeRulesList = res.data.status == 200 ? res.data.data : [];
            //     });
            // };
            // $scope.inittradeRules();

            // $scope.initpricingTerms = () => {
            //     pricingTermsHttpService.getpricingTerms($scope.token).then(function(res) {
            //         $scope.pricingTermsList = res.data.status == 200 ? res.data.data : [];
            //     });
            // };
            // $scope.initpricingTerms();

            // $scope.initPaymentTerms = () => {
            //     paymentTermsHttpService.getpaymentTerms($scope.token).then(function(res) {
            //         $scope.paymentTermsList = res.data.status == 200 ? res.data.data : [];
            //     });
            // };
            // $scope.initPaymentTerms();

            // $scope.initpaymentMethod = () => {
            //     paymentMethodHttpService.getpaymentMethod($scope.token).then(function(res) {
            //         $scope.paymentMethodList = res.data.status == 200 ? res.data.data : [];
            //     });
            // };
            // $scope.initpaymentMethod();


            // loadingPortHttpService.getLoadingPort('', $scope.token).then(function(res) {
            //     $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
            // });





            // $scope.initSales = (pageNo) => {
            //     spinnerService.show("html5spinner");
            //     salesContractHttpServices.getsalesContract(pageNo, $scope.token).then(function(res) {
            //             if (res.data.status == 200) {
            //                 spinnerService.hide("html5spinner");
            //                 $scope.salesContractList = res.data.data;
            //                 $scope.page = res.data.data.page;
            //                 $scope.totalPages = res.data.data.total;
            //             }
            //         },
            //         function(error) {
            //             console.log(JSON.stringify(error));
            //         });
            // };


            // $scope.initdocuments = () => {
            //     documentsHttpService.getdocuments($scope.token).then(function(res) {
            //         $scope.documentsList = res.data.status == 200 ? res.data.data : [];
            //     });
            // };
            // $scope.initdocuments();


            // if ($stateParams.buyerId) {
            //     buyerHttpServices.getBuyerDetails($stateParams.buyerId, $scope.token).then(function(res) {
            //         if (res.data.status == 200) {
            //             $scope.buyerDetails = res.data.data;
            //         }
            //     });
            // }



            // countryHttpService.getCountryList($scope.token).then(function(res) {
            //     if (res.data.status == 200) {
            //         $scope.updatedList = {};
            //         res.data.data.forEach((val) => {
            //             if ($scope.updatedList[val.country]) {
            //                 $scope.updatedList[val.country].push({
            //                     model: val.name + ' - ' + val.city
            //                 });
            //             } else {
            //                 $scope.updatedList[val.country] = [{
            //                     model: val.name + ' - ' + val.city
            //                 }];
            //             }
            //         });
            //         var arrayObjectData = [];
            //         angular.forEach($scope.updatedList, (value, key) => {
            //             arrayObjectData.push({
            //                 country: key
            //             });
            //         });
            //         $scope.countries = arrayObjectData;
            //     }
            // });



            // httpService.getCommodity($scope.token).then(function(res) {
            //     $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            // });


            // $scope.getGrade = (id) => {
            //     httpService.getGrade('', id, $scope.token).then(function(res) {
            //         $scope.grades = res.data.status == 200 ? res.data.data : [];
            //     });
            //     $timeout(function() {
            //         $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
            //             return hero._id == id;
            //         });
            //         $scope.myForm.commodityAlias = $scope.commodityGrades[0].commodityAlias;
            //         $scope.commoditySampleAnalysis = $scope.commodityGrades[0].commoditySampleAnalysis;
            //     }, 1000);
            // };




            freightSettingHttpService.getfreightSetting(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.freightSettingPrice = res.data.data.docs;
                }
            });


            $scope.initFreight = (loadingPortId, destination, equipmentId, freightCompanyId, loadingPortName) => {
                var obj = {
                    equipmentId: equipmentId,
                    loadingPortId: loadingPortId,
                    city: destination,
                    freightCompanyId: freightCompanyId
                };
                freightHttpServices.freightCompanyList(obj, $scope.token).then(function(res) {
                        $scope.freightList = res.data.status == 200 ? res.data.data : [];
                        if ($scope.freightList[0]) {

                            $scope.myForm.blFee = $scope.freightList[0].blFee || 0;

                            if ($scope.myForm.unitFcl) {
                                $scope.myForm.blFeeCWT = $scope.myForm.blFee > 0 ? $scope.myForm.blFee / Number($scope.myForm.unitFcl) : 0;
                            }



                            if ($scope.myForm.packingUnit.bulkBag == 'Bag') {

                                $scope.myForm.freightCWT = $scope.freightList[0].freightCWT.bagToBag;

                                $scope.myForm.oceanFreightBL = $scope.freightList[0].oceanFreight.bagToBag;

                                $scope.myForm.oceanFreightCWT = $scope.myForm.unitFcl ? $scope.freightList[0].oceanFreight.bagToBag / Number($scope.myForm.unitFcl) : 0;

                                $scope.myForm.totalBlFeeCWT = $scope.myForm.oceanFreightCWT + $scope.myForm.blFeeCWT + ($scope.myForm.commisionCWT || 0);

                                $scope.myForm.oceanFreightCWTUSD = $scope.myForm.blFeeCWT + ($scope.myForm.freightCWT || 0);

                            } else if ($scope.myForm.packingUnit.bulkBag == 'Bulk') {

                                $scope.myForm.freightCWT = $scope.freightList[0].freightCWT.bulkToBulk;

                                $scope.myForm.oceanFreightBL = $scope.freightList[0].oceanFreight.bulkToBulk;

                                $scope.myForm.oceanFreightCWT = $scope.myForm.unitFcl ? $scope.freightList[0].oceanFreight.bulkToBulk / Number($scope.myForm.unitFcl) : 0;

                                $scope.myForm.totalBlFeeCWT = $scope.myForm.oceanFreightCWT + $scope.myForm.blFeeCWT + ($scope.myForm.commisionCWT || 0);

                                $scope.myForm.oceanFreightCWTUSD = $scope.myForm.blFeeCWT + ($scope.myForm.freightCWT || 0);

                            } else {

                                $scope.myForm.freightCWT = $scope.freightList[0].freightCWT.bulkToBag;

                                $scope.myForm.oceanFreightBL = $scope.freightList[0].oceanFreight.bulkToBag;

                                $scope.myForm.oceanFreightCWT = $scope.myForm.unitFcl ? $scope.freightList[0].oceanFreight.bulkToBag / Number($scope.myForm.unitFcl) : 0;

                                $scope.myForm.totalBlFeeCWT = $scope.myForm.oceanFreightCWT + $scope.myForm.blFeeCWT + ($scope.myForm.commisionCWT || 0);

                                $scope.myForm.oceanFreightCWTUSD = $scope.myForm.blFeeCWT + ($scope.myForm.freightCWT || 0);

                            }
                        }

                        if ($scope.myForm.contractCurrency == "CAD") {
                            $scope.myForm.oceanFreightCWTUSD = $scope.myForm.oceanFreightCWT / $scope.myForm.exchangeRate;
                        }
                        if ($scope.myForm.contractCurrency != "CAD") {
                            $scope.myForm.oceanFreightCWTUSD = $scope.myForm.oceanFreightCWT;
                        }

                        $scope.getTragetFob($scope.myForm.commodityId._id, $scope.myForm.gradeId._id, $scope.myForm.cropYear);
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            };
            $scope.getTragetFob = (commodityId, gradeId, cropYear) => {
                spinnerService.show("html5spinner");
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
                        spinnerService.hide("html5spinner");
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            };
            $scope.calculateDependentValue = (type) => {
                if (type == 'blFee') {
                    if ($scope.myForm.blFee && $scope.myForm.blFee > 0 && $scope.myForm.unitFcl && $scope.myForm.unitFcl > 0) {
                        $scope.myForm.blFeeCWT = $scope.myForm.blFee / Number($scope.myForm.unitFcl);
                    } else {
                        $scope.myForm.blFeeCWT = 0;
                    }
                }
            };
            $scope.getDocumentCosting = (type) => {
                if (type == 'DOC') {
                    if (!$scope.myForm.packedIn || !$scope.myForm.unitFcl) {
                        swal("Error", 'Please fill FCL/Shipments and unit FCL first.', "error");
                    } else {
                        $scope.myForm.documentCostingCWT = ($scope.myForm.documentCosting || 0) / ((Number($scope.myForm.unitFcl) || 0) * $scope.myForm.packedIn);
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
                }

        // else if (type == 'Inline Freight') {
        //     if ($scope.myForm.inlineFreight == 'Intermodal VCR') {
        //         $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalVCR;
        //     } else if ($scope.myForm.inlineFreight == 'Intermodal MTL') {
        //         $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalMTL;
        //     } else if ($scope.myForm.inlineFreight == 'Hoppercar') {
        //         $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalVCR;
        //     } else if ($scope.myForm.inlineFreight == 'Boxcar') {
        //         $scope.myForm.inlineFreightCWT = $scope.freightSettingPrice[0].intermodalVCR;
        //     }
        // }
                else if (type == 'Target') {
                    $scope.myForm.underTarget = $scope.myForm.netFOBCAD - $scope.myForm.targetFOBCAD;
                }
                $scope.myForm.priceUSD = ($scope.myForm.pricePerCWT - ($scope.myForm.totalBlFeeCWT + $scope.myForm.documentCostingCWT + $scope.myForm.insuranceRateCWT + $scope.myForm.ariPolicyCWT)) * $scope.myForm.qtyCWT;

                if ($scope.myForm.priceUSD) {
                    $scope.myForm.priceCAD = $scope.myForm.priceUSD * $scope.myForm.exchangeRate;
                    $scope.myForm.cadCWT = $scope.myForm.priceCAD / $scope.myForm.qtyCWT;
                }
                if (!$scope.myForm.netFOBCAD) {
                    $scope.myForm.netFOBCAD = ($scope.myForm.cadCWT || 0) - (($scope.myForm.interestRateCWT || 0) + (Number($scope.myForm.stuffingCWT) || 0) + ($scope.myForm.inlineFreightCWT || 0) + (Number($scope.myForm.bagCostCWT)) + (Number($scope.myForm.coaCost) || 0) + (Number($scope.myForm.stuffingBuffer) || 0) + (Number($scope.myForm.missCostCWT1) || 0) + (Number($scope.myForm.missCostCWT2) || 0) + (Number($scope.myForm.missCostCWT3) || 0));
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


            if ($stateParams.buyerId && $stateParams.contractNumber) {
                salesContractHttpServices.getsalesContractDetails($stateParams.contractNumber, $scope.token, $stateParams.buyerId).then(function(res) {
                        if (res.data.status == 200) {
                            spinnerService.hide("html5spinner");
                            $scope.myForm = res.data.data;

                            $scope.myForm.blFee = $scope.myForm.blFee || 0;
                            $scope.myForm.blFeeCWT = $scope.myForm.blFeeCWT || 0;

                            if ($scope.myForm.unitFcl) {
                                $scope.myForm.blFeeCWT = $scope.myForm.blFee / Number($scope.myForm.unitFcl);
                            }

                            $scope.myForm.documentCosting = $scope.myForm.documentCosting || 90;
                            $scope.myForm.documentCostingCWT = $scope.myForm.documentCostingCWT || 0;

                            if ($scope.myForm.unitFcl && $scope.myForm.packedIn) {
                                $scope.myForm.documentCostingCWT = $scope.myForm.documentCosting / (Number($scope.myForm.unitFcl) * $scope.myForm.packedIn);
                            }

                            calculatePriceCWT();
                            calculateCurrencyBasesPrice();
                            $scope.calculateBrokerCommissionPrice();


                            // if ($scope.myForm.loadingPortId.loadingPortName == 'Vancouver' || $scope.myForm.loadingPortId.loadingPortName == 'Montreal') {
                            //     $scope.myForm.oceanFreightBL = $scope.myForm.oceanFreightBL || 0;
                            //     $scope.myForm.oceanFreightCWT = $scope.myForm.oceanFreightCWT || 0;

                            // } else {
                            // if (!$scope.myForm.salesStampGenerated) {
                            if ($scope.myForm.loadingPortId && $scope.myForm.destination && $scope.myForm.equipmentType && $scope.myForm.freightCompanyId) {
                                $scope.initFreight($scope.myForm.loadingPortId._id, $scope.myForm.destination, $scope.myForm.equipmentType._id, $scope.myForm.freightCompanyId, $scope.myForm.loadingPortId.loadingPortName);
                            }
                            // }
                            // }

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

                            $scope.myForm.noOfShipment = res.data.data.shipmentScheldule.length;

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
                            $scope.myForm.certificateAnalysis = $scope.myForm.certificateAnalysis._id;
                            $scope.myForm.cropYear = res.data.data.cropYear;
                            $scope.myForm.date = moment(res.data.data.date).format('YYYY-MM-DD');
                        } else {
                            spinnerService.hide("html5spinner");
                            swal("Error", res.data.userMessage, "error");
                        }
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            }


            function updatePrice() {
                $scope.myForm.packingUnit = $scope.myForm.packingUnit._id;
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
                    $scope.myForm.netFOBCAD = ($scope.myForm.cadCWT || 0) - (($scope.myForm.interestRateCWT || 0) - (Number($scope.myForm.stuffingCWT) || 0) - ($scope.myForm.inlineFreightCWT || 0) - (Number($scope.myForm.bagCostCWT)) - (Number($scope.myForm.coaCost) || 0) - (Number($scope.myForm.stuffingBuffer) || 0) - (Number($scope.myForm.missCostCWT1) || 0) - (Number($scope.myForm.missCostCWT2) || 0) - (Number($scope.myForm.missCostCWT3) || 0));
                }
            }

            $scope.submit = () => {

                $scope.myForm.shipmentScheldule = $scope.shipmentScheldule;
                $scope.myForm.salesStampGenerated = true;

                spinnerService.show("html5spinner");
                salesContractHttpServices.addsalesContract($scope.myForm, $scope.token).then(function(res) {
                        spinnerService.show("html5spinner");
                        if (res.data.status == 200) {
                            $scope.myForm = {};
                            $scope.commoditySampleAnalysis = [];
                            $state.go('salesContract');
                        }
                    },
                    function(error) {
                        spinnerService.show("html5spinner");
                    });
            };
        });