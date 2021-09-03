angular
    .module('myApp.productionContractHistory', [])
    .controller('productionContractHistoryCtrl',
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
                page: 'productionContract'
            };

            $scope.contractNumber = $stateParams.contractNumber;

            $scope.page = 1;
            $scope.token = JSON.parse(localStorage.getItem('token'));


            spinnerService.show("html5spinner");
            httpService.productionHistory($stateParams.contractNumber, $scope.token)
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
                'nameOfContract': 'Name of Contract', 
                'personFarmType': 'Person farm type', 
                'farmName': 'Form Name', 
                'acres': 'Acres', 
                'landLocation': 'Land Location', 
                'deliveryDateFrom': 'Delivery Date From', 
                'deliveryDateTo': 'Delivery Date To', 
                'priceOption': 'Price Option', 
                'deliveryOption': 'Delivery Option', 
                'freightRate': 'Freight Rate', 
                'fixedPrice': 'Fixed Price', 
                'fixedPriceUnit': 'Fixed Price Unit', 
                'fixedOnFirst': 'Fixed on First', 
                'fixedAdditionalProduction': 'Fixed Additional Production', 
                'contractReturnDate': 'Contract Return Date', 
                'growerRetain': 'Grower Retain', 
                'growerRetainUnits': 'Grower Retain Units', 
                'CWTDel': 'CWT Delivered', 
                'delQty': 'Delivered Quantity', 
                'harvestQty': 'Harvest Quantity', 
                'harvestFileUrl': 'Harvest File Url', 
                'otherComments': 'Other Comments', 
                'grainBuyer': 'Grain Buyer', 
                'gradeId': 'Grade', 
                'inventoryGrade': 'Inventory Grade', 
                'quantityLbs': 'Quantity LBS', 
                'units': 'Units', 
                'contractNumber': 'Contract Number', 
                'commodityId': 'Commodity', 
                'cropYear': 'Crop Year', 
                'growerId': 'Grower',
                'createdBy': 'Created By', 
                'status': 'Status'
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
                if (typeof oldData[key] != 'object') {
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