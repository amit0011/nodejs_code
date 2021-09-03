angular.module('myApp.salesStamp', [])
    .controller('salesStampCtrl',
        function(
            $scope,
            salesContractHttpServices,
            $state,
            $stateParams,
            spinnerService,
            commonService,
            httpService,
            freightSettingHttpService,
            freightHttpServices,
            imageUrl,
            pricingHttpServices
        ) {
            $scope.myForm = {};
            $scope.active = {
                page: 'salesContract'
            };
            $scope.backShow = false;
            var pageNo = 1;

            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.imagePath = imageUrl;
            $scope.myForm.date = moment(new Date()).format('YYYY-MM-DD');

            $scope.checkLists = commonService.salesCheckLists();

            freightSettingHttpService.getfreightSetting(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.freightSettingPrice = res.data.data.docs;
                }
                $scope.getSalesStampDetails();
            });

            function getFreightSettingValue(loadingPort) {
                var value = 0;
                if (loadingPort == 'Montreal') {
                    value = $scope.freightSettingPrice[0].intermodalMTL;
                } else if (loadingPort == 'Vancouver') {
                    value = $scope.freightSettingPrice[0].intermodalVCR;
                }
                return value;
            }

            $scope.yesNoList = [
                {index: 0, value: 'No'},
                {index: 1, value: 'Yes'}
            ];

            $scope.whyOnHoldList = [
                'Buyers Call',
                'Sample Approval',
                'Signed Contract',
                'Letter of Credit',
                'AR Insurance Approval',
                'Tags',
                'Import Permit',
                'Other'
            ];

            $scope.getGrade = function(id, defaultGrade) {
                if (id) {
                    spinnerService.show("html5spinner");

                    httpService.getCallAsGrade(id, $scope.token).then(function(res) {
                        $scope.callAsGrades = res.data.status == 200 ? res.data.data : [];
                        $scope.callAsGrades.unshift(defaultGrade);
                        spinnerService.hide("html5spinner");
                    });
                } else {
                    $scope.callAsGrades = [defaultGrade];
                }
            };

            $scope.initFreight = (loadingPortId, destination, equipmentId, freightCompanyId, loadingPortName) => {
                var obj = {
                    equipmentId: equipmentId,
                    loadingPortId: loadingPortId,
                    city: destination,
                    freightCompanyId: freightCompanyId,
                    include: true,
                };
                freightHttpServices.freightCompanyList(obj, $scope.token).then(function(res) {
                        $scope.freightList = res.data.status == 200 ? res.data.data : [];
                        var freightCompany = freightCompanyId || $scope.freightList[0];
                        if (freightCompany) {
                            $scope.myForm.blFee = freightCompany.blFee || 0;

                            $scope.flag = false;
                            if (['Vancouver', 'Montreal', 'Out-Mtl', 'Out-VCR'].includes($scope.myForm.loadingPortId.loadingPortName)) {
                                $scope.flag = true;
                            }

                            if ($scope.flag) {
                                $scope.myForm.freightCWT = getFreightSettingValue($scope.myForm.loadingPortId.loadingPortName);

                                if ($scope.myForm.packingUnit.bulkBag == 'Bag') {
                                    $scope.myForm.oceanFreightBL = freightCompany.oceanFreight.bagToBag;
                                } else if ($scope.myForm.packingUnit.bulkBag == 'Bulk') {
                                    $scope.myForm.oceanFreightBL = freightCompany.oceanFreight.bulkToBulk;
                                } else {
                                    $scope.myForm.oceanFreightBL = freightCompany.oceanFreight.bulkToBag;
                                }

                                $scope.myForm.oceanFreightCWT = ($scope.myForm.unitFcl ? $scope.myForm.oceanFreightBL / $scope.myForm.unitFcl : 0).toFixed(4) - 0;
                                $scope.myForm.totalBlFeeCWT = (Number($scope.myForm.oceanFreightCWT) + Number($scope.myForm.blFeeCWT) + (Number($scope.myForm.commisionCWT) || 0)).toFixed(4) - 0;
                                $scope.myForm.oceanFreightCWTUSD = (Number($scope.myForm.blFeeCWT) + (Number($scope.myForm.freightCWT) || 0)).toFixed(4) - 0;
                                $scope.myForm.inlineFreightCWT = $scope.myForm.freightCWT;
                            } else {
                                if ($scope.myForm.packingUnit.bulkBag == 'Bag') {
                                    $scope.myForm.freightCWT = freightCompany.freightCWT.bagToBag;

                                } else if ($scope.myForm.packingUnit.bulkBag == 'Bulk') {
                                    $scope.myForm.freightCWT = freightCompany.freightCWT.bulkToBulk;

                                } else {
                                    $scope.myForm.freightCWT = freightCompany.freightCWT.bulkToBag;
                                }
                                $scope.myForm.oceanFreightBL = 0;

                                $scope.myForm.oceanFreightCWT = 0;
                                $scope.myForm.totalBlFeeCWT = (Number($scope.myForm.oceanFreightCWT) + Number($scope.myForm.blFeeCWT) + (Number($scope.myForm.commisionCWT) || 0)).toFixed(4) - 0;
                                $scope.myForm.oceanFreightCWTUSD = ($scope.myForm.blFeeCWT + ($scope.myForm.freightCWT || 0)).toFixed(4) - 0;
                                $scope.myForm.inlineFreightCWT = ($scope.myForm.freightCWT * $scope.myForm.exchangeRate).toFixed(4) - 0;
                            }

                            $scope.calculateInlandFreightCWT();
                        }
                        next_calculation();
                    },
                    function(error) {
                        //console.log(JSON.stringify(error));
                    });
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
                d.exchangeRate = Number($scope.myForm.exchangeRate) - (Number($scope.myForm.exchangeDeduction) * totalMonthDiff);
                d.exchangeRate = (d.exchangeRate.toFixed(4)).toString();
            };

            $scope.getCommissionType = type => {
                switch (type) {
                    case '%':
                        return '%';
                    case '$':
                        return '/CWT';
                    default:
                        return '/MT';
                }
            };

            $scope.calculateOceanFreightBLMT = () => {
                $scope.myForm.oceanFreightCWT = ($scope.myForm.oceanFreightBL/$scope.myForm.unitFcl).toFixed(4) - 0;

                $scope.calculateFreightCWT();
            };

            $scope.calculateFreightCWT = () => {
                const { commisionCWT, oceanFreightCWT, blFeeCWT } = $scope.myForm;
                $scope.myForm.totalBlFeeCWT = commisionCWT + oceanFreightCWT + blFeeCWT;

                $scope.calculatePrice();
            };

            $scope.calculatePrice = () => {
                const {
                    totalBlFeeCWT,
                    documentCostingCWT,
                    lcCostCWT,
                    insuranceRateCWT,
                    ariPolicyCWT,
                    pricePerCWT,
                    qtyCWT
                } = $scope.myForm;
                const price = (pricePerCWT.toFixed(2) -
                    (
                        (totalBlFeeCWT.toFixed(4) - 0) +
                        (documentCostingCWT.toFixed(4) - 0) +
                        (lcCostCWT.toFixed(4) - 0) +
                        (insuranceRateCWT.toFixed(4) - 0) +
                        (ariPolicyCWT.toFixed(4) - 0)
                    ))*qtyCWT.toFixed(2);

                $scope.myForm.priceUSD = (Math.round(price*100)/100).toFixed(2);

                if ($scope.myForm.priceUSD) {
                    var priceCAD = 0;
                    $scope.shipmentScheldule.forEach((val) => {
                      priceCAD += (val.ship * val.exchangeRate * $scope.myForm.priceUSD / 100);
                    });
                    $scope.myForm.priceCAD = priceCAD.toFixed(2);
                    $scope.myForm.cadCWT = ($scope.myForm.priceCAD / $scope.myForm.qtyCWT).toFixed(4) - 0;
                }

                $scope.calculateInterestAndFOB();
            };

            $scope.calculateInterestAndFOB = () => {
                $scope.myForm.interestRateCWT = ((($scope.myForm.interestDays / 365) * ($scope.myForm.interestRate / 100)) * $scope.myForm.cadCWT).toFixed(4) - 0;

                $scope.myForm.netFOBCAD = ($scope.myForm.cadCWT || 0) - (($scope.myForm.interestRateCWT || 0) + (Number($scope.myForm.stuffingCWT) || 0) + ($scope.myForm.inlineFreightCWT || 0) + (Number($scope.myForm.bagCostCWT)) + (Number($scope.myForm.coaCost) || 0) + (Number($scope.myForm.stuffingBuffer) || 0) + (Number($scope.myForm.missCostCWT1) || 0) + (Number($scope.myForm.missCostCWT2) || 0)) + (Number($scope.myForm.adjustment) || 0) - ($scope.myForm.totalCheckListPrice || 0);

                $scope.myForm.netFOBCAD = $scope.myForm.netFOBCAD ? +($scope.myForm.netFOBCAD.toFixed(4)) : 0

                $scope.myForm.underTarget = $scope.myForm.netFOBCAD - $scope.myForm.targetFOBCAD;
            };

            $scope.getPlantIns = function (checkLists) {
              if (!(checkLists && Array.isArray(checkLists))) return '';
              return checkLists.filter(cl => cl.checked).map(cl => cl.name).join(', ');
            };

            $scope.getTargetFOB = function () {
                if (
                    $scope.myForm.targetFOBCAD ||
                    !($scope.myForm.commodityId && $scope.myForm.gradeId && $scope.myForm.cropYear)
                ) {
                    return;
                }

                pricingHttpServices.getTargetFOB(
                        $scope.token,
                        $scope.myForm.commodityId._id,
                        $scope.myForm.gradeId._id,
                        $scope.myForm.cropYear
                    )
                    .then(function(res) {
                        if (res.data.status == 200) {
                            $scope.myForm.targetFOBCAD = res.data.data;
                        } else {
                            $scope.myForm.targetFOBCAD = '';
                        }
                        $scope.myForm.underTarget = $scope.myForm.netFOBCAD - $scope.myForm.targetFOBCAD;
                    });
            };

            $scope.calculateCheckListSum = function () {
              var totalPrice = $scope.myForm.checkLists.reduce((acc, curr) => {
                return curr.checked ? acc + curr.price : acc;
              }, 0);
              $scope.myForm.totalCheckListPrice = $scope.myForm.unitFcl ? +(totalPrice / $scope.myForm.unitFcl).toFixed(4) : null;
              $scope.calculateInterestAndFOB();
            };

            $scope.getSalesStampDetails = () => {
                if ($stateParams.buyerId && $stateParams.contractNumber) {
                    salesContractHttpServices.getsalesContractDetails($stateParams.contractNumber, $scope.token, $stateParams.buyerId).then(function(res) {
                            if (res.data.status == 200) {
                                spinnerService.hide("html5spinner");
                                $scope.myForm = _.clone(res.data.data);
                                $scope.getGrade($scope.myForm.commodityId._id,$scope.myForm.gradeId);

                                $scope.getTargetFOB();

                                $scope.freightOption = '';
                                if ($scope.myForm.freightCompanyId) {
                                    $scope.freightOption = `${$scope.myForm.freightCompanyId.freightCompanyId.freightCompanyName} ${$scope.myForm.freightCompanyId.shiplineId ? $scope.myForm.freightCompanyId.shiplineId.shipLineName : ''}`;
                                }
                                if ($scope.myForm.loadingPortId) {
                                    $scope.freightOption += ' ' + $scope.myForm.loadingPortId.loadingPortName;
                                }
                                if ($scope.myForm.equipmentId) {
                                    $scope.freightOption += ' ' + $scope.myForm.equipmentId.equipmentName;
                                }

                                $scope.myForm.checkLists = ($scope.myForm.checkLists && $scope.myForm.checkLists.length) ? $scope.myForm.checkLists.map(clst => {
                                  var checkList = $scope.checkLists.find(cl => cl.code === clst.code);
                                  return checkList ? {...clst, name: checkList.name} : clst;
                                }) : _.clone($scope.checkLists);
                                $scope.myForm.ariPolicy = +($scope.myForm.ariPolicy || 0).toFixed(4);
                                $scope.myForm.lcCost = +($scope.myForm.lcCost || 0).toFixed(4);
                                $scope.myForm.insuranceRate = +($scope.myForm.insuranceRate || 0).toFixed(4);
                                $scope.myForm.exchangeRate = +($scope.myForm.exchangeRate || 0).toFixed(4);
                                $scope.myForm.interestRate = +($scope.myForm.interestRate || 0).toFixed(2);
                                $scope.myForm.interestDays = +($scope.myForm.interestDays || 0).toFixed(0);
                                $scope.myForm.stuffingCWT = +($scope.myForm.stuffingCWT || 0).toFixed(0);
                                $scope.myForm.stuffingBuffer = +($scope.myForm.stuffingBuffer || 0).toFixed(4);
                                $scope.myForm.missCostCWT2 = +($scope.myForm.missCostCWT2 || 0).toFixed(4);
                                $scope.myForm.targetFOBCAD = +($scope.myForm.targetFOBCAD || 0).toFixed(4);

                                if (!$scope.myForm.salesStampGenerated) {

                                    if ($scope.myForm.amountUnit) {
                                        if ($scope.myForm.amountUnit == "MT") {
                                            $scope.myForm.pricePerCWT = ($scope.myForm.amount / 22.0462).toFixed(4) - 0;
                                            $scope.myForm.pricePerMT = $scope.myForm.amount;

                                        } else if ($scope.myForm.amountUnit == "Lbs" || $scope.myForm.amountUnit == "LBS") {

                                            $scope.myForm.pricePerCWT = ($scope.myForm.amount * 100).toFixed(4) - 0;
                                            $scope.myForm.pricePerMT = ($scope.myForm.pricePerCWT * 22.0462).toFixed(4) - 0;


                                        } else if ($scope.myForm.amountUnit == "Bu" || $scope.myForm.amountUnit == "BU") {
                                            $scope.myForm.pricePerCWT = ($scope.myForm.amount * (100 / $scope.myForm.commodityId.commodityWeight)).toFixed(4) - 0;
                                            $scope.myForm.pricePerMT = ($scope.myForm.pricePerCWT * 22.0462).toFixed(4) - 0;

                                        } else {
                                            $scope.myForm.pricePerCWT = $scope.myForm.amount.toFixed(4) - 0;
                                            $scope.myForm.pricePerMT = ($scope.myForm.pricePerCWT * 22.0462).toFixed(4) - 0;
                                        }
                                    }

                                    if ($scope.myForm.units) {
                                        if ($scope.myForm.units == "MT") {
                                            $scope.myForm.qtyCWT = ($scope.myForm.contractQuantity * 22.0462).toFixed(2) - 0;
                                            $scope.myForm.qtyMT = ($scope.myForm.contractQuantity).toFixed(2) - 0;
                                        } else if ($scope.myForm.units == "LBS" || $scope.myForm.units == "Lbs") {
                                            $scope.myForm.qtyCWT = ($scope.myForm.contractQuantity / 100).toFixed(2) - 0;
                                            $scope.myForm.qtyMT = ($scope.myForm.qtyCWT / 22.0462).toFixed(2) - 0;
                                        } else if ($scope.myForm.units == "Bu" || $scope.myForm.units == "BU") {
                                            $scope.myForm.qtyCWT = ($scope.myForm.contractQuantity / (100 / $scope.myForm.commodityId.commodityWeight)).toFixed(2) - 0; //*bu weight can be found in commodity settings
                                            $scope.myForm.qtyMT = ($scope.myForm.qtyCWT  / 22.0462).toFixed(2) - 0;
                                        } else {
                                            $scope.myForm.qtyCWT = ($scope.myForm.contractQuantity).toFixed(2) - 0;
                                            $scope.myForm.qtyMT = ($scope.myForm.qtyCWT / 22.0462).toFixed(2) - 0;
                                        }
                                    }

                                    if ($scope.myForm.contractCurrency) {
                                        if ($scope.myForm.contractCurrency == 'CAD') {
                                            $scope.myForm.priceCwtUSD = ($scope.myForm.pricePerCWT / $scope.myForm.exchangeRate).toFixed(4) - 0;
                                            $scope.myForm.priceMT = (($scope.myForm.priceCwtUSD * $scope.myForm.exchangeRate) * 22.0462).toFixed(4) - 0;
                                        } else {
                                            $scope.myForm.priceCwtUSD = ($scope.myForm.pricePerCWT).toFixed(4) - 0;
                                            $scope.myForm.priceMT = ($scope.myForm.priceCwtUSD * 22.0462).toFixed(4) - 0;
                                        }
                                    }

                                    $scope.myForm.insuranceRate = ($scope.myForm.insuranceRate || 0.0025).toFixed(4) - 0;
                                    $scope.myForm.insuranceRateCWT = (($scope.myForm.insuranceRate || 0) * $scope.myForm.priceCwtUSD).toFixed(4) - 0;


                                    if ($scope.myForm.commissionType == "%") {
                                        $scope.myForm.brokerageCWT = $scope.myForm.priceCwtUSD * (Number($scope.myForm.brokerCommision) / 100);
                                    } else if($scope.myForm.commissionType == "$") {
                                        $scope.myForm.brokerageCWT = $scope.myForm.brokerCommision || 0;
                                    } else {
                                        $scope.myForm.brokerageCWT = ($scope.myForm.brokerCommision/22.0462) || 0;
                                    }

                                    $scope.myForm.brokerageCWT = $scope.myForm.brokerageCWT && (Number($scope.myForm.brokerageCWT)).toFixed(4);
                                    $scope.myForm.commisionCWT = Number($scope.myForm.brokerageCWT);

                                    $scope.initFreight($scope.myForm.loadingPortId._id, $scope.myForm.destination, $scope.myForm.equipmentType._id, $scope.myForm.freightCompanyId);

                                } else {
                                    if ($scope.myForm.shipmentScheldule && $scope.myForm.shipmentScheldule.length > 0) {
                                        $scope.shipmentScheldule = $scope.myForm.shipmentScheldule;
                                        $scope.shipmentScheldule.forEach((val) => {
                                            val.ship = ((val.quantity * 100) / Number($scope.myForm.contractQuantity)).toFixed(2);
                                            val.end_date = moment(val.endDate).add(1, 'M').format('YYYY-MM');
                                            $scope.calculateExchageRate(val);
                                        });
                                    }

                                    $scope.myForm.noOfShipment = $scope.myForm.shipmentScheldule.length;
                                    $scope.myForm.bagCostType = $scope.myForm.packingUnit.name;
                                }

                            } else {
                                spinnerService.hide("html5spinner");
                                swal("Error", res.data.userMessage, "error");
                            }
                        },
                        function(error) {
                            //console.log(JSON.stringify(error));
                        });
                }
            };

            $scope.calculateInlandFreightCWT = function () {
                if ($scope.myForm.equipmentType && $scope.myForm.equipmentType.equipmentType == 'Inland' && $scope.myForm.freightCompanyId) {
                  if ($scope.myForm.contractCurrency === 'CAD') {
                    $scope.myForm.inlineFreightCWT = $scope.myForm.freightCompanyId.oceanFreight.bagToBag / $scope.myForm.unitFcl;
                  } else {
                    $scope.myForm.inlineFreightCWT = $scope.myForm.freightCompanyId.freightWithBlFee.bagToBag * $scope.myForm.exchangeRate / $scope.myForm.unitFcl;
                  }
                }
            };

            function next_calculation() {

                $scope.myForm.blFee = $scope.myForm.blFee || 0;
                $scope.myForm.blFeeCWT = (($scope.myForm.blFee * $scope.myForm.shipmentScheldule.length) / $scope.myForm.qtyCWT).toFixed(4) - 0;

                $scope.myForm.documentCosting = $scope.myForm.documentCosting || 90;
                $scope.myForm.documentCostingCWT = $scope.myForm.documentCostingCWT || 0;

                if ($scope.myForm.unitFcl && $scope.myForm.packedIn) {
                    $scope.myForm.documentCostingCWT = ($scope.myForm.documentCosting / ((Number($scope.myForm.unitFcl) || 0) * $scope.myForm.packedIn)).toFixed(4) - 0;
                }
                $scope.myForm.interestRate = $scope.myForm.interestRate || 8;

                $scope.myForm.interestDays = $scope.myForm.interestDays || 35;

                if ($scope.myForm.shipmentScheldule && $scope.myForm.shipmentScheldule.length > 0) {
                    $scope.shipmentScheldule = $scope.myForm.shipmentScheldule;
                    $scope.shipmentScheldule.forEach((val) => {
                        val.ship = ((val.quantity * 100) / Number($scope.myForm.contractQuantity)).toFixed(2);
                        val.end_date = moment(val.endDate).add(1, 'M').format('YYYY-MM');
                        $scope.calculateExchageRate(val);
                    });
                }

                $scope.myForm.noOfShipment = $scope.myForm.shipmentScheldule.length;


                $scope.myForm.ariPolicy = ($scope.myForm.ariPolicy || 0.0030).toFixed(4) - 0;
                $scope.myForm.ariPolicyCWT = ($scope.myForm.ariPolicy * $scope.myForm.priceCwtUSD).toFixed(4) - 0;


                $scope.myForm.lcCost = $scope.myForm.lcCost || 0;
                $scope.myForm.lcCostCWT = (($scope.myForm.lcCost / 100) * $scope.myForm.pricePerCWT).toFixed(4) - 0;

                $scope.myForm.stuffingCWT = $scope.myForm.stuffingCWT || 0;

                $scope.inlandFrtStuffingBuffer = $scope.inlandFrtStuffingBuffer || 756;

                //stuffing_cost as stuffingBuffer
                $scope.myForm.stuffingBuffer = $scope.myForm.stuffingBuffer || 0;

                $scope.myForm.bagCostType = $scope.myForm.packingUnit.name;
                $scope.myForm.bagCostCWT = $scope.myForm.packingUnit.bagCost;

                $scope.myForm.coaCost = 0;
                if ($scope.myForm.certificateAnalysis && $scope.myForm.certificateAnalysis.cost) {
                    $scope.myForm.coaCost = $scope.myForm.certificateAnalysis.cost * $scope.myForm.noOfShipment / $scope.myForm.qtyCWT;
                }
                $scope.myForm.coaCost = $scope.myForm.coaCost.toFixed(4);

                $scope.myForm.certificateAnalysisName = $scope.myForm.certificateAnalysis.certificateName;

                $scope.myForm.date = moment($scope.myForm.date).format('YYYY-MM-DD');

                $scope.calculatePrice();

            }

            $scope.submit = (valid) => {
                if($scope.myForm.netFOBCAD < 0) {
                    swal("Alert", "Net FOB can't be negative.", "error");
                    return;
                }
                if (valid) {
                    $scope.myForm.shipmentScheldule = $scope.shipmentScheldule;
                    $scope.myForm.salesStampGenerated = true;

                    spinnerService.show("html5spinner");
                    delete $scope.myForm.totalBlFeeCWT;
                    salesContractHttpServices.updateSalesStamp($scope.myForm, $scope.token).then(function(res) {
                            spinnerService.show("html5spinner");
                            if (res.data.status == 200) {
                                var buyerId = $scope.myForm.buyerId._id;
                                $scope.myForm = {};
                                $scope.commoditySampleAnalysis = [];
                                $state.go('buyerDetails', {buyerId: buyerId});
                            }
                        },
                        function(error) {
                            spinnerService.show("html5spinner");
                        });
                }
            };

            $scope.isAdjustmentNoteRequired = () => {
                return !!Number($scope.myForm.adjustment);
            };


            $scope.getDocumentCosting = (type) => {

                if (type == 'blFee') {
                    if ($scope.myForm.blFee && $scope.myForm.blFee > 0) {
                        $scope.myForm.blFeeCWT = (($scope.myForm.blFee * $scope.myForm.shipmentScheldule.length) / $scope.myForm.qtyCWT).toFixed(4) - 0;
                    } else {
                        $scope.myForm.blFeeCWT = 0;
                    }

                } else if (type == 'DOC') {
                    if (!$scope.myForm.packedIn || !$scope.myForm.unitFcl) {
                        swal("Error", 'Please fill FCL/Shipments and unit FCL first.', "error");
                    } else {
                        $scope.myForm.documentCostingCWT = (($scope.myForm.documentCosting || 0) / ((Number($scope.myForm.unitFcl) || 0) * $scope.myForm.packedIn)).toFixed(4) - 0;
                    }
                } else if (type == 'LC') {
                    $scope.myForm.lcCostCWT = (($scope.myForm.lcCost / 100) * $scope.myForm.pricePerCWT).toFixed(4) - 0;
                } else if (type == 'Insurance') {
                    $scope.myForm.insuranceRateCWT = ($scope.myForm.insuranceRate * $scope.myForm.priceCwtUSD).toFixed(4) - 0;
                } else if (type == 'ARI') {
                    $scope.myForm.ariPolicyCWT = ($scope.myForm.ariPolicy * $scope.myForm.priceCwtUSD).toFixed(4) - 0;
                } else if (type == 'Interest') {
                    if ($scope.myForm.interestDays && $scope.myForm.cadCWT) {
                        $scope.myForm.interestRateCWT = (((Number($scope.myForm.interestDays) / 365) * (Number($scope.myForm.interestRate) / 100)) * $scope.myForm.cadCWT).toFixed(4) - 0;
                    }
                } else if (type == 'Target') {
                    $scope.myForm.underTarget = $scope.myForm.netFOBCAD - $scope.myForm.targetFOBCAD;
                }

                $scope.calculateFreightCWT();


            };
        });
