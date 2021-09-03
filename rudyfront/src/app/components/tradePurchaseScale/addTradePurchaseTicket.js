angular.module('myApp.addTradePurchaseTicket', [])
    .controller('addTradePurchaseTicketCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            tradePurchaseScaleHttpServices,
            httpService,
            $state,
            $stateParams,
            $timeout,
            spinnerService,
            buyerHttpServices,
            sudAdminHttpService,
            binHttpService,
            $rootScope
        ) {
            $scope.$on('access', (event, data) => {
                if (!data || !data.truckScale || !data.truckScale.tradePurchase || (!data.truckScale.tradePurchase.add || !data.truckScale.tradePurchase.edit)) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            $scope.type = $stateParams.buyerId ? 'add' : 'Edit';

            $scope.myForm = {buyerId: $stateParams.buyerId};

            var arrObj;
            var pageNo = 1;
            $scope.showAllow = false;
            $scope.showMoisture = false;

            $scope.contractType = 'TradePurchase';
            $scope.sizeKabuli = 'hide';

            $scope.getBuyerList = function(commodityId) {
                if (commodityId) {
                    scaleTicketHttpServices.getBuyerListByCommodity('', commodityId, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            //console.log(res.data.data);
                            $scope.buyerListByCommodity = res.data.data;
                        }
                    });
                }
            };

            $scope.getSalesContractList = function(commodityId, buyerId) {
                if (commodityId && buyerId) {
                    var data = {
                        commodityId: commodityId,
                        buyerId: buyerId
                    };
                    scaleTicketHttpServices.getSalesContractListByCommodity(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.salesContractList = res.data.data;
                        }
                    });
                }
            };

            $scope.buyerId = $stateParams.buyerId;
            $scope.scaleId = $stateParams.scaleId;

            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));

            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            });

            $scope.initBuyer = (buyerId) => {
                if (buyerId) {
                    buyerHttpServices.getBuyerList(buyerId, $scope.token).then(function(res) {
                        $scope.buyerList = res.data.status == 200 ? res.data.data : [];
                    });
                }
            };

            if ($scope.type == 'add') {
                $scope.initBuyer($scope.buyerId);
            }

            $scope.getContractList = function() {

                if ($scope.myForm.commodityId && $scope.myForm.buyerId) {
                    spinnerService.show("html5spinner");
                    tradePurchaseScaleHttpServices
                        .getContractList($scope.myForm.buyerId, $scope.myForm.commodityId, $scope.token)
                        .then(function(res) {
                            $scope.contractList = res.data.status == 200 ? res.data.data : [];
                            spinnerService.hide("html5spinner");
                        });
                }
                $scope.getBuyerList($scope.myForm.commodityId);
            };

            $scope.getContractInfo = () => {

                if ($scope.myForm.commodityId) {
                    $scope.getGrade($scope.myForm.commodityId);
                    $scope.commodityShipAnal($scope.myForm.commodityId, 'add');

                }

                if ($scope.myForm.contractNumber) {
                    $scope.contractList.forEach((val) => {
                        if (val.contractNumber == $scope.myForm.contractNumber) {
                            $scope.selectedContract = val;
                        }
                    });

                    if ($scope.type == 'add') {
                        $scope.getTicketNumber();
                        $scope.myForm.gradeId = $scope.selectedContract.gradeId;

                        $scope.commoditys.forEach((val) => {
                            if (val._id == $scope.myForm.commodityId) {
                                if (val.commodityName == 'Kabuli Chick Pea') {
                                    $scope.sizeKabuli = 'show';
                                } else {
                                    $scope.sizeKabuli = 'hide';
                                }
                            }
                        });
                    }

                }
            };

            $scope.getGrade = (id, type) => {
                httpService.getGrade('', id, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.grades = res.data.data;
                    }
                });
            };

            $scope.commodityShipAnal = (commodityId, type) => {

                if (type == 'Edit') {
                    $timeout(function() {

                        $scope.commodityShipmentAnalysis = $scope.myForm.analysis.map(function(elem) {
                            return {
                                analysisName: elem.analysisId.analysisName,
                                _id: elem.analysisId._id,
                                value: elem.value,
                                weight: elem.weight,
                                weightMT: elem.weightMT
                            };
                        });
                    }, 300);
                } else {
                    $timeout(function() {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == commodityId;
                        });

                        $scope.commodityShipmentAnalysis = $scope.commodityGrades[0].commodityShipmentAnalysis;
                    }, 300);
                }

            };

            sudAdminHttpService.getreceiver(pageNo, $scope.token, 'RECEIVER').then(function(res) {
                if (res.data.status == 200) {
                    $scope.receiverList = res.data.data;
                }
            });

            binHttpService.getbin($scope.token, '').then(function(res) {
                if (res.data.status == 200) {
                    $scope.binList = res.data.data;
                }
            });

            scaleTicketHttpServices.getTrackWeight($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    if (res.data.data.weight > 0) {
                        $scope.showLightbulb = 'green';
                    } else {
                        $scope.showLightbulb = 'red';
                    }
                }
            });

            scaleTicketHttpServices.getTrucker($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.truckerList = res.data.data;
                } else {
                    console.log('err', JSON.stringify(res.data));
                }
            });

            $scope.getTicketNumber = () => {
                tradePurchaseScaleHttpServices.generateTicketNumber($scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.myForm.ticketNumber = (Number(res.data.data[0].ticketNumber) + 1).toString();
                        if ($scope.myForm.ticketNumber.length == 1) {
                            $scope.myForm.ticketNumber = "000" + $scope.myForm.ticketNumber;
                        } else if ($scope.myForm.ticketNumber.length == 2) {
                            $scope.myForm.ticketNumber = "00" + $scope.myForm.ticketNumber;
                        } else if ($scope.myForm.ticketNumber.length == 3) {
                            $scope.myForm.ticketNumber = "0" + $scope.myForm.ticketNumber;
                        }
                    } else {
                        $scope.myForm.ticketNumber = "0001";
                    }

                });
            };

            if ($scope.scaleId && $scope.type != 'add') {
                tradePurchaseScaleHttpServices.getScaleTicketDetails($scope.scaleId, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.myForm = res.data.data;
                        $scope.myForm.date = moment($scope.myForm.date).format('YYYY-MM-DD');

                        $scope.myForm.analysisList = res.data.data.analysis;
                        $scope.myForm.analysis = res.data.data.analysis;
                        if ($scope.myForm.analysis.length == 0) {
                            delete $scope.myForm.analysis;
                        }
                        $scope.myForm.commodityName = $scope.myForm.commodityId.commodityName;
                        $scope.myForm.commodityId = $scope.myForm.commodityId._id;
                        $scope.getGrade($scope.myForm.commodityId);
                        $scope.commodityShipAnal($scope.myForm.commodityId, 'Edit');
                        $scope.initBuyer($scope.myForm.buyerId);
                        $scope.getContractList();
                        $scope.getSalesContractList($scope.myForm.commodityId, $scope.myForm.salesBuyerId);
                        $scope.myForm.inTimeFormat = moment(res.data.data.inTime).format("hh:mm:ss A");
                        $scope.myForm.exitTimeFormat = moment(res.data.data.exitTime).format("hh:mm:ss A");
                        if (res.data.data.moisture > 16) {
                            $scope.myForm.moistureAdjustment = res.data.data.moistureAdjustment;
                            $scope.myForm.moistureAdjustmentWeight = res.data.data.moistureAdjustmentWeight;
                            $scope.showMoisture = true;
                        }

                        if ($scope.myForm.commodityName == "Kabuli Chick Peas") {
                            $scope.sizeKabuli = 'show';
                            $scope.myForm.size7 = res.data.data.sizeKabuli[0].size7 || 0;
                            $scope.myForm.size8 = res.data.data.sizeKabuli[0].size8 || 0;
                            $scope.myForm.size9 = res.data.data.sizeKabuli[0].size9 || 0;
                            $scope.myForm.size10 = res.data.data.sizeKabuli[0].size10 || 0;
                        } else {
                            $scope.sizeKabuli = 'hide';
                        }
                    }
                });
            }

            $scope.calculateWeightMT = (type) => {
                if (!$scope.myForm.contractNumber) {
                    swal("Alert!", 'Please select contract first!', "error");
                } else {
                    if (type == 'gross') {
                        $scope.myForm.grossWeightMT = $scope.myForm.grossWeight / 1000;
                        $scope.myForm.inTime = moment();
                        $scope.myForm.inTimeFormat = moment().format("hh:mm:ss A");
                        if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                            $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                            $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
                        }

                    }
                    if (type == 'tara') {
                        $scope.myForm.tareWeightMT = $scope.myForm.tareWeight / 1000;
                        if (!$scope.myForm._id) {
                          $scope.myForm.date = moment().format('YYYY-MM-DD');
                          $scope.myForm.exitTime = moment();
                          $scope.myForm.exitTimeFormat = moment().format("hh:mm:ss A");
                        }
                        if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                            $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                            $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
                        }
                    }
                }
            };

            $scope.calculateMoisture = (weightMT) => {
                for (var i = 0; i < $scope.commodityShipmentAnalysis.length; i++) {
                    if ($scope.commodityShipmentAnalysis[i].analysisName == 'Dockage') {
                        $scope.sampleweight = $scope.commodityShipmentAnalysis[i].weightMT;
                    }
                }
                if ($scope.myForm.gradeId) {
                    for (var j = 0; j < $scope.grades.length; j++) {
                        if ($scope.grades[j].gradeName == '#1 Damp' || $scope.grades[j].gradeName == '#2 Damp') {
                            if ($scope.myForm.moisture > 16) {
                                $scope.myForm.moistureAdjustment = $scope.myForm.moisture - 16;
                                $scope.showMoisture = true;
                                if ($scope.sampleweight) {
                                    $scope.myForm.moistureAdjustmentWeight = ((($scope.myForm.unloadWeidht - ($scope.sampleweight || weightMT)) * $scope.myForm.moistureAdjustment / 100) / 1000);
                                }
                            } else {
                                $scope.showMoisture = false;
                            }
                        } else {
                            $scope.showMoisture = false;
                        }
                    }
                } else {
                    $scope.showMoisture = false;
                }
            };

            $scope.changeStatus = () => {
                if ($scope.myForm.receiptType == 'Special Bin Elevator Receipt') {
                    $scope.myForm.ticketStatus = 'SPECIAL';
                } else if ($scope.myForm.receiptType == 'Interim Primary Elevator Recipt') {
                    $scope.myForm.ticketStatus = 'INTERIM';
                } else if ($scope.myForm.receiptType == 'Primary Elevator Recipt') {
                    $scope.myForm.ticketStatus = 'PRIMARY';
                // }  else if ($scope.myForm.receiptType == 'Non CGA Grain') {
                //     $scope.myForm.ticketStatus = 'Non CGA Grain';
                } else if ($scope.myForm.receiptType == 'Non Producer Purchase') {
                    $scope.myForm.ticketStatus = 'Non Producer Purchase';  
                } else if ($scope.myForm.receiptType == 'Void') {
                    $scope.myForm.ticketStatus = 'VOID';
                }
            };
            $scope.submit = () => {
                $scope.changeStatus();

                if (!$scope.myForm.ticketNumber) {
                    swal("Here's a message!", 'With out ticket number you can not submit.', "error");
                    return;
                } else if (!$scope.myForm.contractNumber) {
                    swal("Here's a message!", 'With out contract number you can not submit.', "error");
                    return;
                }
                var sizeKabuli = [];
                arrObj = $scope.commodityShipmentAnalysis.map(function(elem) {
                    return {
                        analysisId: elem._id,
                        value: elem.value,
                        weight: elem.weight,
                        weightMT: elem.weightMT
                    };
                });
                if ($scope.myForm.commodityName == "Kabuli Chick Peas") {
                    sizeKabuli = [{
                        size7: Number($scope.myForm.size7) || 0,
                        size8: Number($scope.myForm.size8) || 0,
                        size9: Number($scope.myForm.size9) || 0,
                        size10: Number($scope.myForm.size10) || 0,
                    }];
                }
                var data = {
                    contractNumber: $scope.myForm.contractNumber,
                    commodityId: $scope.myForm.commodityId,
                    ticketNumber: $scope.myForm.ticketNumber,
                    gradeId: $scope.myForm.gradeId,
                    weigher: $scope.myForm.weigher,
                    dockageBy: $scope.myForm.dockageBy,
                    receiptType: $scope.myForm.receiptType,
                    specificationMet: $scope.myForm.specificationMet,
                    splitTotal: $scope.myForm.splitTotal,
                    splitTotalWeight: $scope.myForm.splitTotalWeight,
                    dockageCompleted: $scope.myForm.dockageCompleted,
                    netWeight: $scope.myForm.netWeight,
                    netTotalWeight: $scope.myForm.netTotalWeight,
                    date: moment($scope.myForm.date),
                    inTime: $scope.myForm.inTime,
                    exitTime: $scope.myForm.exitTime,
                    binNumber: $scope.myForm.binNumber,
                    size: $scope.myForm.size,
                    truckingCompany: $scope.myForm.truckingCompany,
                    truckerBL: $scope.myForm.truckerBL,
                    grossWeight: $scope.myForm.grossWeight,
                    grossWeightMT: $scope.myForm.grossWeightMT,
                    tareWeight: $scope.myForm.tareWeight,
                    tareWeightMT: $scope.myForm.tareWeightMT,
                    unloadWeidht: $scope.myForm.unloadWeidht,
                    unloadWeidhtMT: $scope.myForm.unloadWeidhtMT,
                    comments: $scope.myForm.comments,
                    analysis: arrObj,
                    _id: $scope.myForm._id,
                    sizeKabuli: sizeKabuli,
                    buyerId: $scope.myForm.buyerId,
                    containerNumber: $scope.myForm.containerNumber,
                    referenceNo: $scope.myForm.referenceNo,
                    salesContractNumber: $scope.myForm.salesContractNumber,
                    salesBuyerId: $scope.myForm.salesBuyerId,
                };

                if (!$scope.myForm._id) {
                    tradePurchaseScaleHttpServices.addTradePurchaseScale(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.goToBuyerDetail(res.data.data.buyerId);
                        }
                    });
                } else {
                    arrObj = $scope.commodityShipmentAnalysis.map(function(elem) {
                        return {
                            analysisId: elem._id,
                            value: elem.value,
                            weight: elem.weight,
                            weightMT: elem.weightMT
                        };
                    });
                    sizeKabuli = [{
                        size7: Number($scope.myForm.size7) || 0,
                        size8: Number($scope.myForm.size8) || 0,
                        size9: Number($scope.myForm.size9) || 0,
                        size10: Number($scope.myForm.size10) || 0,
                    }];
                    $scope.myForm.sizeKabuli = sizeKabuli;
                    $scope.myForm.analysis = arrObj;
                    $scope.myForm.date = moment($scope.myForm.date);
                    $scope.myForm.inTime = moment($scope.myForm.inTime);
                    $scope.myForm.exitTime = moment($scope.myForm.exitTime);
                    $scope.myForm.contractNumber = $scope.myForm.contractNumber;
                    tradePurchaseScaleHttpServices.updateTradePurchaseScale($scope.myForm, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                          $state.go('tradePurchaseScale');
                        }
                    });
                }
            };

            $scope.goToBuyerDetail = function(buyer) {
              if (!buyer) return;
              var buyerId = typeof buyer === 'object' ? buyer._id : buyer;
              $state.go('buyerDetails', {
                buyerId: buyerId
              });
            };
        });
