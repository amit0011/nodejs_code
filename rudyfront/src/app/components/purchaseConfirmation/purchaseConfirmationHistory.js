angular
    .module('myApp.purchaseConfirmationHistory', [])
    .controller('purchaseConfirmationHistoryCtrl',
        function(
            $scope,
            httpService,
            spinnerService,
            apiUrl,
            $rootScope,
            $state,
            $stateParams
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.purchase || !data.purchase.growers || !data.purchase.growers.view) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });



            var all_status = ['Active', 'Completed', 'Void'];

            $scope.active = {
                page: 'purchaseConfirmation'
            };

            $scope.contractNumber = $stateParams.contractNo;

            $scope.page = 1;
            $scope.token = JSON.parse(localStorage.getItem('token'));


            spinnerService.show("html5spinner");
            httpService.purchaseContractHistory($stateParams.contractNo, $scope.token)
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


            var allKeyLabel = {        
                'contractNumber':'Contract Number',
                'nameOfContract':'Name of Contract',
                'signee':'Signee',
                'commodityId':'Commodity Id',
                'gradeId':'Grade id',
                'growerId':'Grower Id',
                'brokerId':'Broker Id',
                'purchaseConfirmationId':'Purchase Confirmation Id',
                'personFarmType':'Person Farm Type',
                'quantityLbs':'Quantity LBS',
                'farmName':'Farm Name',
                'cropYear':'Crop Year',
                'shipmentPeriodFrom':'Shipment Period From',
                'shipmentPeriodTo':'Shipment Period To',
                'deliveryPoint':'Delivery Point',
                'contractQuantity':'Contract Quantity',
                'quantityUnit':'Quantity Unit',
                'splitsPrice':'Splits Price',
                'price':'Price',
                'priceUnit':'Price Unit',
                'priceCurrency':'Price Currency',
                'otherConditions':'Other Conditions',
                'paymentTerms':'Payment Terms',
                'specifications':'Specifications',
                'sampleNumber':'Sample Number',
                'settlementInstructions':'Settlement Instructions',
                'settlementComments':'Settlement Comments',
                'freightRatePerMT':'Freight Rate Per MT',
                'CWTDel':'CWT Del',
                'delQty':'DEL Qty',
                'freightEstimate':'Freight Estimate',
                'freightActual':'Freight Actual',
                'inventoryGrade':'Inventory Grade',
                'history':'History',
                'backDate':'Back Date',
                'lastOpenedBy':'Last Opened By',
                'lastOpenedOn':'Last Opened On',
                'lastEditedBy':'Last Edited By',
                'lastEditedOn':'Last Edited On',
                'createdBy':'Created By',
                            
            };

            function getChangeData(oldData, newData) {
                $scope.changedData = [];
                var all_keys = Object.keys(allKeyLabel);

                for (var j = 0; j < all_keys.length; j++) {
                    pushChangePreviousAndNewValue(all_keys[j], oldData, newData);
                }
                console.log($scope.changedData);
                return $scope.changedData;
            }

            function pushChangePreviousAndNewValue(key, oldData, newData) {
                if (typeof oldData[key] != 'object' && typeof newData[key] != 'object') {
                    console.log(key, oldData[key], newData[key]);
                    if (oldData[key] == newData[key] ) {
                        return;
                    }

                    $scope.changedData.push({
                        "key": allKeyLabel[key],
                        "prevValue": oldData[key],
                        "newValue": newData[key]
                    });
                    return;
                }

                switch (key) {
                    case 'inventoryGrade':
                        matchDataInObject(oldData, newData, key, 'gradeName', 'Inventory grade');
                        break;

                    case 'gradeId':
                        matchDataInObject(oldData, newData, key, 'gradeName', 'Grade');
                        break;

                    case 'growerId':
                        matchDataInObject(oldData, newData, key, 'growerName', 'Grower');
                        break;

                    case 'brokerId':
                        matchDataInObject(oldData, newData, key, 'firstName', 'Broker');
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

        });