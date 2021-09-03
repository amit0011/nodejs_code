angular.module('myApp.addOutgoingScaleTicket', [])
    .controller('addOutgoingScaleTicketCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            httpService,
            $state,
            $stateParams,
            $timeout,
            spinnerService,
            containerHttpServices,
            buyerHttpServices,
            freightCompanyHttpServices,
            sudAdminHttpService,
            binHttpService,
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
            $scope.ticketType = 'Outgoing';
            $scope.buyerAddresses =[];
            $scope.myForm = {
                withContractNumber: 'withContractNumber',
                fdaNumber: '13311367720',
                actualFreightCurrency: 'CAD',
                ticketType: 'Outgoing',
                releaseContainer: true,
            };
            $scope.selected = {};
            $scope.arr = [];
            $scope.allChecked = true;
            $scope.ticketNumberRequested = false;

            $scope.freightCompanyList = [];
            var arrObj;
            $scope.showAllow = false;
            $scope.showMoisture = false;
            $scope.grossTaken = false;
            $scope.tareTaken = false;

            $scope.backToOutgoing = (type) => {
                $state.go(type);
            };

            $scope.equipmentTypes = [
                {_id: '53 ft Intermodal', name: '53 ft Intermodal'},
                {_id: '40 ft Intermodal', name: '40 ft Intermodal'},
                {_id: '20 FT sourceload', name: '20 FT sourceload'},
                {_id: '40 ft Sourceload', name: '40 ft Sourceload'},
                {_id: 'Dry Van', name: 'Dry Van'},
                {_id: 'Bulk Truck', name: 'Bulk Truck'},
            ];

            $scope.currencies = ["CAD", "USD"];

            const contractType = 'Sales Contract';
            $scope.contractType = contractType;
            $scope.ticketType = "Outgoing";
            $scope.ticketNumber = $stateParams.ticketNo;
            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.lstatus = 0;

            buyerHttpServices.getBuyer('', $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.buyerList = res.data.data;  
                    if($scope.myForm.buyerId) {
                        $scope.addFcAccountOf($scope.myForm.buyerId);
                    }
                } else {
                    $scope.buyerList = [];
                }
                $scope.lstatus |= 1;
            });

            $scope.sizeKabuli = 'hide';

            sudAdminHttpService.getreceiver('', $scope.token, 'RECEIVER').then(function(res) {
                $scope.receiverList = res.data.status == 200 ? res.data.data : [];
                $scope.lstatus |= 2;
            });

            binHttpService.getbin($scope.token, '').then(function(res) {
                $scope.binList = res.data.status == 200 ? res.data.data : [];
                $scope.lstatus |= 4;
            });

            scaleTicketHttpServices.getTrackWeight($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    if (res.data.data.weight > 0) {
                        $scope.showLightbulb = 'green';
                    } else {
                        $scope.showLightbulb = 'red';
                    }
                }
                $scope.lstatus |= 8;
            });

            $scope.getTicketNumber = () => {
                scaleTicketHttpServices.getScaleTicketNumber($scope.ticketType, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.myForm.ticketNumber = Number(res.data.data.outgoingNumber) + 1;
                    }
                });
            };

            scaleTicketHttpServices.bagList($scope.token).then(function(res) {
                $scope.bagList = [];
                $scope.palletList = [];
                if(res.data.status == 200 ) {
                    for(var i = 0; i < res.data.data.length; i++) {
                        var record = res.data.data[i];
                        if (record.bulkBag == 'Pallet') {
                            $scope.palletList.push(record);
                        } else {
                            $scope.bagList.push(record);
                        }
                    }
                }
                $scope.lstatus |= 16;
            });

            if ($scope.ticketNumber && $scope.ticketNumber != 'add') {
                scaleTicketHttpServices.getScaleTicketDetails($scope.ticketNumber, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.myForm = res.data.data;
                        $scope.analysisCompleted = $scope.myForm.analysisCompleted;
                        if (!$scope.myForm.fdaNumber) {
                            $scope.myForm.fdaNumber = '13311367720';
                        }
                        if (!$scope.myForm.actualFreightCurrency) {
                            $scope.myForm.actualFreightCurrency = 'CAD';
                        }
                        $scope.grossTaken = Boolean($scope.myForm.grossWeight);
                        $scope.tareTaken = Boolean($scope.myForm.tareWeight);
                        $scope.myForm.scaleTicketId = res.data.data._id;
                        if (res.data.data.binNumber) {
                            $scope.myForm.binNumber = res.data.data.binNumber._id;
                        }
                        $scope.myForm.date = moment($scope.myForm.date).format('YYYY-MM-DD');
                        $scope.myForm.contractNumber = $scope.myForm.contractNumber;
                        $scope.ticketType = $scope.myForm.ticketType;
                        $scope.contractType = $scope.myForm.contractType;
                        $scope.buyerAddresses = $scope.myForm.buyerId.addresses;
                        if (res.data.data.buyerId) {
                            $scope.buyerName = $scope.myForm.buyerId.businessName;
                            $scope.myForm.buyerId = $scope.myForm.buyerId._id;
                            $scope.addFcAccountOf($scope.myForm.buyerId);
                        }
                        $scope.myForm.commodityName = $scope.myForm.commodityId.commodityName;
                        $scope.myForm.commodityId = $scope.myForm.commodityId._id;
                        $scope.myForm.analysisList = res.data.data.analysis;
                        $scope.myForm.analysis = res.data.data.analysis;
                        if ($scope.myForm.analysis.length == 0) {
                            delete $scope.myForm.analysis;
                        }
                        $scope.getGrade($scope.myForm.commodityId, 'ticket');
                        if (res.data.data.gradeId) {
                            $scope.myForm.gradeId = $scope.myForm.gradeId._id;
                        }
                        $scope.myForm.scaleTicketId = $scope.myForm._id;
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
                        if ($scope.myForm.commodityName == "Kabuli Chick Peas" || $scope.myForm.commodityName == "Organic Kabuli Chickpeas") {
                            $scope.sizeKabuli = 'show';
                            $scope.myForm.size7 = res.data.data.sizeKabuli[0].size7 || 0;
                            $scope.myForm.size8 = res.data.data.sizeKabuli[0].size8 || 0;
                            $scope.myForm.size9 = res.data.data.sizeKabuli[0].size9 || 0;
                            $scope.myForm.size10 = res.data.data.sizeKabuli[0].size10 || 0;
                        } else {
                            $scope.sizeKabuli = 'hide';
                        }

                        $scope.getContractLists($scope.myForm.commodityId, $scope.myForm.buyerId);

                        if ($scope.myForm.isSplitTicket) {
                            $scope.referenceTicket = $scope.myForm.refTicketId ? $scope.myForm.refTicketId.ticketNumber : '';
                        }

                        if (!$scope.myForm.totalUnloadWeight) {
                                $scope.myForm.totalUnloadWeight = $scope.myForm.unloadWeidht;
                            }

                        $scope.previous_analysisCompleted = angular.copy($scope.myForm.analysisCompleted);

                        $scope.getBagWeight($scope.myForm.bagId);

                        $scope.getContractInfo('edit');
                        $scope.oldData = angular.copy($scope.myForm);
                        $scope.lstatus |= 32;
                    }
                });
            }

            scaleTicketHttpServices.getTrucker($scope.token).then(function(res) {
                $scope.truckerList = res.data.status == 200 ? res.data.data : [];
                $scope.lstatus |= 64;
            });

            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
                $scope.lstatus |= 128;
            });

            $scope.getGrade = (id, type) => {

                httpService.getGrade('', id, $scope.token).then(function(res) {
                    $scope.grades = res.data.status == 200 ? res.data.data : [];
                });

                if (!$scope.myForm.analysis) {
                    $timeout(function() {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == id;
                        });
                        $scope.commodityShipmentAnalysis = $scope.commodityGrades[0].commodityShipmentAnalysis;
                    }, 3000);
                }
                if (type == 'ticket' && $scope.myForm.analysis) {
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
                    }, 3000);
                }
            };

            $scope.getGrossWeight = (type) => {
                if (!$scope.myForm.contractNumber) {
                    swal("Alert!", 'Please select contract first!', "error");
                } else {
                    scaleTicketHttpServices.getTrackWeight($scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            var seconds_delayed = moment().diff(res.data.data.updatedAt, 'seconds');
                            if (res.data.data.weight > 0 && seconds_delayed < 150) {
                                $scope.showLightbulb = 'green';
                                if (type == 'tare') {
                                    if (!$scope.myForm.contractNumber) {
                                        swal("Alert!", 'Please select contract first!', "error");
                                    } else {
                                        // if (!$scope.myForm.tareWeight) {
                                            $scope.myForm.tareWeight = res.data.data.weight;
                                            $scope.calculateWeightMT('tara');
                                            if ($scope.myForm.ticketNumber) {
                                                $scope.submit('tare');
                                            }
                                        // }
                                    }
                                } else {
                                    // if (!$scope.myForm.grossWeight) {
                                        $scope.myForm.grossWeight = res.data.data.weight;
                                        $scope.calculateWeightMT('gross');
                                        // if ($scope.myForm.ticketNumber) {
                                        //     $scope.submit('gross');
                                        // }
                                    // }
                                }
                            } else {
                                $scope.showLightbulb = 'red';
                                $scope.myForm[type == 'tare' ? 'tareWeight' : 'grossWeight'] = 0;
                                swal("Alert!", 'Physical scale data is not updated for a long time!', "error");
                            }
                        }
                    });
                }
            };

            $scope.initStuffer = function(pageNo) {
                spinnerService.show("html5spinner");
                freightCompanyHttpServices.getFreightCompany(pageNo, $scope.token, true).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.stuffers = res.data.data.map(function(company) {
                            company.display = `${company.freightCompanyName} - ${company.addressLine1}, ${company.addressLine2}, ${company.province}, ${company.postalCode}, ${company.country}`;
                            return company;
                        });
                        $scope.lstatus |= 256;
                    }
                    spinnerService.hide("html5spinner");
                });
            };

            $scope.initStuffer('');

            $scope.calculateWeightMT = (type) => {
                if (!$scope.myForm.contractNumber) {
                    swal("Alert!", 'Please select contract first!', "error");
                } else {
                    if (type == 'gross') {
                        $scope.myForm.grossWeightMT = $scope.myForm.grossWeight / 1000;
                        $scope.myForm.exitTime = moment();
                        $scope.myForm.exitTimeFormat = moment().format("hh:mm:ss A");
                        $scope.myForm.contractNumber = $scope.myForm.contractNumber;
                        $scope.myForm.ticketType = $scope.ticketType;
                        $scope.myForm.contractType = contractType;
                        if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                            $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                            $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
                        }
                        // $scope.myForm.productWeight =$scope.myForm.unloadWeidht;
                        $scope.myForm.productWeight =($scope.myForm.unloadWeidht < 0) ? $scope.myForm.unloadWeidht * -1 : $scope.myForm.unloadWeidht; 

                        if($scope.myForm.totalPackagingWeight){
                            $scope.myForm.productWeight = $scope.myForm.unloadWeidht - ($scope.myForm.totalPackagingWeight/1000);
                        }

                    }
                    if (type == 'tara') {
                        $scope.myForm.tareWeightMT = $scope.myForm.tareWeight / 1000;
                        if (!$scope.myForm.scaleTicketId) {
                          $scope.myForm.date = moment().format('YYYY-MM-DD');
                          $scope.myForm.inTime = moment();
                          $scope.myForm.inTimeFormat = moment().format("hh:mm:ss A");
                        }
                        $scope.myForm.ticketType = $scope.ticketType;
                        $scope.myForm.contractType = contractType;
                        if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                            $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                            $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
                        }
                         // $scope.myForm.productWeight =$scope.myForm.unloadWeidht;

                        $scope.myForm.productWeight =  ($scope.myForm.unloadWeidht < 0) ? $scope.myForm.unloadWeidht * -1 : $scope.myForm.unloadWeidht;
                        if($scope.myForm.totalPackagingWeight){
                            $scope.myForm.productWeight = $scope.myForm.unloadWeidht - ($scope.myForm.totalPackagingWeight/1000);
                        }
                        if (!$scope.myForm.ticketNumber && !$scope.ticketNumberRequested) {
                            $scope.ticketNumberRequested = true;
                            scaleTicketHttpServices.generateScaleTicketId($scope.myForm, $scope.token, 'Outgoing').then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.myForm.ticketNumber = res.data.data.ticketNumber;
                                    $scope.myForm.scaleTicketId = res.data.data._id;
                                }
                            });
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

            $scope.fcAccountOfList = ['Rudy Agro Ltd.'];

            $scope.addFcAccountOf = (buyerId) => {
                if (!($scope.buyerList && $scope.buyerList.length > 0)) return;

                const buyer = $scope.buyerList.find(buyer => buyer._id === buyerId);
                $scope.fcAccountOfList = ['Rudy Agro Ltd.', buyer.businessName];
            };

            $scope.addFcAccountOfByContract = function(freightCompany) {
                if (freightCompany && freightCompany.freightCompanyId) {
                    $scope.fcAccountOfList.push(freightCompany.freightCompanyId.freightCompanyName);
                    $scope.myForm.freightBy = freightCompany.freightCompanyId.freightCompanyName;
                    return;
                }
            };

            $scope.changeStatus = () => {
                if ($scope.myForm.receiptType == 'Special Bin Elevator Receipt') {
                    $scope.myForm.ticketStatus = 'SPECIAL';
                } else if ($scope.myForm.receiptType == 'Interim Primary Elevator Recipt') {
                    $scope.myForm.ticketStatus = 'INTERIM';
                } else if ($scope.myForm.receiptType == 'Primary Elevator Recipt') {
                    $scope.myForm.ticketStatus = 'PRIMARY';
                }  else if ($scope.myForm.receiptType == 'Non CGA Grain') {
                    $scope.myForm.ticketStatus = 'Non CGA Grain';
                } else if ($scope.myForm.receiptType == 'Non Producer Purchase') { 
                    $scope.myForm.ticketStatus = 'Non Producer Purchase';      
                } else if ($scope.myForm.receiptType == 'Void') {
                    $scope.myForm.ticketStatus = 'VOID';
                }
            };

            containerHttpServices.searchContainer({onlyContainerNumbers: true}, $scope.token).then(function(res) {
              if (res.data.status == 200) {
                $scope.containerList = res.data.data;
                $scope.lstatus |= 512;
              }
              spinnerService.hide("html5spinner");
            });

            var all_keys = ['contractNumber','gradeId','weigher','dockageBy','buyerAddressId','receiptType','vehicleInstected',
            'infestationCheck','specificationMet','analysisCompleted','void','allow','contractExtra',
            'partyContract','trackUnit','seal','cleanBinNumber','lotNumber','invoiceNumber','moistureAdjustment',
            'moistureAdjustmentWeight','date','inTime','exitTime','binNumber','moisture','size','size7', 'size8', 'size9', 'size10',
            'truckingCompany','truckerBL','containeNumber','releaseContainer','grossWeight','grossWeightMT','tareWeight','tareWeightMT',
            'unloadWeidht','unloadWeidhtMT','comments','printComment','bagId','numberOfBags','bagsWeight',
            'weightOfBags','totalPackagingWeight','palletsWeight','numberOfPallets','weightOfPallets','targetWeight',
            'cardboardSlipWeight','countOfCardboardSlip','weightOfCardboardSlip','netWeightPerBag','plasticeWeight',
            'countOfPlastic','weightOfPlastic','overUnderTarget','bulkHeadWeight','countOfBulkHead','weightOfBulkHead',
            'cardboardLength','weightOfCardboard','weightOfOtherPackage','productWeight', 'analysis'];

            $scope.inputChanged = function(a) {
              $scope.myForm.containeNumber = a;
              $scope.myForm.containerIncomingDate = null;
            };

            $scope.submit = (type, valid) => {
                if ($scope.myForm.scaleTicketId && ($scope.lstatus < 2047 || !$scope.commodityShipmentAnalysis)) {
                  swal('Error', 'Please wait until scale properly gets loaded', 'error');
                  return;
                }
                if (!type) $scope.submitted = true;
                    
                if (valid || type) {

                    $scope.changeStatus();

                    if (!$scope.myForm.ticketNumber) {
                        swal("Here's a message!", 'With out ticket number you can not submit.', "error");
                        return;
                    } else if (!$scope.myForm.contractNumber) {
                        swal("Here's a message!", 'With out contract number you can not submit.', "error");
                        return;
                    }
                    var sizeKabuli = [];

                    if (!type && $scope.sizeKabuli == 'show') {
                        if ($scope.myForm.size7 || $scope.myForm.size8 || $scope.myForm.size9 || $scope.myForm.size10) {
                            var total = Number($scope.myForm.size7) + Number($scope.myForm.size8) + Number($scope.myForm.size9) + Number($scope.myForm.size10);
                            if (Number(total.toFixed(3)) != 100.000) {
                                swal("Error", 'Size 7,8,9,10 total needs to be 100%', "error");
                                return;
                            }
                        }
                    }

                    arrObj = $scope.commodityShipmentAnalysis.map(function(elem) {
                        return {
                            analysisId: elem._id,
                            value: elem.value,
                            weight: elem.weight,
                            weightMT: elem.weightMT
                        };
                    });
                    if ($scope.myForm.commodityName == "Kabuli Chick Peas" || $scope.myForm.commodityName == "Organic Kabuli Chickpeas") {
                        sizeKabuli = [{
                            size7: Number($scope.myForm.size7) || 0,
                            size8: Number($scope.myForm.size8) || 0,
                            size9: Number($scope.myForm.size9) || 0,
                            size10: Number($scope.myForm.size10) || 0,
                        }];
                    }

                    if ($scope.selectedContainerNumber && typeof $scope.selectedContainerNumber === 'object') {
                      $scope.myForm.containerId = $scope.selectedContainerNumber.originalObject._id;
                      $scope.myForm.containeNumber = $scope.selectedContainerNumber.originalObject.containerNumber;
                    } else if ($scope.myForm.containeNumber) {
                      let selectedCN = $scope.containerList.find(cn => cn.containerNumber === $scope.myForm.containeNumber);
                      if (selectedCN) {
                        $scope.myForm.containerId = selectedCN._id;
                      }
                    }

                    if (!$scope.myForm.scaleTicketId) {
                        var data = _.assign({}, $scope.myForm, {
                            contractType: contractType,
                            date: moment(),
                            analysis: arrObj,
                            ticketType: 'Outgoing',
                            sizeKabuli: sizeKabuli,
                            overUnderTarget: $scope.myForm.overUnderTargetpartyContract,
                        });
                        delete data._id;

                        $scope.addRequest = true;
                        scaleTicketHttpServices.addScaleTicket(data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {

                                    if (type == 'tare' || type == 'gross') {
                                        $scope.myForm.scaleTicketId = res.data.data._id;
                                    } else {
                                        $scope.myForm = {};
                                        $scope.commodityShipmentAnalysis = [];
                                        $state.go('outgoing');
                                    }
                                }
                                $scope.addRequest = false;
                            },
                            function(error) {
                                $scope.addRequest = false;
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
                            changed_key.push("analysis");
                        } else {
                            for (var j = 0; j < $scope.commodityShipmentAnalysis.length; j++) {
                                var commDA = $scope.commodityShipmentAnalysis[j];
                                var changed = false;
                                for (var d = 0; d < $scope.oldData.analysis.length; d++) {
                                    if (commDA.analysisName == $scope.oldData.analysis[d].analysisId.analysisName) {
                                        if ((commDA.value != $scope.oldData.analysis[d].value) && (commDA.value || $scope.oldData.analysis[d].value)) {
                                            changed_key.push("analysis");
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
                        $scope.myForm.someFieldValueChangedInOutgoing = changed_key.length ? true : false;

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
                        $scope.myForm.contractNumber = $scope.myForm.contractNumber;
                        $scope.addRequest = true;
                        $scope.myForm.ticketType = 'Outgoing';
                        scaleTicketHttpServices.updateScaleTicket($scope.myForm, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    if (type == 'tare' || type == 'gross') {} else {
                                        $scope.myForm = {};
                                        $scope.commodityShipmentAnalysis = [];
                                        $state.go('outgoing');
                                    }
                                }
                                $scope.addRequest = false;
                            },
                            function(error) {
                                $scope.addRequest = false;
                            });
                    }
                }
            };

            $scope.getBuyerList = (commodityId, growerId) => {
                if (commodityId) {
                    scaleTicketHttpServices.getBuyerListByCommodity(growerId, commodityId, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            //console.log(res.data.data);
                            $scope.buyerListByCommodity = res.data.data;
                        }
                    });
                }
            };

            $scope.getContractLists = function(commodityId, buyerId) {
                if (commodityId && buyerId) {
                    if ($scope.buyerListByCommodity)
                        $scope.buyerAddresses = $scope.buyerListByCommodity.find(buyer => buyer._id == buyerId).addresses;
                        // console.log($scope.buyerAddresses,'nitin');
                    var data = {
                        commodityId: commodityId,
                        buyerId: buyerId
                    };
                    scaleTicketHttpServices.getSalesContractListByCommodity(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            //console.log(res.data.data);
                            $scope.salesContractList = res.data.data;
                        }
                    });
                }
            };

            $scope.getContractInfo = function(type) {
                if ($scope.myForm.contractNumber) {
                    scaleTicketHttpServices.getsalesContract($scope.myForm.contractNumber, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.contractDetailsByNo = res.data.data;
                            $scope.myForm.commodityName = $scope.contractDetailsByNo.commodityId.commodityName;
                            $scope.myForm.commodityId = $scope.contractDetailsByNo.commodityId._id;
                            $scope.myForm.buyerId = $scope.contractDetailsByNo.buyerId._id;
                            $scope.myForm.contractNumber = $scope.contractDetailsByNo.contractNumber;
                            $scope.getGrade($scope.myForm.commodityId);
                            if (type === 'add' && !$scope.myForm.ticketNumber) {
                                $scope.getTicketNumber();
                            }
                            $scope.myForm.gradeId = $scope.contractDetailsByNo.gradeId._id;
                            if ($scope.myForm.commodityName == "Kabuli Chick Peas") {
                                $scope.sizeKabuli = 'show';
                            } else {
                                $scope.sizeKabuli = 'hide';
                            }
                            $scope.addFcAccountOfByContract(res.data.data.freightCompanyId);
                        } else {
                            swal("Alert", res.data.userMessage, "info");
                        }
                    });
                }
            };

            freightCompanyHttpServices.getFreightCompany('', $scope.token).then(function(res) {
              $scope.freightCompanyList = res.data.status == 200 ? res.data.data : [];
              $scope.lstatus |= 1024;
              spinnerService.hide("html5spinner");
            });

            function roundOff(val,position) {
                var value =  val ? (Number(val)).toFixed(position):0;
                return Number(value);
            }

            $scope.getPallet = (bagIds)=>{
                $scope.myForm.palletsWeight = 0;
                if(bagIds){
                    var bag = $scope.palletList.find(function(b) {
                        return b._id == bagIds;
                    });
                    if(bag){
                        $scope.myForm.palletsWeight = bag.weightOfBag;
                        $scope.getPalletWeight();
                    }
                }
            };

            $scope.getBagWeight = function(bagId) {
                $scope.palletsRequired = false;
                $scope.myForm.bagsWeight = 0;
                $scope.myForm.targetWeight = 0;
                $scope.myForm.targetWeightUnit = '';
                if(bagId){
                    var bag = $scope.bagList.find(function(b) {
                        return b._id == bagId;
                    });
                    if(bag){
                        $scope.myForm.bagsWeight = bag.weightOfBag;
                        $scope.myForm.targetWeight = bag.bagWeight;
                        $scope.myForm.targetWeightUnit = bag.bagWeightUnit;
                        $scope.palletsRequired = bag.includePallets;
                    }
                }
                $scope.totalBagWeight();
            };

            $scope.totalBagWeight = ()=>{
                if($scope.myForm.numberOfBags && $scope.myForm.bagsWeight){
                    $scope.myForm.weightOfBags = roundOff($scope.myForm.numberOfBags * $scope.myForm.bagsWeight,3);
                }else $scope.myForm.weightOfBags = 0;
                $scope.getAllTotalValue();
            };
            $scope.getPalletWeight = ()=>{
                if($scope.myForm.palletsWeight && $scope.myForm.numberOfPallets){
                    $scope.myForm.weightOfPallets = roundOff($scope.myForm.palletsWeight * $scope.myForm.numberOfPallets,3);
                }else $scope.myForm.weightOfPallets = 0;
                $scope.getAllTotalValue();
            };

            $scope.getCardboardSlipWeight = ()=>{
                if($scope.myForm.countOfCardboardSlip && $scope.myForm.cardboardSlipWeight){
                    $scope.myForm.weightOfCardboardSlip = roundOff($scope.myForm.countOfCardboardSlip * $scope.myForm.cardboardSlipWeight,3);
                }else $scope.myForm.weightOfCardboardSlip = 0;
                $scope.getAllTotalValue();
            };

            $scope.getCarPlasticSlipWeight = ()=>{
                if($scope.myForm.countOfPlastic && $scope.myForm.plasticeWeight){
                    $scope.myForm.weightOfPlastic = roundOff($scope.myForm.countOfPlastic * $scope.myForm.plasticeWeight,3);
                }else $scope.myForm.weightOfPlastic = 0;
                $scope.getAllTotalValue();
            };
            $scope.getBulkHeadWeight = ()=>{
                if($scope.myForm.countOfBulkHead && $scope.myForm.bulkHeadWeight){
                    $scope.myForm.weightOfBulkHead = roundOff($scope.myForm.countOfBulkHead * $scope.myForm.bulkHeadWeight,3);
                }else $scope.myForm.weightOfBulkHead = 0;
                $scope.getAllTotalValue();
            };

            $scope.getAllTotalValue = () =>{
                var productWeight = $scope.myForm.productWeight;
                switch($scope.myForm.targetWeightUnit) {
                    case 'MT':
                        productWeight = $scope.myForm.productWeight / 1000;
                        break;
                    case 'LBS':
                        productWeight = $scope.myForm.productWeight * 2.20462;
                        break;
                }

                $scope.myForm.totalPackagingWeight = roundOff(($scope.myForm.weightOfBulkHead || 0) + ( $scope.myForm.weightOfPlastic || 0 ) + ( $scope.myForm.weightOfCardboardSlip || 0 ) + ($scope.myForm.weightOfPallets||0)+($scope.myForm.weightOfBags||0)+(roundOff($scope.myForm.weightOfCardboard,3) ||0)+(roundOff($scope.myForm.weightOfOtherPackage,3)||0),3);
                $scope.myForm.netWeightPerBag = $scope.myForm.numberOfBags ? roundOff(productWeight / $scope.myForm.numberOfBags,3) : 0;
                $scope.myForm.overUnderTarget = $scope.myForm.targetWeight ? roundOff($scope.myForm.netWeightPerBag - $scope.myForm.targetWeight,3) : 0;
                if($scope.myForm.unloadWeidht){
                    $scope.myForm.productWeight = $scope.myForm.unloadWeidht;
                    if($scope.myForm.totalPackagingWeight){
                        $scope.myForm.productWeight = $scope.myForm.unloadWeidht - ($scope.myForm.totalPackagingWeight/1000);
                    }
                }
            };

            $scope.getContractListByBuyerIdAndCommodity = () => {
                var v = $scope.myForm;
                if (v.commodityId && v.buyerId) {
                    var data = {
                        commodityId: v.commodityId,
                        buyerId: v.buyerId
                    };
                    scaleTicketHttpServices.getSalesContractListByCommodity(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.contractListBuyerIdAndCommodity = res.data.data;
                        }
                    });
                }
            };

            // Split ticket functions
            $scope.openPop = function(type, data) {
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.getContractListByBuyerIdAndCommodity();

                if ($scope.myForm.isSplitTicket) {
                    $scope.list = [];
                    $scope.myForm.splits.forEach(function (split, idx) {
                        var dataSplit = _.clone(split);
                        dataSplit.type = idx > 1 ? "Secondary" : "Primary";
                        $scope.list.push(dataSplit);
                    });
                } else {
                    $scope.list = [{
                        unloadWeidht: $scope.myForm.unloadWeidht,
                        unloadWeidhtMT: $scope.myForm.unloadWeidhtMT,
                        grossWeight: $scope.myForm.grossWeight,
                        grossWeightMT: $scope.myForm.grossWeightM4cT,
                        tareWeight: $scope.myForm.tareWeight,
                        tareWeightMT: $scope.myForm.tareWeightMT,
                        contractNumber: $scope.myForm.contractNumber,
                        type: "Primary"
                    }];
                }
                $scope.addNewRow(0);
            };

            $scope.addNewRow = function(index) {
                var totalSplits = $scope.list.length;
                var grossWeight = $scope.list[totalSplits-1].tareWeight;
                var grossWeightMT = $scope.list[totalSplits-1].tareWeightMT;

                $scope.list.push({
                    unloadWeidht: 0,
                    unloadWeidhtMT: 0,
                    contractNumber: null,
                    grossWeight: grossWeight,
                    grossWeightMT: grossWeightMT,
                    tareWeight: 0,
                    tareWeightMT: 0,
                    type: index ? "Secondary" : "Primary"
                });
            };

            $scope.removeRow = function(index) {
                $scope.list.splice(index, 1);
            };

            $scope.updateUnloadValue = () => {
                $scope.list[0].unloadWeidht = $scope.myForm.unloadWeidht - $scope.list.reduce(function(acc, next) {
                    return { unloadWeidht: acc.unloadWeidht + next.unloadWeidht};
                }).unloadWeidht + $scope.list[0].unloadWeidht;

                var grossWeight = $scope.myForm.grossWeight;
                var grossWeightMT, tareWeight, tareWeightMT, unloadWeidhtMT;

                $scope.list = $scope.list.map(function(v) {
                    grossWeightMT = grossWeight / 1000;
                    tareWeight = v.grossWeight - v.unloadWeidht;
                    tareWeightMT = tareWeight / 1000;
                    unloadWeidhtMT =  v.unloadWeidht ? v.unloadWeidht / 1000 : 0;

                    v = Object.assign({}, v, {
                        unloadWeidhtMT: unloadWeidhtMT,
                        grossWeight: grossWeight,
                        grossWeightMT: grossWeightMT,
                        tareWeight: tareWeight,
                        tareWeightMT: tareWeightMT,
                    });

                    grossWeight = tareWeight;
                    return v;
                });
            };

            $scope.splittTicket = () => {

                if ($scope.list.length == 1) {
                    swal("ERROR", "Please split ticket first", "info");
                    return;
                }

                var flag = false,
                    msg = "",
                    weight = 0;
                for (var s = 0; s < $scope.list.length; s++) {
                    if (!$scope.list[s].contractNumber) {
                        flag = true;
                        msg = `Contract number required in ${s+1} row`;
                        break;
                    } else if (!$scope.list[s].unloadWeidht) {
                        flag = true;
                        msg = `Weight required in ${s+1} row`;
                        break;
                    }
                    if ($scope.list[s].unloadWeidht) {
                        weight += Number($scope.list[s].unloadWeidht);
                    }
                }

                if (flag) {
                    swal("Missing", msg, "info");
                    return;
                }

                if (weight != $scope.myForm.totalUnloadWeight) {
                    swal("Error", `Total weight must be equal to ${$scope.myForm.totalUnloadWeight}`, "error");
                    return;
                }

                var reqData = angular.copy($scope.list);
                reqData.forEach((val) => {
                    delete val.buyerName;
                    delete val.disabled;
                    delete val.contractList;
                });

                $scope.splittRequest = true;
                scaleTicketHttpServices.splittOutgoingTicket({
                    data: reqData, ticketId: $scope.myForm._id
                }, $scope.token).then(function(res) {
                    $scope.splittRequest = false;
                    if (res.data.status == 200) {
                        $state.go('outgoing');
                    }
                });

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
  