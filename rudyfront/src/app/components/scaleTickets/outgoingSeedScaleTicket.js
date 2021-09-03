angular.module('myApp.outgoingSeedScaleTicket', [])
    .controller('outgoingSeedScaleTicketCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            httpService,
            $state,
            $stateParams,
            $timeout,
            spinnerService,
            $location,
            buyerHttpServices,
            salesContractHttpServices,
            sudAdminHttpService,
            binHttpService,
            apiUrl,
            $rootScope,
            imageUrl) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.truckScale || !data.truckScale.outgoing || !data.truckScale.outgoing.viewMenu || !data.truckScale.outgoing.add) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });
            $scope.imagePath = imageUrl;
            $scope.imageUrl = imageUrl;

            $scope.myForm = {
                growerId: $stateParams.growerId
            };
            $scope.selected = {};
            $scope.arr = [];
            $scope.allChecked = true;
            $scope.requestForTicket = false;
            var i, item;
            var arrObj;
            var pageNo = 1;
            var inputHide = false;
            $scope.showAllow = false;
            $scope.showMoisture = false;
            $scope.grossTaken = false;
            $scope.tareTaken = false;
            $scope.backToIncoming = () => {
                $state.go('scaleTicket', {
                    type: 'outgoing'
                });
            };
            $scope.growerId = $stateParams.growerId;
            $scope.ticketNumber = $stateParams.ticketNumber;
            $scope.type = $scope.ticketNumber ? 'Edit' : 'Add';
            $scope.contractType = 'Production Contract';
            $scope.sizeKabuli = 'hide';

            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));

            function initCommodity() {
                httpService.getCommodity($scope.token).then(function(res) {
                    $scope.commoditys = res.data.status == 200 ? res.data.data : [];
                    if ($scope.ticketNumber) {
                        $scope.scaleTicketDetails();
                    }
                });
            }

            initCommodity();

            httpService.growerDetails($scope.growerId, $scope.token).then(function(res) {
                $scope.growerList = res.data.status == 200 ? res.data.data : [];
            });

            $scope.getPurchaseContract = () => {
                if ($scope.myForm.commodityId && $scope.myForm.growerId) {
                    scaleTicketHttpServices
                        .getProductionContractList($scope.myForm.commodityId, $scope.myForm.growerId, $scope.token)
                        .then((res) => {
                            $scope.productionContractList = res.data.status == 200 ? res.data.data : [];
                        });
                }
            };

            $scope.getContractInfo = () => {
                if ($scope.myForm.contractNumber) {
                    $scope.details = $scope.productionContractList.filter(function(data) {
                        return data.contractNumber == $scope.myForm.contractNumber;
                    });
                    if ($scope.details && $scope.details[0]) $scope.myForm.gradeId = $scope.details[0].gradeId;
                }
            };

            $scope.getGrade = (id, type) => {

                $scope.getPurchaseContract();

                httpService.getGrade('', id, $scope.token).then(function(res) {
                    $scope.grades = res.data.status == 200 ? res.data.data : [];
                });

                if (!$scope.myForm.analysis) {
                    $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                        return hero._id == id;
                    });
                    $scope.commodityShipmentAnalysis = $scope.commodityGrades[0].commodityShipmentAnalysis;

                }

                if ($scope.myForm.analysis) {
                    $timeout(function() {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == id;
                        });
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
                }
            };

            sudAdminHttpService.getreceiver('', $scope.token, 'RECEIVER').then(function(res) {
                $scope.receiverList = res.data.status == 200 ? res.data.data : [];
            });

            $scope.changeStatus = () => {
                if ($scope.myForm.receiptType == 'Special Bin Elevator Receipt') {
                    $scope.myForm.ticketStatus = 'SPECIAL';
                } else if ($scope.myForm.receiptType == 'Interim Primary Elevator Recipt') {
                    $scope.myForm.ticketStatus = 'INTERIM';
                } else if ($scope.myForm.receiptType == 'Primary Elevator Recipt') {
                    $scope.myForm.ticketStatus = 'PRIMARY';
                }   else if ($scope.myForm.receiptType == 'Non CGA Grain') {
                    $scope.myForm.ticketStatus = 'Non CGA Grain';
                } else if ($scope.myForm.receiptType == 'Non Producer Purchase') {
                    $scope.myForm.ticketStatus = 'Non Producer Purchase';      
                } else if ($scope.myForm.receiptType == 'Void') {
                    $scope.myForm.ticketStatus = 'VOID';
                }
            };


            binHttpService.getbin($scope.token, '').then(function(res) {
                $scope.binList = res.data.status == 200 ? res.data.data : [];
            });

            scaleTicketHttpServices.getTrucker($scope.token).then(function(res) {
                $scope.truckerList = res.data.status == 200 ? res.data.data : [];
            });


            scaleTicketHttpServices.getTrackWeight($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.showLightbulb = res.data.data.weight > 0 ? 'green' : 'red';
                }
            });

            $scope.scaleTicketDetails = function() {
                if ($scope.ticketNumber) {
                    scaleTicketHttpServices.getScaleTicketDetails($scope.ticketNumber, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.myForm = res.data.data;
                            $scope.myForm.scaleTicketId = res.data.data._id;
                            $scope.myForm.date = moment($scope.myForm.date).format('YYYY-MM-DD');
                            $scope.grossTaken = Boolean($scope.myForm.grossWeight);
                            $scope.tareTaken = Boolean($scope.myForm.tareWeight);

                            $scope.ticketType = $scope.myForm.ticketType;
                            
                            if (res.data.data.growerId) {
                                $scope.myForm.growerId = $scope.myForm.growerId._id;
                            }

                            $scope.myForm.commodityId = $scope.myForm.commodityId._id;

                            $scope.myForm.analysisList = res.data.data.analysis;
                            $scope.myForm.analysis = res.data.data.analysis;
                            if ($scope.myForm.analysis.length == 0) {
                                delete $scope.myForm.analysis;
                            }
                            $scope.getGrade($scope.myForm.commodityId, '');
                            if (res.data.data.gradeId) {
                                $scope.myForm.gradeId = $scope.myForm.gradeId._id;
                            }

                            $scope.myForm.binNumber = $scope.myForm.binNumber ? $scope.myForm.binNumber._id : null;
                            $scope.myForm.inTimeFormat = moment(res.data.data.inTime).format("hh:mm:ss A");
                            $scope.myForm.exitTimeFormat = moment(res.data.data.exitTime).format("hh:mm:ss A");

                            if (res.data.data.moisture > 16) {
                                $scope.myForm.moistureAdjustment = res.data.data.moistureAdjustment;
                                $scope.myForm.moistureAdjustmentWeight = res.data.data.moistureAdjustmentWeight;
                                $scope.showMoisture = true;
                            }

                            if (res.data.data.truckingCompany) {
                                $scope.myForm.truckingCompany = res.data.data.truckingCompany._id;
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

                            $scope.previous_analysisCompleted = angular.copy($scope.myForm.analysisCompleted);

                            if ($scope.myForm.analysisCompleted) {
                                var div = document.createElement("div");
                                div.className += "overlay";
                                var myEl = document.getElementById('outgoingSeedScalesTicket');
                                myEl.appendChild(div);
                            }
                            $scope.oldData = angular.copy($scope.myForm);
                        }
                    });
                }
            };

            $scope.calculateWeightMT = (type) => {
                if (!$scope.myForm.commodityId || !$scope.myForm.growerId) {
                    swal("Alert!", 'Please select commodity and grower first!', "error");
                } else {
                    if (type == 'gross') {
                        $scope.myForm.grossWeightMT = $scope.myForm.grossWeight / 1000;
                        $scope.myForm.inTime = moment();
                        $scope.myForm.inTimeFormat = moment().format("hh:mm:ss A");
                        $scope.myForm.contractNumber = $scope.myForm.contractNumber;
                        $scope.myForm.ticketType = $scope.ticketType;
                        $scope.myForm.contractType = $scope.contractType;
                    }
                    if (type == 'tara') {
                        $scope.myForm.tareWeightMT = $scope.myForm.tareWeight / 1000;
                        $scope.myForm.date = moment().format('YYYY-MM-DD');
                        $scope.myForm.exitTime = moment();
                        $scope.myForm.exitTimeFormat = moment().format("hh:mm:ss A");
                        if (!$scope.myForm.ticketNumber) {
                            if ($scope.requestForTicket == false) {
                                $scope.requestForTicket = true;
                                scaleTicketHttpServices.generateScaleTicketId($scope.myForm, $scope.token, 'Outgoing').then(function(res) {
                                    if (res.data.status == 200) {
                                        $scope.myForm.ticketNumber = res.data.data.ticketNumber;
                                        $scope.myForm.scaleTicketId = res.data.data._id;
                                    }
                                });
                            }
                        }
                    }

                    if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                        $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                        $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
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

            $scope.getGrossWeight = (type) => {
                if (!$scope.myForm.contractNumber) {
                    swal("Alert!", 'Please select contract first!', "error");
                } else {
                    scaleTicketHttpServices.getTrackWeight($scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            if (res.data.data.weight > 0) {
                                if (type == 'tare') {
                                    // if (!$scope.myForm.tareWeight) {
                                        $scope.myForm.tareWeight = res.data.data.weight;
                                        $scope.calculateWeightMT('tara');
                                        if ($scope.myForm.ticketNumber) {
                                            $scope.submit('tara');
                                        }
                                    // }
                                } else {
                                    // if (!$scope.myForm.grossWeight) {
                                        $scope.myForm.grossWeight = res.data.data.weight;
                                        $scope.calculateWeightMT('gross');
                                        // if ($scope.myForm.ticketNumber) {
                                        //     $scope.submit('gross');
                                        // }
                                    // }
                                }

                            }
                        }
                    });
                }
            };

            var all_keys = ['contractNumber','gradeId','weigher','dockageBy','buyerAddressId','receiptType','vehicleInstected',
            'infestationCheck','specificationMet','analysisCompleted','void','allow','contractExtra',
            'partyContract','trackUnit','seal','cleanBinNumber','lotNumber','invoiceNumber','moistureAdjustment',
            'moistureAdjustmentWeight','date','inTime','exitTime','binNumber','moisture','size','size7', 'size8', 'size9', 'size10',
            'truckingCompany','truckerBL','containeNumber','grossWeight','grossWeightMT','tareWeight','tareWeightMT',
            'unloadWeidht','unloadWeidhtMT','comments','printComment','bagId','numberOfBags','bagsWeight',
            'weightOfBags','totalPackagingWeight','palletsWeight','numberOfPallets','weightOfPallets','targetWeight',
            'cardboardSlipWeight','countOfCardboardSlip','weightOfCardboardSlip','netWeightPerBag','plasticeWeight',
            'countOfPlastic','weightOfPlastic','overUnderTarget','bulkHeadWeight','countOfBulkHead','weightOfBulkHead',
            'cardboardLength','weightOfCardboard','weightOfOtherPackage','productWeight'];

            $scope.submit = (type) => {
                $scope.changeStatus();
                if (!$scope.myForm.ticketNumber) {
                    swal("Here's a message!", 'With out ticket number you can not submit.', "error");
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
                    ticketNumber: $scope.myForm.ticketNumber,
                    contractType: $scope.contractType,
                    displayOnTicket: $scope.myForm.displayOnTicket,
                    commodityId: $scope.myForm.commodityId,
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
                    ticketType: 'Outgoing',
                    scaleTicketId: $scope.myForm.scaleTicketId,
                    sizeKabuli: sizeKabuli,
                    growerId: $scope.myForm.growerId,
                    containerNumber: $scope.myForm.containerNumber
                };
                if (!$scope.myForm.scaleTicketId) {
                    scaleTicketHttpServices.addScaleTicket(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            if (type == 'tare' || type == 'gross') {
                                $scope.myForm.scaleTicketId = res.data.data._id;
                            } else {
                                $scope.myForm = {};
                                $scope.commodityDeliveryAnalysis = [];
                                $state.go('outgoing');
                            }
                        }
                    });
                } else {
                    var changed_key = [];                        
                    if(typeof $scope.oldData === 'undefined') {
                        $scope.oldData = {};
                    }
                    for (var i = 0; i < all_keys.length; i++) {
                        if ($scope.oldData[all_keys[i]] != $scope.myForm[all_keys[i]]) {
                            changed_key.push(all_keys[i]);
                        }
                    }
                    if (typeof $scope.oldData.analysis === 'undefined' || $scope.oldData.analysis.length != $scope.commodityShipmentAnalysis.length) {
                        changed_key.push("commodityShipmentAnalysis");
                    } else {
                        for (var j = 0; j < $scope.commodityShipmentAnalysis.length; j++) {
                            var commDA = $scope.commodityShipmentAnalysis[j];
                            var changed = false;
                            for (var d = 0; d < $scope.oldData.analysis.length; d++) {
                                if (commDA.analysisName == $scope.oldData.analysis[d].analysisId.analysisName) {
                                    if ((commDA.value != $scope.oldData.analysis[d].value) && (commDA.value || $scope.oldData.analysis[d].value)) {
                                        changed_key.push("commodityShipmentAnalysis");
                                        changed = true;
                                        break;
                                    }
                                }
                            }
                            if (changed) {
                                break;
                            }
                        }
                    }
                    $scope.myForm.someFieldValueChangedInOutgoingSeed = changed_key.length ? true : false;

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
                    $scope.myForm._id = $scope.myForm.scaleTicketId;
                    $scope.myForm.contractType = $scope.contractType;
                    $scope.myForm.ticketType = 'Outgoing';
                    scaleTicketHttpServices.updateScaleTicket($scope.myForm, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            if (type == 'tare' || type == 'gross') {} else {
                                $scope.myForm = {};
                                $scope.commodityDeliveryAnalysis = [];
                                $state.go('outgoing');
                            }
                        }
                    });
                }
            };

        });