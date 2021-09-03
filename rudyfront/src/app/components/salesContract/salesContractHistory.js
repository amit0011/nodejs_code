angular
    .module('myApp.salesContractHistory', [])
    .controller('salesContractHistoryCtrl',
        function(
            $scope,
            salesContractHttpServices,
            spinnerService,
            apiUrl,
            $rootScope,
            $state,
            $stateParams
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.sales || !data.sales.salesContract || !data.sales.salesContract.view) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            var all_status = ['Active', 'Completed', 'Void'];

            $scope.active = {
                page: 'salesContract'
            };

            $scope.contractNumber = $stateParams.contractNumber;

            $scope.page = 1;
            $scope.token = JSON.parse(localStorage.getItem('token'));


            spinnerService.show("html5spinner");
            salesContractHttpServices.salesHistory($stateParams.contractNumber, $scope.token)
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
                            if (i === 0 && $scope.list[i].freightCompanyId) {
                              $scope.list[i].freightCompanyId = $scope.list[i].freightCompanyId.freightCompanyId;
                            }
                            var j = i + 1;
                            if ($scope.list[j].freightCompanyId) {
                              $scope.list[j].freightCompanyId = $scope.list[j].freightCompanyId.freightCompanyId;
                            }

                            obj.changedList = getChangeData($scope.list[i], $scope.list[j]);
                            $scope.updatedList.push(obj);
                        }
                    }
                    spinnerService.hide("html5spinner");
                });


            var all_keys = ['brokerId', 'brokerNumber', 'commissionType', 'brokerCommision', 'brokerTaxNumber',
                'showBroker', 'buyerReferenceNumber', 'gradeId', 'inventoryGrade', 'noOfPallets', 'cropyear',
                'tag', 'tagType', 'countryId', 'contractQuantity', 'units', 'packingUnit', 'packedIn', 'loadingType',
                'loadingPortId', 'equipmentType', 'noOfBags', 'variance', 'certificateAnalysis', 'equipmentId',
                'destination', 'freightCompanyId', 'netFOBCAD', 'qualityClause', 'shippingOption', 'contractCurrency',
                'amount', 'amountUnit', 'pricingTerms', 'paymentMethod', 'paymentTerms', 'showDocuments',
                'tradeRules', 'otherConditions', 'shippingComment', 'sampleApproval', 'unitFcl', 'exchangeRate', 'documents',
                'shipmentScheldule', 'status'
            ];

            function getChangeData(oldData, newData) {
                $scope.changedData = [];
                for (var j = 0; j < all_keys.length; j++) {
                    pushChangePreviousAndNewValue(all_keys[j], oldData, newData);
                }
                return $scope.changedData;
            }

            function pushChangePreviousAndNewValue(key, oldData, newData) {
                switch (key) {
                    case 'contractCurrency':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Contract Currency",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'amount':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Price*",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'amountUnit':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Units*",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'pricingTerms':
                        matchDataInObject(oldData, newData, key, 'pricingTerms', 'Pricing Terms');
                        break;
                    case 'paymentMethod':
                        matchDataInObject(oldData, newData, key, 'paymentMethod', 'Payment Method');

                        break;
                    case 'paymentTerms':
                        matchDataInObject(oldData, newData, key, 'paymentTerms', 'Payment Terms');

                        break;
                    case 'documents':
                        var data = checkChangesInDocument(oldData, newData);
                        if (data.flag) {
                            $scope.changedData.push({
                                "key": "Documents",
                                "prevValue": data.oldValue,
                                "newValue": data.newValue
                            });
                        }

                        break;
                    case 'showDocuments':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Show Documents",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'tradeRules':
                        matchDataInObject(oldData, newData, key, 'tradeRules', 'Trade rules');

                        break;
                    case 'otherConditions':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Other Conditions",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'shippingComment':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Shipping Comment",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'sampleApproval':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Subject to sample approval",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'unitFcl':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Unit FCL",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'shippingOption':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Shipping Option*",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'qualityClause':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Quantity Clause",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'netFOBCAD':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Net fob cad",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'exchangeRate':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Exchange rate",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'freightCompanyId':
                        matchDataInObject(oldData, newData, key, 'freightCompanyName', 'Freight by');
                        break;
                    case 'destination':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Destination",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'equipmentId':
                        matchDataInObject(oldData, newData, key, 'equipmentName', 'Inland equipment');

                        break;
                    case 'certificateAnalysis':
                        matchDataInObject(oldData, newData, key, 'certificateName', 'Certificate analysis');
                        break;
                    case 'variance':
                        matchDataInObject(oldData, newData, key, 'varianceName', 'Variance');
                        break;
                    case 'noOfBags':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "No of bags",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'equipmentType':
                        matchDataInObject(oldData, newData, key, 'equipmentName', 'Equipment type');
                        break;
                    case 'loadingPortId':
                        matchDataInObject(oldData, newData, key, 'loadingPortName', 'Loading port');
                        break;
                    case 'loadingType':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Loading type",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'packedIn':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Packed in",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'packingUnit':
                        matchDataInObject(oldData, newData, key, 'name', 'Packing unit');
                        break;
                    case 'units':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Unit",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'contractQuantity':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Contract quantity",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;


                    case 'tagType':
                        matchDataInObject(oldData, newData, key, 'tags', "Tag type");
                        break;

                    case 'countryId':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Country",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'tag':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Country",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'cropyear':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Crop year",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;


                    case 'noOfPallets':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "No of pallets",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'printAmended':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Print amended",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;
                    case 'inventoryGrade':
                        matchDataInObject(oldData, newData, key, 'gradeName', 'Inventory grade');
                        break;
                    case 'gradeId':
                        matchDataInObject(oldData, newData, key, 'gradeName', 'Inventory grade');
                        break;

                    case 'buyerReferenceNumber':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Buyer reference number",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'showBroker':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Show broker",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'brokerTaxNumber':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Broker tax number",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'brokerCommision':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Broker commission",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'commissionType':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Commission type",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'brokerNumber':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Broker number",
                                "prevValue": oldData[key],
                                "newValue": newData[key]
                            });
                        }
                        break;

                    case 'brokerId':
                        matchDataInObject(oldData, newData, key, 'businessName', 'Broker');
                        break;
                    case 'shipmentScheldule':
                        var checkChangesInShipment = checkChangeInShipmentSchedule(oldData, newData);
                        if (checkChangesInShipment.flag) {
                            $scope.changedData.push({
                                "key": "Shipment Scheldule",
                                "prevValue": checkChangesInShipment.prevValue,
                                "newValue": checkChangesInShipment.newValue
                            });
                        }
                        break;

                    case 'status':
                        if (oldData[key] != newData[key]) {
                            $scope.changedData.push({
                                "key": "Status",
                                "prevValue": all_status[oldData[key]],
                                "newValue": all_status[newData[key]]
                            });
                        }
                        break;

                    default:
                        console.log("Not match");
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

            function checkChangesInDocument(oldData, newData) {
                if (oldData.documents.length == newData.documents.length) {
                    var flag = false;
                    if (newData.documents.length != 0) {
                        for (var m = 0; m < oldData.documents.length; m++) {
                            var count = 0;
                            for (var n = newData.documents.length - 1; n >= 0; n--) {
                                if (newData.documents[n]._id == oldData.documents[m]._id) {
                                    count++;
                                }
                            }
                            if (count == 0) {
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag) {
                        return {
                            flag: true,
                            oldValue: (oldData.documents.filter(document => document.documents).map((document) => document.documents)).join(","),
                            newValue: (newData.documents.filter(document => document.documents).map((document) => document.documents)).join(",")
                        };
                    } else {
                        return {
                            flag: false
                        };
                    }


                } else {

                    return {
                        flag: true,
                        oldValue: (oldData.documents.filter(document => document.documents).map((document) => document.documents)).join(","),
                        newValue: (newData.documents.filter(document => document.documents).map((document) => document.documents)).join(",")
                    };
                }
            }

            function checkChangeInShipmentSchedule(oldData, newData) {
                if (oldData.shipmentScheldule.length == newData.shipmentScheldule.length) {
                    var flag = false;
                    for (var s = 0; s < oldData.shipmentScheldule.length; s++) {
                        if (oldData.shipmentScheldule[s].shipmentType != newData.shipmentScheldule[s].shipmentType) {
                            flag = true;
                            break;
                        } else if (oldData.shipmentScheldule[s].startDate != newData.shipmentScheldule[s].startDate) {
                            flag = true;
                            break;
                        } else if (oldData.shipmentScheldule[s].endDate != newData.shipmentScheldule[s].endDate) {
                            flag = true;
                            break;
                        } else if (oldData.shipmentScheldule[s].units != newData.shipmentScheldule[s].units) {
                            flag = true;
                            break;
                        } else {

                            var oldQuantity = oldData.shipmentScheldule[s].quantity ? Number(oldData.shipmentScheldule[s].quantity).toFixed(2) : 0;
                            var newQuantity = newData.shipmentScheldule[s].quantity ? Number(newData.shipmentScheldule[s].quantity).toFixed(2) : 0;
                            if (oldQuantity != newQuantity) {
                                flag = true;
                                break;
                            }
                        }
                    }

                    return {
                        flag,
                        prevValue: " ",
                        newValue: "Changes in shipment schedule"
                    };
                } else {
                    return {
                        flag: true,
                        prevValue: "Change shipment",
                        newValue: `${oldData.shipmentScheldule.length} to ${newData.shipmentScheldule.length} part`
                    };
                }
            }

        });
