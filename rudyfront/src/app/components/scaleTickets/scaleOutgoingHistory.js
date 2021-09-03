angular
    .module('myApp.scaleOutgoingHistory', [])
    .controller('scaleOutgoingHistoryCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            spinnerService,
            apiUrl,
            $rootScope,
            $state,
            $stateParams
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.truckScale || !data.truckScale.outgoing || !data.truckScale.outgoing.viewMenu) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });


            $scope.active = {
                page: 'salesTicketOutgoing'
            };

            $scope.scaleId = $stateParams.scaleId;
            $scope.ticketNumber = $stateParams.ticketNumber;

            $scope.page = 1;
            $scope.token = JSON.parse(localStorage.getItem('token'));


            spinnerService.show("html5spinner");
            scaleTicketHttpServices.scaleOutgoingHistory($scope.scaleId, $scope.token)
                .then(function(res) {
                    $scope.list = res.data.status == 200 ? res.data.data : [];
                    if ($scope.list.length > 0) {
                        $scope.createdAt = $scope.list[0].createdAt;
                        $scope.createdBy = $scope.list[0].createdBy;
                    }

                    $scope.updatedList = [];
                    if ($scope.list.length) {
                        for (var i = 0; i < $scope.list.length - 1; i++) {
                            var obj = {
                                "createdAt": $scope.list[i + 1].createdAt,
                                "createdBy": $scope.list[i + 1].createdBy
                            };
                            obj.changedList = getChangeData($scope.list[i], $scope.list[i + 1]);
                            $scope.updatedList.push(obj);
                        }
                    }
                    spinnerService.hide("html5spinner");
                });


            var all_keys = ['contractNumber','gradeId','weigher','dockageBy','receiptType','vehicleInstected',
            'infestationCheck','specificationMet','analysisCompleted','void','allow','contractExtra',
            'partyContract','trackUnit','seal','cleanBinNumber','lotNumber','invoiceNumber','moistureAdjustment',
            'moistureAdjustmentWeight','date','inTime','exitTime','binNumber','moisture','size','size7', 'size8', 'size9', 'size10',
            'truckingCompany','truckerBL','containeNumber','grossWeight','grossWeightMT','tareWeight','tareWeightMT',
            'unloadWeidht','unloadWeidhtMT','comments','printComment','bagId','numberOfBags','bagsWeight',
            'weightOfBags','totalPackagingWeight','palletsWeight','numberOfPallets','weightOfPallets','targetWeight',
            'cardboardSlipWeight','countOfCardboardSlip','weightOfCardboardSlip','netWeightPerBag','plasticeWeight',
            'countOfPlastic','weightOfPlastic','overUnderTarget','bulkHeadWeight','countOfBulkHead','weightOfBulkHead',
            'cardboardLength','weightOfCardboard','weightOfOtherPackage','productWeight','analysis'];

            function getChangeData(oldData, newData) {
                $scope.changedData = [];
                for (var j = 0; j < all_keys.length; j++) {
                    pushChangePreviousAndNewValue(all_keys[j], oldData, newData);
                }
                return $scope.changedData;
            }

            function matchData(oldData, newData, key, title) {

                if (oldData[key] != newData[key]) {
                    console.log(oldData, newData, key, title);
                    $scope.changedData.push({
                        "key": title,
                        "prevValue": oldData[key],
                        "newValue": newData[key]
                    });
                }
            }

            function matchDataInBoolean(oldData, newData, key, title) {
                if (oldData[key] != newData[key]) {
                    $scope.changedData.push({
                        "key": title,
                        "prevValue": oldData[key] == true ? 'Yes' : oldData[key] == false ? 'No' : '',
                        "newValue": newData[key] == true ? 'Yes' : newData[key] == false ? 'No' : ''
                    });
                }
            }

            function matchDataKabuli(oldData, newData, key, title) {
                if (oldData.sizeKabuli[0][key] != newData.sizeKabuli[0][key]) {
                    $scope.changedData.push({
                        "key": title,
                        "prevValue": oldData[key],
                        "newValue": newData[key]
                    });
                }
            }

            function pushChangePreviousAndNewValue(key, oldData, newData) {

                switch (key) {
                    case 'contractNumber':
                        matchData(oldData, newData, key, 'ContractNumber');
                        break;
                    case 'gradeId':
                        matchDataInObject(oldData, newData, key, 'gradeName', 'Grade');
                        break;
                    case 'weigher':
                        matchData(oldData, newData, key, 'Weigher');
                        break;
                    case 'dockageBy':
                        matchData(oldData, newData, key, 'Dockage By');
                        break;
                    case 'receiptType':
                        matchData(oldData, newData, key, 'Receipt Type');
                        break;
                    case 'vehicleInstected':
                        matchDataInBoolean(oldData, newData, key, 'Vehicle Instestected');
                        break;
                    case 'infestationCheck':
                        matchDataInBoolean(oldData, newData, key, 'Infestation Check');
                        break;
                    case 'specificationMet':
                        matchData(oldData, newData, key, 'Specification Met');
                        break;
                    case 'allow':
                        matchData(oldData, newData, key, 'Allow');
                        break;    
                    case 'analysisCompleted':
                        matchDataInBoolean(oldData, newData, key, 'Analysis Completed');
                        break;
                    case 'void':
                        matchDataInBoolean(oldData, newData, key, 'Void');
                        break;
                    case 'contractExtra':
                        matchData(oldData, newData, key, 'Contract Extra');
                        break;
                    case 'partyContract':
                        matchData(oldData, newData, key, 'Party Contract');
                        break;
                    case 'seal':
                        matchData(oldData, newData, key, 'Track Unit');
                        break;
                    case 'seal':
                        matchData(oldData, newData, key, 'Seal');
                        break;
                    case 'lotNumber':
                        matchData(oldData, newData, key, 'Clean Bin Number');
                        break;
                    case 'lotNumber':
                        matchData(oldData, newData, key, 'Lot Number');
                        break;
                    case 'invoiceNumber':
                        matchData(oldData, newData, key, 'Invoice Number');
                        break;
                    case 'moistureAdjustment':
                        matchData(oldData, newData, key, 'moisture Adjustment');
                        break;
                    case 'moistureAdjustmentWeight':
                        matchData(oldData, newData, key, 'moisture Adjustment Weight');
                        break;
                    case 'date':
                        matchData(oldData, newData, key, 'Date');
                        break;
                    case 'inTime':
                        matchData(oldData, newData, key, 'In Time');
                        break;
                    case 'exitTime':
                        matchData(oldData, newData, key, 'Exit Time');
                        break;
                    case 'binNumber':
                        matchDataInObject(oldData, newData, key, 'binName', 'Bin');
                        break;
                    case 'moisture':
                        matchData(oldData, newData, key, 'Moisture');
                        break;
                    case 'size':
                        matchData(oldData, newData, key, 'Size');
                        break;
                    case 'size7':
                        var change7 = matchKabuliCheck(oldData, newData, key, 'size7');
                        if (change7.flag) {
                            $scope.changedData.push({
                                "key": "Size7",
                                "prevValue": change7.prevValue,
                                "newValue": change7.newValue
                            });
                        }
                        break;
                    case 'size8':
                        var change8 = matchKabuliCheck(oldData, newData, key, 'size8');
                        if (change8.flag) {
                            $scope.changedData.push({
                                "key": "Size8",
                                "prevValue": change8.prevValue,
                                "newValue": change8.newValue
                            });
                        }
                        break;
                    case 'size10':
                        var changes10 = matchKabuliCheck(oldData, newData, key, 'size10');
                        if (changes10.flag) {
                            $scope.changedData.push({
                                "key": "Size10",
                                "prevValue": changes10.prevValue,
                                "newValue": changes10.newValue
                            });
                        }
                        break;
                    case 'size9':
                        var changes9 = matchKabuliCheck(oldData, newData, key, 'size9');
                        if (changes9.flag) {
                            $scope.changedData.push({
                                "key": "Size9",
                                "prevValue": changes9.prevValue,
                                "newValue": changes9.newValue
                            });
                        }
                        break;
                    case 'truckingCompany':
                        matchDataInObject(oldData, newData, key, 'truckerName', 'Trucking Company');
                        break;
                    case 'truckerBL':
                        matchData(oldData, newData, key, 'Trucket B/L');
                        break;
                    case 'containeNumber':
                        matchData(oldData, newData, key, 'Containe Number');
                        break;
                     case 'unloadWeidhtMT':
                        matchData(oldData, newData, key, 'Unload Weight MT');
                        break;
                    case 'unloadWeidht':
                        matchData(oldData, newData, key, 'Unload Weight');
                        break;
                    case 'tareWeightMT':
                        matchData(oldData, newData, key, 'Tare Weight MT');
                        break;
                    case 'tareWeight':
                        matchData(oldData, newData, key, 'Tare Weight');
                        break;
                    case 'grossWeightMT':
                        matchData(oldData, newData, key, 'Gross Weight MT');
                        break;
                    case 'grossWeight':
                        matchData(oldData, newData, key, 'Gross Weight');
                        break;
                     case 'comments':
                        matchData(oldData, newData, key, 'Comments');
                        break;
                    case 'printComment':
                        matchDataInBoolean(oldData, newData, key, 'Print Comment');
                        break;
                    case 'bagId':
                        matchDataInObject(oldData, newData, key, 'name', 'Bag');
                        break;
                    case 'numberOfBags':
                        matchData(oldData, newData, key, 'Number of bags');
                        break;
                    case 'bagsWeight':
                        matchData(oldData, newData, key, 'Bag weight');
                        break;
                    case 'weightOfBags':
                        matchData(oldData, newData, key, 'Total bag weight');
                        break;
                    case 'totalPackagingWeight':
                        matchData(oldData, newData, key, 'Total packaging weight');
                        break;
                    case 'palletsWeight':
                        matchData(oldData, newData, key, 'Pallets Weight');
                        break;
                    case 'numberOfPallets':
                        matchData(oldData, newData, key, 'Number Of Pallets');
                        break;
                    case 'weightOfPallets':
                        matchData(oldData, newData, key, 'Total Pallets weight');
                        break;
                    case 'targetWeight':
                        matchData(oldData, newData, key, 'Target weight');
                        break;
                    case 'cardboardSlipWeight':
                        matchData(oldData, newData, key, 'Cardboard Slip Weight');
                        break;
                    case 'countOfCardboardSlip':
                        matchData(oldData, newData, key, 'Count Of Cardboard Slip');
                        break;
                    case 'weightOfCardboardSlip':
                        matchData(oldData, newData, key, 'Total weight of Cardboard Slip');
                        break;
                    case 'netWeightPerBag':
                        matchData(oldData, newData, key, 'Net weight of per bag');
                        break;
                    case 'plasticeWeight':
                        matchData(oldData, newData, key, 'Plastice Weight');
                        break;
                    case 'countOfPlastic':
                        matchData(oldData, newData, key, 'Count of plastice');
                        break;
                    case 'weightOfPlastic':
                        matchData(oldData, newData, key, 'Total weight of plastice');
                        break;
                    case 'overUnderTarget':
                        matchData(oldData, newData, key, 'Over Under Target Weight');
                        break;
                    case 'bulkHeadWeight':
                        matchData(oldData, newData, key, 'Bulk head weight');
                        break;
                    case 'countOfBulkHead':
                        matchData(oldData, newData, key, 'Count of bulk head');
                        break;
                    case 'weightOfBulkHead':
                        matchData(oldData, newData, key, 'Total weight of bulk head');
                        break;
                    case 'cardboardLength':
                        matchData(oldData, newData, key, 'Cardboard length');
                        break;
                    case 'weightOfCardboard':
                        matchData(oldData, newData, key, 'Total weight of cardboard');
                        break;
                    case 'weightOfOtherPackage':
                        matchData(oldData, newData, key, 'Total weight of other package');
                        break;
                    case 'productWeight':
                        matchData(oldData, newData, key, 'Product weight');
                        break;                                 
                    case 'analysis':
                        var checkChanges = checkChangeInAnalysis(oldData, newData);
                        if (checkChanges.flag) {
                            $scope.changedData.push({
                                "key": "Analysis",
                                "prevValue": checkChanges.prevValue,
                                "newValue": checkChanges.newValue
                            });
                        }
                        break;
                    default:
                        console.log("Not match", key);
                }
            }

            function matchDataInObject(oldData, newData, key, selectKey, title) {

                if (!oldData[key] && newData[key]) {
                    $scope.changedData.push({
                        "key": title,
                        "prevValue": "",
                        "newValue": newData[key][selectKey]
                    });
                } else if (oldData[key] && !newData[key]) {
                    $scope.changedData.push({
                        "key": title,
                        "prevValue": oldData[key][selectKey],
                        "newValue": ""
                    });
                } else if (oldData[key] && newData[key] && oldData[key][selectKey] != newData[key][selectKey]) {
                    $scope.changedData.push({
                        "key": title,
                        "prevValue": oldData[key][selectKey],
                        "newValue": newData[key][selectKey]
                    });
                }
            }

            function checkChangeInAnalysis(oldData, newData) {
                var flag = false,
                    msg = "";
                if (oldData.analysis.length == newData.analysis.length) {
                    for (var j = 0; j < oldData.analysis.length; j++) {
                        var commDA = oldData.analysis[j];
                        for (var d = 0; d < newData.analysis.length; d++) {
                            if (commDA.analysisId.analysisName == newData.analysis[d].analysisId.analysisName) {
                                if (commDA.value != newData.analysis[d].value && (commDA.value || newData.analysis[d].value)) {
                                    msg += `${commDA.analysisId.analysisName} value changed ${roundOff(commDA.value,3)} to ${roundOff(newData.analysis[d].value,3)}.`;
                                    flag = true;
                                }
                            }
                        }
                    }

                    return {
                        flag: flag,
                        prevValue: " ",
                        newValue: msg
                    };
                } else {
                    return {
                        flag: true,
                        prevValue: " ",
                        newValue: "Update analysis list"
                    };
                }

            }

            function matchKabuliCheck(oldData, newData, key) {
                if (oldData.sizeKabuli.length && newData.sizeKabuli.length) {
                    if (oldData.sizeKabuli[0][key] != newData.sizeKabuli[0][key]) {
                        return {
                            flag: true,
                            prevValue: oldData.sizeKabuli[0][key],
                            newValue: newData.sizeKabuli[0][key]
                        };
                    } else {
                        return {
                            flag: false,
                            prevValue: " ",
                            newValue: ""
                        };
                    }
                } else {
                    return {
                        flag: false,
                        prevValue: " ",
                        newValue: ""
                    };
                }
            }

            function roundOff(value, pos) {
                if (value || value == 0) {
                    return (Number(value)).toFixed(pos);
                }
                return '';
            }
        });