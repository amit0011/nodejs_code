angular.module('myApp.addQuote', [])
    .controller('addQuoteCtrl', function($scope,
        spinnerService,
        quoteHttpService,
        $stateParams,
        httpService,
        $timeout,
        buyerHttpServices,
        brokerHttpService,
        loadingPortHttpService,
        shippingTermsHttpService,
        freightHttpServices,
        freightCompanyHttpServices,
        freightSettingHttpService,
        bagsHttpService,
        equipmentHttpService,
        currencyHttpService,
        $state,
        weatherHttpService
    ) {
        $scope.active = {
            page: 'quote'
        };
        $scope.myForm = {
            currency: 'USD'
        };
        $scope.columns = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        $scope.rowArray = [{}];
        $scope.commodityRowArray = [{}];
        $scope.myForm.commission = '0';
        $scope.myForm.ariPolicy = 0;
        $scope.myForm.insurance = 0;


        //@ Add new column
        $scope.addNewCol = (col) => {
            if (col.loadingPortId && col.equipmentId && col.shippingtermsId &&
                col.freightById && col.destinationPort && col.bagId && col.weightType) {
                $scope.rowArray.push({});
            }
        };

        // remove column
        $scope.removeCol = function(index) {
            $scope.rowArray.splice(index, 1);
            $scope.countTotalPrice();
        };

        // add new commodity row
        $scope.addNewRow = (index) => {
            $scope.commodityRowArray.push({});
        };

        // remove commodity row
        $scope.removeRow = function(index) {
            $scope.commodityRowArray.splice(index, 1);
            $scope.countTotalPrice();
        };

        // get user type
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.userId = $stateParams.userId;
        if ($stateParams.type == 'buyer') {
            $scope.req = {
                type: $stateParams.type,
                userId: $stateParams.userId
            };
        } else if ($stateParams.type == 'broker') {
            $scope.req = {
                type: $stateParams.type,
                userId: $stateParams.userId
            };
        }

        $scope.token = JSON.parse(localStorage.getItem('token'));

        var keyArr = $scope.columns;

        weatherHttpService.getWeather($scope.token).then(function(res) {
            $scope.weather = res.data.status == 200 ? res.data.data : null;
        });

        currencyHttpService.getcurrency($scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.currencyList = res.data.data[0].currencyCADUSD;
                $scope.myForm.exchangeRate = $scope.currencyList;
                $scope.currencyUpdate = res.data.data[0].currencyUpdate;
            }
            $scope.currencyList = res.data.status == 200 ? res.data.data[0].currencyCADUSD : [];
        });


        //get freightSetting list
        freightSettingHttpService.getfreightSetting('', $scope.token).then(function(res) {
            $scope.freightSettingList = res.data.status == 200 ? res.data.data : [];
        });

        // get all commodity list
        quoteHttpService.getCommodityFromCommodityPrices($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });


        // get all loading port
        loadingPortHttpService.getLoadingPort('', $scope.token).then(function(res) {
            $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
        });


        // get bags list
        bagsHttpService.getbags('', $scope.token).then(function(res) {
            $scope.bagsList = res.data.status == 200 ? res.data.data : [];
        });



        spinnerService.show("html5spinner");
        var quoteId = $stateParams.quoteId ? $stateParams.quoteId : '';


        quoteHttpService.getQuotesDetails($scope.req, $scope.token).then((objS) => {
            spinnerService.hide("html5spinner");
            if (objS.data.status == 200) {
                var quote = objS.data.data;
                $scope.myForm = {
                    buyerId: quote.buyerId,
                    brokerId: quote.brokerId,
                    interestRate: quote.interestRate,
                    interestDurationDays: quote.interestDurationDays,
                    commission: quote.commission ? quote.commission.toString() : quote.commission,
                    insurance: quote.insurance,
                    premiumDiscount: quote.premiumDiscount,
                    ariPolicy: quote.ariPolicy,
                    currency: quote.currency,
                    exchangeRate: $scope.currencyList
                };

                $scope.rowArray = quote.columnsCol.filter(function(el) {
                    return el != null;
                });

                $scope.rowArray.forEach((val) => {
                    var list = [];
                    var exist = [],
                        new_list = [];
                    val.freightList.forEach((val) => {
                        if (exist.indexOf(val.cityName) == -1) {
                            new_list.push(val);
                            exist.push(val.cityName);
                        }
                    });
                    val.freightList = new_list;
                });

                $scope.commodityRowArray = quote.commoditiesRow.filter(function(el) {
                    return el != null;
                });

                $scope.countTotalPrice();
            }
        }, (objE) => {
            spinnerService.hide("html5spinner");
        });



        //get gradelist bases of selected commodity
        $scope.getGrade = function(id, commArr) {
            if (id && commArr) {
                spinnerService.show("html5spinner");
                quoteHttpService.gradesByCommodity(id, $scope.token).then(function(res) {
                        commArr.grades = res.data.status == 200 ? res.data.data : [];
                        spinnerService.hide("html5spinner");
                    },
                    function(error) {
                        spinnerService.hide("html5spinner");
                    });
            }
            $scope.countTotalPrice();

        };


        // get buyer details if buyerId exit
        if ($scope.req.type == 'buyer') {
            buyerHttpServices.getBuyerDetails($scope.userId, $scope.token).then(function(res) {
                $scope.buyerDetails = res.data.status == 200 ? res.data.data : [];
            });
        } else if ($scope.req.type == 'broker') {
            brokerHttpService.getBrokerDetails($scope.userId, $scope.token).then(function(res) {
                $scope.buyerDetails = res.data.status == 200 ? res.data.data : [];
            });
        }



        // get shipping terms bases of loading port
        $scope.getShippingTerms = (loadingPort, arr, index) => {

            $scope.countTotalPrice();

            if (loadingPort && arr) {
                spinnerService.show("html5spinner");
                shippingTermsHttpService.getshippingTerms('', $scope.token, loadingPort).then(function(res) {
                    arr.shippingTermsList = res.data.status == 200 ? res.data.data : [];
                    spinnerService.hide("html5spinner");
                });

                freightHttpServices.getFreight('', $scope.token, loadingPort).then(function(res) {
                    var list = res.data.status == 200 ? res.data.data : [];
                    var exist = [],
                        new_list = [];
                    list.forEach((val) => {
                        if (exist.indexOf(val.cityName) == -1) {
                            new_list.push(val);
                            exist.push(val.cityName);
                        }
                    });
                    arr.freightList = new_list;
                    spinnerService.hide("html5spinner");
                });

                equipmentHttpService.getEquipment('', $scope.token, loadingPort).then(function(res) {
                    arr.equipmentList = res.data.status == 200 ? res.data.data : [];
                    spinnerService.hide("html5spinner");
                });
            }
        };


        $scope.getCommodityPriceDetails = (commodityObj) => {

            if (commodityObj.commodityId && commodityObj.cropYear && commodityObj.gradeId) {
                var data = {
                    commodityId: commodityObj.commodityId,
                    gradeId: commodityObj.gradeId,
                    cropYear: commodityObj.cropYear
                };
                spinnerService.show("html5spinner");

                quoteHttpService.getCommodityPrice(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        commodityObj.commodityPrices = res.data.data;
                        spinnerService.hide("html5spinner");
                        $scope.countTotalPrice();
                    } else {
                        commodityObj.commodityPrices = null;
                        swal("Alert!", res.data.userMessage, "info");
                        $scope.countTotalPrice();
                        spinnerService.hide("html5spinner");
                    }
                }, function(error) {
                    spinnerService.hide("html5spinner");
                });


            } else {
                $scope.countTotalPrice();
            }
        };


        $scope.getFreightDetails = (commodityRow) => {

            if (commodityRow.equipmentId && commodityRow.loadingPortId && commodityRow.destinationPort) {

                var obj1 = {
                    equipmentId: commodityRow.equipmentId,
                    loadingPortId: commodityRow.loadingPortId,
                    city: commodityRow.destinationPort
                };

                freightHttpServices.freightCompanyList(obj1, $scope.token).then(function(res) {
                    commodityRow.freightCompanyList = res.data.status == 200 ? res.data.data : [];
                });

                if (commodityRow.loadingPortId && commodityRow.equipmentId &&
                    commodityRow.destinationPort && commodityRow.bagId) {

                    if (!commodityRow.freightCompanyList || commodityRow.freightCompanyList.length == 0) {
                        swal("Alert!", "Freight list empty.", "info");
                        return;
                    }

                    $scope.selected_freight = commodityRow.freightCompanyList.find((val) => {
                        return val._id == commodityRow.freightId;
                    });
                    if ($scope.selected_freight)
                        commodityRow.freightById = $scope.selected_freight.freightCompanyId._id;

                    $scope.selected_bag = $scope.bagsList.filter((val) => {
                        return val._id == commodityRow.bagId;
                    });

                    if ($scope.selected_freight && $scope.selected_bag.length && commodityRow.destinationPort != 'FCA Rudy Agro Outlook') {
                        if ($scope.selected_bag[0].bulkBag == 'Bag' && (!$scope.selected_freight.oceanFreight || !$scope.selected_freight.oceanFreight.bagToBag)) {
                            swal("Alert!", "Freight bag type value not exist.", "info");
                            return;
                        } else if ($scope.selected_bag[0].bulkBag == 'Bulk' && (!$scope.selected_freight.oceanFreight || !$scope.selected_freight.oceanFreight.bulkToBulk)) {
                            swal("Alert!", "Freight bulk type value not exist.", "info");
                            return;
                        }
                    }

                    spinnerService.show("html5spinner");
                    var obj = {
                        loadingPortId: commodityRow.loadingPortId,
                        equipmentId: commodityRow.equipmentId,
                        freightCompanyId: commodityRow.freightById,
                        cityName: commodityRow.destinationPort,
                        _id: commodityRow.freightId
                    };
                    quoteHttpService.getFreightDetails(obj, $scope.token).then(function(res) {
                        spinnerService.hide("html5spinner");
                        if (res.data.status == 200) {
                            commodityRow.freightsPrice = res.data.data;
                            if (commodityRow.loadingPortId && commodityRow.equipmentId && commodityRow.freightById &&
                                commodityRow.destinationPort && commodityRow.weightType &&
                                commodityRow.bagId && commodityRow.shippingtermsId) {
                                $scope.countTotalPrice();
                            }
                        } else {
                            swal("Alert!", "Freight price not found", "info");
                        }
                    });
                } else {
                    $scope.countTotalPrice();
                }

            } else {
                $scope.countTotalPrice();
            }
        };


        function getLoadingPortName(loadingPortId) {
            var loadingPortName;
            $scope.loadingPortList.forEach((val) => {
                if (val._id == loadingPortId) {
                    loadingPortName = val.loadingPortName;
                }
            });

            return loadingPortName;
        }

        function getshippingtermsName(shippingtermsId, data) {
            var shippingterms;
            data.forEach((val) => {
                if (val._id == shippingtermsId) {
                    shippingterms = val.term;
                }
            });
            return shippingterms;
        }

        function getequipmentName(equipmentId, data) {
            var equipmentName;
            data.forEach((val) => {
                if (val._id == equipmentId) {
                    equipmentName = val.equipmentName;
                }
            });
            return equipmentName;
        }

        function getBag(bagId, data) {
            var bag = {};
            $scope.bagsList.forEach((val) => {
                if (val._id == bagId) {
                    bag.name = val.bulkBag;
                    bag.bagCost = val.bagCost;
                }
            });
            return bag;
        }


        $scope.countTotalPrice = () => {
            spinnerService.show("html5spinner");
            angular.forEach($scope.rowArray, function(value, key) {
                angular.forEach($scope.commodityRowArray, function(comm, comkey) {
                    if (value && value.loadingPortId && value.equipmentId && value.freightById &&
                        value.destinationPort && value.weightType &&
                        value.bagId && value.shippingtermsId) {

                        var loadingPortName = getLoadingPortName(value.loadingPortId);
                        var shippingterms = getshippingtermsName(value.shippingtermsId, value.shippingTermsList);
                        var equipmentName = getequipmentName(value.equipmentId, value.equipmentList);
                        var bag = getBag(value.bagId);

                        if (value.destinationPort != 'FCA Rudy Agro Outlook') {
                            if (['Montreal', 'Vancouver'].indexOf(loadingPortName) != -1) {
                                if (bag.name == "Bag" && (!value.freightsPrice || !value.freightsPrice.freightUSDMTFOB || !value.freightsPrice.freightUSDMTFOB.bagToBag)) {
                                    delete comm[keyArr[key]];
                                    delete comm[keyArr[key] + 'totalCost'];
                                    swal("Alert!", "Bag price is empty.", "info");
                                    return;
                                } else if (bag.name == "Bulk" && (!value.freightsPrice || !value.freightsPrice.freightUSDMTFOB || !value.freightsPrice.freightUSDMTFOB.bulkToBulk)) {
                                    delete comm[keyArr[key]];
                                    delete comm[keyArr[key] + 'totalCost'];
                                    swal("Alert!", "Bag price is empty.", "info");
                                    return;
                                }
                            } else {
                                if (bag.name == "Bag" && (!value.freightsPrice || !value.freightsPrice.freightMT || !value.freightsPrice.freightMT.bagToBag)) {
                                    delete comm[keyArr[key]];
                                    delete comm[keyArr[key] + 'totalCost'];
                                    swal("Alert!", "Bag price is empty.", "info");
                                    return;
                                } else if (bag.name == "Bulk" && (!value.freightsPrice || !value.freightsPrice.freightMT || !value.freightsPrice.freightMT.bulkToBulk)) {
                                    delete comm[keyArr[key]];
                                    delete comm[keyArr[key] + 'totalCost'];
                                    swal("Alert!", "Bag price is empty.", "info");
                                    return;
                                }
                            }
                        }


                        if (comm && comm.commodityId && comm.gradeId && comm.cropYear) {
                            if (comm.commodityPrices || comm.commodityPrices) {
                                comm.shippingPeriod = comm.commodityPrices.shippingPeriodFrom + '/' + comm.commodityPrices.shippingPeriodTo;
                                comm.shippingPeriodShort = comm.commodityPrices.shippingPeriodFrom.substring(0,3) + '/' + comm.commodityPrices.shippingPeriodTo.substring(0,3);
                                comm.quantity = comm.commodityPrices.priceAsPer == 'Quantity' ? (comm.commodityPrices.quantity + ' ' + comm.commodityPrices.quantityUnit) : comm.commodityPrices.priceAsPer;
                            }

                            spinnerService.hide("html5spinner");

                            if (comm && comm.commodityPrices) {

                                //inlandFreight
                                var inlandFreight = 0,
                                    portPrice = 0,
                                    finalPortPrice = 0;
                                if (loadingPortName == "Montreal") {
                                    inlandFreight = ($scope.freightSettingList[0].intermodalMTL * 22.046) / $scope.currencyList;

                                } else if (loadingPortName == "Vancouver") {
                                    inlandFreight = ($scope.freightSettingList[0].intermodalVCR * 22.046) / $scope.currencyList;

                                } else if (loadingPortName == "Outlook" && shippingterms == "Track MTL") {
                                    inlandFreight = ($scope.freightSettingList[0].intermodalMTL * 22.046) / $scope.currencyList;

                                } else if (loadingPortName == "Outlook" && shippingterms == "Track VCR") {
                                    inlandFreight = ($scope.freightSettingList[0].intermodalVCR * 22.046) / $scope.currencyList;
                                } else {
                                    inlandFreight = 0;
                                }

                                // portPrice=============>

                                if (shippingterms == "CY-MTL" || shippingterms == "CY_VCR") {
                                    portPrice = (($scope.freightSettingList[0].CyUsd / $scope.freightSettingList[0].cwtsFcl) * 22.0462) + inlandFreight;

                                } else if (shippingterms == "Track MTL" || shippingterms == "Track VCR") {
                                    portPrice = inlandFreight;

                                } else if (shippingterms == "FCA Rudy") {
                                    portPrice = 0;

                                } else if (shippingterms == "FOB Saskatoon" && equipmentName == "Hoppercar" && value.destinationPort == "") {
                                    portPrice = ($scope.freightSettingList[0].fobSktnHoppercar * 22.0462) / $scope.currencyList;

                                } else if (shippingterms == "FOB Saskatoon" && equipmentName == "Boxcar" && value.destinationPort == "") {
                                    portPrice = ($scope.freightSettingList[0].fobSktnBoxcar * 22.0462) / $scope.currencyList;

                                } else if (loadingPortName == "Saskatoon" && equipmentName == "Boxcar") {
                                    portPrice = ($scope.freightSettingList[0].fobSktnBoxcar * 22.0462) / $scope.currencyList + (value.freightsPrice.freightMT.bagToBag || 0);

                                } else if (loadingPortName == "Saskatoon" && equipmentName == "Hoppercar") {
                                    portPrice = ($scope.freightSettingList[0].fobSktnHoppercar * 22.0462) / $scope.currencyList + (value.freightsPrice.freightMT.bulkToBag || 0);

                                } else if (shippingterms == "FOB Winnipeg" && equipmentName == "Hoppercar" && value.destinationPort == "") {
                                    portPrice = ($scope.freightSettingList[0].fobWpgHoppercar * 22.0462) / $scope.currencyList;

                                } else if (shippingterms == "FOB Winnipeg" && equipmentName == "Boxcar" && value.destinationPort == "") {
                                    portPrice = ($scope.freightSettingList[0].fobWpgBoxcar * 22.0462) / $scope.currencyList;

                                } else {

                                    if (loadingPortName == "Montreal" || loadingPortName == "Vancouver") {
                                        if (bag.name == "Bag") {
                                            portPrice = value.freightsPrice.freightUSDMTFOB ? value.freightsPrice.freightUSDMTFOB.bagToBag : 0;
                                        } else if (bag.name == "Bulk") {
                                            portPrice = value.freightsPrice.freightUSDMTFOB ? value.freightsPrice.freightUSDMTFOB.bulkToBulk : 0;
                                        }
                                    } else {

                                        if (bag.name == "Bag") {
                                            portPrice = value.freightsPrice.freightMT.bagToBag || 0;
                                        } else if (bag.name == "Bulk") {
                                            portPrice = (value.freightsPrice.freightMT.bulkToBulk || 0);
                                        }
                                    }
                                }


                                if (value.weightType == "CWT") {
                                    finalPortPrice = portPrice / 22.0462;
                                }
                                if (value.weightType == "MT") {
                                    finalPortPrice = portPrice;
                                }
                                var totalCost = 0,
                                    commodityCost = 0,
                                    interestCost = 0,
                                    commodityCostBagAdjustment = 0,
                                    finalCommodityCost = 0,
                                    priceDiscount = 0,
                                    commissionPaid = 0,
                                    priceWithCommission = 0,
                                    insurancePaid = 0,
                                    ariInsurancePaid = 0,
                                    bagCostUsd = 0;

                                if (bag.name == "Bag") {
                                    commodityCost = Number(comm.commodityPrices.bagged_USD_MT_FOBPlant);
                                    commodityCostBagAdjustment = Number(comm.commodityPrices.bagged_USD_MT_FOBPlant);
                                }
                                if (bag.name == "Bulk") {
                                    commodityCost = Number(comm.commodityPrices.bulk_USD_MTFOBPlant);
                                    commodityCostBagAdjustment = Number(comm.commodityPrices.bulk_USD_MTFOBPlant);
                                }

                                if (value.weightType == "CWT") {
                                    finalCommodityCost = commodityCostBagAdjustment / 22.0462;
                                    priceDiscount = (Number($scope.myForm.premiumDiscount) || 0) / 22.0462;
                                    bagCostUsd = Number(bag.bagCost) / $scope.currencyList;

                                }
                                if (value.weightType == "MT") {
                                    finalCommodityCost = commodityCostBagAdjustment;
                                    priceDiscount = (Number($scope.myForm.premiumDiscount) || 0);
                                    // bag cost Usd in mt
                                    bagCostUsd = Number(bag.bagCost) / $scope.currencyList * 22.0462;
                                }

                                if ($scope.myForm.interestRate && $scope.myForm.interestDurationDays) {
                                    interestCost = ((finalPortPrice + finalCommodityCost) * ($scope.myForm.interestRate / 100) * ($scope.myForm.interestDurationDays / 365));
                                }

                                commissionPaid = (interestCost + finalPortPrice + finalCommodityCost) * (Number($scope.myForm.commission || 0) / 100);

                                priceWithCommission = finalPortPrice + finalCommodityCost + interestCost + commissionPaid + priceDiscount;

                                insurancePaid = ($scope.myForm.insurance) * priceWithCommission;

                                ariInsurancePaid = $scope.myForm.ariPolicy * priceWithCommission;

                                if ($scope.myForm.currency == 'CAD') {
                                    finalCommodityCost *= $scope.currencyList;
                                    finalPortPrice *= $scope.currencyList;
                                    interestCost *= $scope.currencyList;
                                    commissionPaid *= $scope.currencyList;
                                    insurancePaid *= $scope.currencyList;
                                    ariInsurancePaid *= $scope.currencyList;
                                    commodityCost *= $scope.currencyList;
                                    bagCostUsd *= $scope.currencyList;
                                }

                                totalCost = finalCommodityCost + finalPortPrice + interestCost + commissionPaid + insurancePaid + ariInsurancePaid + bagCostUsd + priceDiscount + (Number(value.upChange) || 0) + (Number(comm.upCharge) || 0);

                                comm[keyArr[key]] = totalCost;

                                comm[keyArr[key] + 'totalCost'] = {
                                    finalCommodityCost: value.weightType == "CWT" ? (Number(commodityCost) / 22.0462).toFixed(2) : (Number(commodityCost)).toFixed(2), // CC
                                    finalPortPrice: Number(finalPortPrice).toFixed(2), // SC
                                    interestCost: value.weightType == "CWT" ? (Number(interestCost)).toFixed(2) : (Number(interestCost)).toFixed(2), // Int
                                    commissionPaid: value.weightType == "CWT" ? (Number(commissionPaid)).toFixed(2) : (Number(commissionPaid)).toFixed(2), // cmsn
                                    insurancePaid: value.weightType == "CWT" ? (Number(insurancePaid)).toFixed(2) : (Number(insurancePaid)).toFixed(2), // Ins
                                    ariInsurancePaid: value.weightType == "CWT" ? (Number(ariInsurancePaid)).toFixed(2) : (Number(ariInsurancePaid)).toFixed(2), // Ari
                                    bagCostUsd: (Number(bagCostUsd)).toFixed(2), // Bag
                                    priceDiscount: (Number(priceDiscount)).toFixed(2) // Prem
                                };

                                for (var i = $scope.rowArray.length; i < 9; i++) {
                                    if (comm && comm[keyArr[i]]) {
                                        delete comm[keyArr[i]];
                                        delete comm[keyArr[i] + 'totalCost'];
                                    }
                                }

                            } else {

                                if (comm && comm[keyArr[key]]) {
                                    delete comm[keyArr[key]];
                                    delete comm[keyArr[key] + 'totalCost'];
                                }

                            }
                        } else {

                            if (comm && comm[keyArr[key]]) {
                                delete comm[keyArr[key]];
                                delete comm[keyArr[key] + 'totalCost'];
                            }
                        }
                    } else {
                        if (comm && comm[keyArr[key]]) {
                            delete comm[keyArr[key]];
                            delete comm[keyArr[key] + 'totalCost'];
                        }
                    }
                });
            });
            spinnerService.hide("html5spinner");
        };

        $scope.submitData = () => {
            if ($scope.rowArray.length == 0 || $scope.commodityRowArray.length == 0) {
                swal("Alert!", "Select atlist 1 commodity and 1 destination.", "success");
                return;
            }

            var someValueMissing = false;
            if ($scope.rowArray.length) {
                var k = 0;
                var required_fields = ['loadingPortId', 'shippingtermsId', 'destinationPort', 'equipmentId', 'bagId', 'freightById', 'freightId', 'weightType'];
                for (k = 0; k < $scope.rowArray.length; k++) {
                    if (!required_fields.map(field => $scope.rowArray[k][field]).reduce((acc, curr) => acc && curr, true)) {
                        someValueMissing = true;
                        break;
                    }
                }
                if (someValueMissing) {
                    swal("Alert!", `In ${k+1} destination loading port, shipping term , destination prot , equipment , bag , freight & weight type is mandatory.`, "info");
                    return;
                }
            }

            if ($scope.commodityRowArray.length) {

                someValueMissing = false;
                var total_value_mission = false;
                var i = 0, j = 0;
                for (i = 0; i < $scope.commodityRowArray.length; i++) {
                    for (j = 0; j < $scope.rowArray.length; j++) {
                        if (!$scope.commodityRowArray[i].commodityId || !$scope.commodityRowArray[i].gradeId || !$scope.commodityRowArray[i].cropYear) {
                            someValueMissing = true;
                            break;
                        }
                        if (!$scope.commodityRowArray[i][keyArr[j]] || !$scope.commodityRowArray[i][keyArr[j] + 'totalCost']) {
                            total_value_mission = true;
                            break;
                        }
                    }
                    if (someValueMissing || total_value_mission) {
                        break;
                    }
                }

                if (someValueMissing) {
                    swal("Alert!", `In ${i+1} commodity row commodity, grade & crop year mandatory.`, "info");
                    return;
                }
                if (total_value_mission) {
                    swal("Alert!", `${i+1} row and ${j+1} column commodity total value is not exist`, "info");
                    return;
                }
            }

            var rowArray = angular.copy($scope.rowArray);

            var commodityRowArray = angular.copy($scope.commodityRowArray);

            rowArray.forEach((val) => {
                if (val) {
                    if (val.shippingTermsList) delete val.shippingTermsList;
                    if (val.equipmentList) delete val.equipmentList;
                    if (val.freightList) delete val.freightList;
                    if (val.freightsPrice) delete val.freightsPrice;
                    if (val.freightCompanyList) delete val.freightCompanyList;
                }
            });

            commodityRowArray.forEach((val) => {
                if (val) {
                    if (val.commodityPrices) delete val.commodityPrices;
                    if (val.grades) delete val.grades;
                }
            });

            var row_filtered = commodityRowArray.filter(function(el) {
                return el != null;
            });
            var col_filtered = rowArray.filter(function(el) {
                return el != null;
            });
            var data = {
                interestRate: $scope.myForm.interestRate,
                interestDurationDays: $scope.myForm.interestDurationDays,
                commission: $scope.myForm.commission,
                premiumDiscount: $scope.myForm.premiumDiscount,
                insurance: $scope.myForm.insurance,
                ariPolicy: $scope.myForm.ariPolicy,
                currency: $scope.myForm.currency,
                exchangeRate: $scope.myForm.exchangeRate,
                columnsCol: col_filtered,
                commoditiesRow: row_filtered
            };
            if ($scope.req.type == 'buyer') {
                data.buyerId = $scope.req.userId;
            }
            if ($scope.req.type == 'broker') {
                data.brokerId = $scope.req.userId;
            }
            if ($stateParams.quoteId) {
                data._id = $stateParams.quoteId;
            }

            spinnerService.show("html5spinner");
            quoteHttpService.addquote(data, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    if ($scope.req.type == 'buyer') {
                        $state.go('buyerDetails', {
                            buyerId: $stateParams.userId
                        });
                    } else {
                        $state.go('brokerDetails', {
                            brokerId: $stateParams.userId
                        });
                    }
                    swal("Alert!", "Your quote has been saved.", "success");
                } else {
                    swal("Error", res.data.userMessage, "error");
                }
                spinnerService.hide("html5spinner");
            });

        };
    });
