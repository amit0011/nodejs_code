angular
    .module('myApp.scaleHistory', [])
    .controller('scaleHistoryCtrl',
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
                if (!data || !data.truckScale || !data.truckScale.incoming || !data.truckScale.incoming.viewMenu) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });




            $scope.active = {
                page: 'salesTicketIncoming'
            };

            $scope.scaleId = $stateParams.scaleId;
            $scope.ticketNumber = $stateParams.ticketNumber;

            $scope.page = 1;
            $scope.token = JSON.parse(localStorage.getItem('token'));


            spinnerService.show("html5spinner");
            scaleTicketHttpServices.scaleHistory($scope.scaleId, $scope.token)
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


            var all_keys = ['displayOnTicket', 'delGrade', 'weigher', 'dockageBy', 'receiptType',
                'vehicleInstected', 'infestationCheck', 'specificationMet', 'allow', 'splitTotal',
                'splitTotalWeight', 'totalDamage', 'totalDamageMT', 'moistureAdjustment', 'moistureAdjustmentWeight', 'dockageTotal',
                'dockageTotalWeight', 'dockageCompleted', 'date', 'inTime', 'exitTime', 'binNumber', 'moisture', 'size', 'size7', 'size8', 'size9', 'size10',
                'truckingCompany', 'truckerBL', 'grossWeight', 'grossWeightMT', 'tareWeight', 'tareWeightMT', 'unloadWeidht',
                'unloadWeidhtMT', 'netWeight', 'netTotalWeight', 'comments', 'contractNumber', 'analysis', 'void'
            ];

            function getChangeData(oldData, newData) {
                $scope.changedData = [];
                for (var j = 0; j < all_keys.length; j++) {
                    pushChangePreviousAndNewValue(all_keys[j], oldData, newData);
                }
                return $scope.changedData;
            }

            function matchData(oldData, newData, key, title) {
                if (oldData[key] != newData[key]) {
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
                    case 'comments':
                        matchData(oldData, newData, key, 'Comments');
                        break;
                    case 'netTotalWeight':
                        matchData(oldData, newData, key, 'Net Total Weight');
                        break;
                    case 'netWeight':
                        matchData(oldData, newData, key, 'Net Weight');
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
                    case 'contractNumber':
                        matchData(oldData, newData, key, 'ContractNumber');
                        break;
                    case 'void':
                        matchDataInBoolean(oldData, newData, key, 'Void');
                        break;
                    case 'displayOnTicket':
                        matchData(oldData, newData, key, 'DisplayOnTicket');
                        break;
                    case 'delGrade':
                        matchData(oldData, newData, key, 'Delivery Grade');
                        break;
                    case 'weigher':
                        matchData(oldData, newData, key, 'Weigher');
                        break;
                    case 'dockageBy':
                        matchData(oldData, newData, key, 'Dockage By');
                        break;
                    case 'dockageCompleted':
                        matchDataInBoolean(oldData, newData, key, 'Dockage Completed');
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
                    case 'splitTotal':
                        matchData(oldData, newData, key, 'Split Total');
                        break;

                    case 'splitTotalWeight':
                        matchData(oldData, newData, key, 'Split Total Weight');
                        break;
                    case 'totalDamage':
                        matchData(oldData, newData, key, 'Total Damage');
                        break;
                    case 'totalDamageMT':
                        matchData(oldData, newData, key, 'Total Damage In MT');
                        break;

                    case 'moistureAdjustment':
                        matchData(oldData, newData, key, 'moisture Adjustment');
                        break;
                    case 'moistureAdjustmentWeight':
                        matchData(oldData, newData, key, 'moisture Adjustment Weight');
                        break;
                    case 'dockageTotal':
                        matchData(oldData, newData, key, 'Dockage Total');
                        break;
                    case 'dockageTotalWeight':
                        matchData(oldData, newData, key, 'Dockage Total Weight');
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
                    case 'truckingCompany':
                        matchDataInObject(oldData, newData, key, 'truckerName', 'Trucking Company');
                        break;
                    case 'truckerBL':
                        matchData(oldData, newData, key, 'Trucket B/L');
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
                                if (commDA.weightMT != newData.analysis[d].weightMT && (commDA.weightMT || newData.analysis[d].weightMT)) {
                                    msg += ` ${commDA.analysisId.analysisName} weight changed ${roundOff(commDA.weightMT,3)} to ${roundOff(newData.analysis[d].weightMT,3)}.`;
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