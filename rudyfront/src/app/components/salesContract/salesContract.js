angular
    .module('myApp.salesContract', [])
    .controller('salesContractCtrl',
        function(
            $scope,
            salesContractHttpServices,
            brokerHttpService,
            countryHttpService,
            pricingTermsHttpService,
            paymentTermsHttpService,

            tradeRulesHttpService,
            documentsHttpService,
            equipmentHttpService,
            loadingPortHttpService,
            varianceHttpService,
            maxWeightHttpService,
            sudAdminHttpService,
            freightHttpServices,
            tagsHttpService,
            bagsHttpService,
            httpService,
            $state,
            $stateParams,
            currencyHttpService,
            $timeout,
            spinnerService,
            buyerHttpServices,
            apiUrl,
            imageUrl,
            $rootScope,
            salesStampHttpServices,
            certificateCostHttpService,
            paymentMethodHttpService,
            $window,
            originHttpService,
            commonService
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.sales || !data.sales.salesContract || (!data.sales.salesContract.viewMenu && !data.sales.salesContract.add && !data.sales.salesContract.edit)) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            $scope.buyerDetails = (buyerId) => {
                if ($rootScope.loginUserAccess.sales.buyers.view) {
                    $state.go('buyerDetails', {
                        buyerId: buyerId
                    });
                }
            };

            $scope.canChangeStatus = function(contract) {
                return commonService.canChangeStatus(contract.createdBy, $rootScope.loggedInUser, '_id');
            };

            $scope.cropYears = commonService.cropYears();

            $scope.destinationPorts = [];

            $scope.editSalesCont = (buyerId, contractNumber) => {
                var url = `editSalesContract/${buyerId}/${contractNumber}/edit`;
                $window.open(url, '_blank');
            };


            $scope.openStampPdf = (stampPdfUlr) => {
                if(stampPdfUlr) $window.open(stampPdfUlr, '_blank');
            };

            $scope.origins = [];

            var state = $rootScope.previousState.$$state().name;

            $scope.active_function = "init";

            if (state) {
                localStorage.setItem('prev_state', state);
            }
            $scope.myForm = {
                otherConditions: 'Sale is subject to EDC approval of the Buyer.',
                printAmended: true,
                meta: {
                  covidClause: true,
                }
            };
            $scope.payment = {};
            $scope.arr = [];
            $scope.active = {
                page: 'salesContract'
            };
            $scope.allChecked = true;
            $scope.disableField = false;
            $scope.printTicket = false;
            var pageNo = localStorage.getItem('sales_Contract_page') || 1;
            var brokerPage = '';
            $scope.backShow = false;
            $scope.userProfile = JSON.parse(localStorage.getItem('userProfile'));
            $scope.imagePath = imageUrl;
            $scope.myForm.date = moment(new Date()).format('YYYY-MM-DD');

            $scope.type = $stateParams.type ? $stateParams.type : '';

            $scope.myForm.shipmentScheldule = [{}];

            //$scope.searchModel = localStorage.getItem('sales_contract_filter');
            $scope.searchModel = {
                limit: '10',
                status: '0'
            };

            $scope.back = function() {
                $state.go('salesContract');
            };

            $scope.plusshipmentScheldule = function() {
                var rem_quantity = $scope.myForm.contractQuantity - $scope.myForm.shipmentScheldule.sum('quantity');
                var rem_units = $scope.myForm.packedIn - $scope.myForm.shipmentScheldule.sum('units');
                if (rem_quantity > 0 && rem_units > 0) {
                    $scope.myForm.shipmentScheldule.push({});
                }
            };

            $scope.setBagsPerContainer = function () {
              if ($scope.myForm.contractQuantity && $scope.myForm.units && $scope.myForm.packedIn && $scope.myForm.packingUnit) {
                $scope.myForm.noOfBags = $scope.calculateBagsPerContainer($scope.myForm.contractQuantity, $scope.myForm.packedIn);
              }
            };

            $scope.calculateBagsPerContainer = function (target_weight, containers) {
              var bag = $scope.bags.find(function(b){
                return b._id === $scope.myForm.packingUnit;
              });
              var bagUnit = bag.bagWeightUnit;
              var bagWeight = bag.bagWeight;
              var weight = +target_weight;

              if (bagUnit !== $scope.myForm.units) {
                // convert weight into MT
                switch ($scope.myForm.units) {
                  case 'LBS':
                    weight = weight / 2204.62;
                    break;

                  case 'CWT':
                    weight = weight / 22.0462;
                    break;

                  case 'BU':
                    weight = weight * 60 / 2204.62;
                    break;
                }

                // converting weight into bagWeightUnit
                switch (bagUnit) {
                  case 'LBS':
                    weight = weight * 2204.62;
                    break;

                  case 'KGS':
                    weight = weight * 1000;
                    break;
                }
              }

              return Math.ceil(weight / (bagWeight * containers));
            };

            $scope.removeshipmentScheldule = function(index) {
                $scope.myForm.shipmentScheldule.splice(index, 1);
            };

            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));

            $scope.initdocuments = () => {
                documentsHttpService.getdocuments($scope.token).then(function(res) {
                    $scope.documentsList = res.data.status == 200 ? res.data.data : [];
                });
            };

            $scope.initdocuments();

            $scope.getShippedQuantityLbs = (scale) => {
                var totalShippedQuantityLbs = 0;
                if (scale && scale.length > 0) {
                    scale.forEach((val) => {
                        // convert kg to pounds ( Number(val.netWeight) * 2.2046)
                        if(!val.void){
                            totalShippedQuantityLbs += val.unloadWeidht && !val.void ? Number(val.unloadWeidht) * 2.2046 : 0;
                        }
                    });

                }
                return totalShippedQuantityLbs;
            };

            $scope.search = function(pageNo) {
                localStorage.setItem('sales_contract_filter', JSON.stringify($scope.searchModel));
                localStorage.setItem('sales_Contract_page', pageNo);
                $scope.active_function = "search";
                spinnerService.show("html5spinner");
                $scope.searchModel.page = pageNo || 1;

                var searchParam = Object.assign({}, $scope.searchModel);
                searchParam.getSum = true;
                searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
                searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');
                searchParam.shippingStartDate = commonService.adjustDate(searchParam.shippingStartDate);
                searchParam.shippingEndDate = commonService.adjustDate(searchParam.shippingEndDate, ']');

                salesContractHttpServices.searchSaleContract(searchParam, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.salesContractList = $scope.transformSaleList(res.data.data.docs);
                            $scope.qtySum = res.data.data.qtySum;
                            $scope.page = res.data.data.page;
                            $scope.totalPages = res.data.data.total;
                        }
                        spinnerService.hide("html5spinner");
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            };

            $scope.reloadWeight = function(contractNumber) {
              salesContractHttpServices.reloadSaleContractWeight(contractNumber, $scope.token).then(function(res) {
                if (res.data.status === 200) {
                  $scope.search(localStorage.getItem('sales_Contract_page'));
                }
              });
            };

            $scope.transformSaleList = function (sales) {
              for (var i = 0; i < sales.length; i++) {
                var shipQty = sales[i].scale ?
                    sales[i].scale.reduce(function(acc, next) {
                        return !next.void ? acc + next.unloadWeidht : acc;
                    }, 0) * 2.2046 : 0;
                shipQty += (sales[i].tradeScale ?
                    sales[i].tradeScale.reduce(function(acc, next) {
                        return !next.void ? acc + next.unloadWeidht : acc;
                    }, 0) * 2.2046 : 0);
                shipQty += (sales[i].scale_loadsheet ?
                    sales[i].scale_loadsheet.reduce(function(acc, next) {
                        return !next.void ? acc + next.unloadWeidht : acc;
                    }, 0) * 2.2046 : 0);
                shipQty += (sales[i].loadsheet ?
                    sales[i].loadsheet.reduce(function(acc, next) {
                        return !next.void ? acc + next.unloadWeidht : acc;
                    }, 0) * 2.2046 : 0);

                sales[i].delQty = Math.round(shipQty);
                if (sales[i].shipmentScheldule) {
                    var newArr = sales[i].shipmentScheldule
                        .filter(function(val){ return !(val == null || Object.entries(val).length === 0);});
                    sales[i].shipmentScheldule = newArr;
                    if (sales[i].shipmentScheldule.length > 0) {
                        sales[i].shimStartDate = sales[i].shipmentScheldule[0].startDate;
                        sales[i].shimEndDate = sales[i].shipmentScheldule[sales[i].shipmentScheldule.length - 1].endDate;
                    }
                }
                sales[i].status = sales[i].status.toString();
                let brokerNote = sales[i].brokerNote;
                sales[i].brokerNote = brokerNote && brokerNote !== 'undefined' ? brokerNote : null;
              }

              return sales;
            };

            varianceHttpService.getvariance($scope.token).then(function(res) {
                $scope.varianceList = res.data.status == 200 ? res.data.data : [];
            });

            certificateCostHttpService.getcertificateCost('', $scope.token).then(function(res) {
                $scope.certificateCostList = res.data.status == 200 ? res.data.data : [];
            });

            sudAdminHttpService.getadmin(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.updatedAdminList = [];
                    for (var i = 0; i < res.data.data.length; i++) {
                        if (res.data.data[i].type == 'ADMIN' || res.data.data[i].roles == 'Sales') {
                            $scope.updatedAdminList.push(res.data.data[i]);
                        } else {
                            $scope.adminList = res.data.data;
                        }
                    }
                }
            });

            tagsHttpService.gettags($scope.token).then(function(res) {
                $scope.tagsList = res.data.status == 200 ? res.data.data : [];
            });

            $scope.inittradeRules = () => {
                tradeRulesHttpService.gettradeRules($scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.tradeRulesList = res.data.data;
                    }
                });
            };
            $scope.inittradeRules();

            currencyHttpService.getcurrency($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.currencyList = res.data.data;
                    $scope.myForm.exchangeRate = $scope.currencyList[0].currencyCADUSD;
                    $scope.myForm.exchangeDeduction = $scope.currencyList[0].exchangeDeduction;
                }
            });

            $scope.initpricingTerms = () => {
                pricingTermsHttpService.getpricingTerms($scope.token).then(function(res) {
                    $scope.pricingTermsList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.initpricingTerms();

            $scope.initPaymentTerms = () => {
                paymentTermsHttpService.getpaymentTerms($scope.token).then(function(res) {
                    $scope.paymentTermsList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.initPaymentTerms();

            $scope.initpaymentMethod = () => {
                paymentMethodHttpService.getpaymentMethod($scope.token).then(function(res) {
                    $scope.paymentMethodList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.initpaymentMethod();

            loadingPortHttpService.getLoadingPort('', $scope.token).then(function(res) {
                $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
            });

            $scope.initbags = function() {
                bagsHttpService.getbags('', $scope.token).then(function(res) {
                    $scope.bags = res.data.status == 200 ? res.data.data : [];
                    $scope.bagList = $scope.bags;

                    $scope.pallets = $scope.bagList.filter(function(bag) {
                      return bag.bulkBag === 'Pallet';
                    });
                });
            };

            $scope.getClass = function (freight) {
              var className = '';
              if (moment().isAfter(freight.validity)) {
                className = 'expired';
              }

              return className;
            };

            $scope.initbags();

            $scope.getCwtFclValue = () => {
                if ($scope.myForm.units && $scope.myForm.contractQuantity && $scope.myForm.packedIn) {
                    if ($scope.myForm.units == 'LBS' || $scope.myForm.units == 'Lbs') {
                        $scope.myForm.unitFcl = (Number($scope.myForm.contractQuantity) / 100) / Number($scope.myForm.packedIn);
                    } else if ($scope.myForm.units == 'MT') {
                        $scope.myForm.unitFcl = (Number($scope.myForm.contractQuantity) * 22.0462) / Number($scope.myForm.packedIn);
                    } else if ($scope.myForm.units == 'CWT') {
                        $scope.myForm.unitFcl = Number($scope.myForm.contractQuantity) / Number($scope.myForm.packedIn);
                    } else if ($scope.myForm.units == 'KG') {
                        $scope.myForm.unitFcl = (Number($scope.myForm.contractQuantity) * 0.022046) / Number($scope.myForm.packedIn);
                    } else if ($scope.myForm.units == 'BU' || $scope.myForm.units == 'Bu') {
                        $scope.myForm.unitFcl = (Number($scope.myForm.contractQuantity) * 100 / 60) / Number($scope.myForm.packedIn);
                    } else $scope.myForm.unitFcl = 0;

                } else {
                    $scope.myForm.unitFcl = 0;
                }
                $scope.myForm.unitFcl = Math.round($scope.myForm.unitFcl);
                $scope.setBagsPerContainer();
            };

            $scope.loadOrigins = function () {
                spinnerService.show("html5spinner");
                originHttpService.getOriginList($scope.token)
                    .then(function (res) {
                        spinnerService.hide("html5spinner");
                        if (res.data.status == 200) {
                            $scope.origins = res.data.data.docs;
                        }
                    });
            };

            $scope.matchingDocument = function(matchingDocId) {
                return function (x) { return x._id == matchingDocId;};
            };

            $scope.loadOrigins();

            if ($stateParams.buyerId && $stateParams.contractNumber && $stateParams.type == 'edit') {
                $scope.backShow = true;
                if ($stateParams.type == 'edit') {
                    $scope.disableField = true;
                }
                salesContractHttpServices.getsalesContractDetails($stateParams.contractNumber, $scope.token, $stateParams.buyerId).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.myForm = res.data.data;
                            $scope.myForm.freightCompanyId = $scope.myForm.freightCompanyId ? $scope.myForm.freightCompanyId._id : $scope.myForm.freightCompanyId;

                            if (!$scope.myForm.meta) {
                              $scope.myForm.meta = {
                                covidClause: true,
                              };
                            }

                            var b = [];
                            for (let obj of res.data.data.shipmentScheldule) {
                                if (obj == null) {
                                    b.push({});
                                    $scope.myForm.shipmentScheldule = b;
                                }
                            }

                            $scope.myForm.buyerId = res.data.data.buyerId._id;
                            if (res.data.data.documents) {
                                $timeout(function() {
                                    $scope.documentsList.map(function(el) {
                                        for (let i = 0; i < res.data.data.documents.length; i++) {
                                            if (res.data.data.documents[i]._id == el._id) {
                                                var index = $scope.documentsList.findIndex($scope.matchingDocument(res.data.data.documents[i]._id));
                                                $scope.documentsList[index].ticked = true;
                                            }
                                        }
                                    });
                                }, 1000);
                            }

                            if (res.data.data.brokerId) {
                                $scope.myForm.brokerId = res.data.data.brokerId._id;
                                $scope.getBrokerName($scope.myForm.brokerId);
                            }

                            if (res.data.data.methodOfShipment) {
                                $scope.myForm.methodOfShipment = res.data.data.methodOfShipment._id;
                                $scope.getMethodOfShipping($scope.myForm.methodOfShipment);
                            }

                            if (res.data.data.equipmentType) {
                                $scope.myForm.equipmentType = res.data.data.equipmentType._id;
                                $scope.getEquipmentType($scope.myForm.equipmentType);
                            }

                            if (res.data.data.packingUnit) {
                                $scope.myForm.packingUnit = res.data.data.packingUnit._id;
                                $scope.getPackingUnitName($scope.myForm.packingUnit);
                            }

                            if (res.data.data.tagType) {
                                $scope.myForm.tagType = res.data.data.tagType._id;
                                $scope.getTagtypeName($scope.myForm.tagType);
                            }

                            if (res.data.data.loadingPortId) {
                                $scope.getDestinationPort(res.data.data.loadingPortId._id);
                                $scope.myForm.loadingPortId = res.data.data.loadingPortId._id;
                            }

                            if (res.data.data.gradeId) {
                                $scope.myForm.gradeId = res.data.data.gradeId._id;
                                $scope.getGradeName($scope.myForm.gradeId);
                            }
                            if (res.data.data.commodityId) {
                                $scope.myForm.commodityId = res.data.data.commodityId._id;
                                $scope.getGrade($scope.myForm.commodityId);

                            }
                            if (res.data.data.certificateAnalysis) {
                                $scope.myForm.certificateAnalysis = res.data.data.certificateAnalysis._id;
                            }
                            if (res.data.data.pricingTerms) {
                                $scope.myForm.pricingTerms = res.data.data.pricingTerms._id;
                                $scope.getPricingTerms($scope.myForm.pricingTerms);
                            }
                            if (res.data.data.paymentMethod) {
                                $scope.myForm.paymentMethod = res.data.data.paymentMethod._id;
                                $scope.getPaymentMethod($scope.myForm.paymentMethod);
                            }
                            if (res.data.data.paymentTerms) {
                                $scope.myForm.paymentTerms = res.data.data.paymentTerms._id;
                                $scope.getPaymentTerms($scope.myForm.paymentTerms);
                            }
                            if (res.data.data.tradeRules) {
                                $scope.myForm.tradeRules = res.data.data.tradeRules._id;
                                $scope.getTradeRules($scope.myForm.tradeRules);
                            }

                            if (res.data.data.createdBy) {
                                $scope.myForm.signee = res.data.data.createdBy._id || res.data.data.createdBy._id;
                                $scope.myForm.signature = res.data.data.createdBy.signature;
                            }
                            if (res.data.data.equipmentId) {
                                $scope.myForm.equipmentId = res.data.data.equipmentId._id;
                            }
                            if (res.data.data.variance) {
                                $scope.myForm.variance = res.data.data.variance._id;
                                $scope.getVariances($scope.myForm.variance);
                            }
                            $scope.getFreightPrice();
                            $scope.myForm.cropYear = res.data.data.cropYear;
                            $scope.myForm.cropyear = res.data.data.cropyear;
                            $scope.myForm.date = moment(res.data.data.date).format('YYYY-MM-DD');
                            if (!("printAmended" in res.data.data)) {
                                $scope.myForm.printAmended = true;
                            }

                            $scope.oldData = angular.copy($scope.myForm);

                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            }

            if ($stateParams.buyerId) {
                buyerHttpServices.getBuyerDetails($stateParams.buyerId, $scope.token).then(function(res) {
                        $scope.buyerDetails = res.data.status == 200 ? res.data.data : [];
                        if ($scope.buyerDetails.documents && $scope.buyerDetails.documents.length && $stateParams.type != 'edit' && !$stateParams.contractNumber) {
                            $timeout(function() {
                                $scope.documentsList.map(function(el) {
                                    for (var i = 0; i < $scope.buyerDetails.documents.length; i++) {
                                        if ($scope.buyerDetails.documents[i]._id == el._id) {
                                            el.ticked = true;
                                        }
                                    }
                                });
                            }, 2000);

                        }
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });
            }

            $scope.getEquipmentTypes = () => {
                spinnerService.show("html5spinner");
                equipmentHttpService.getInlandEquipmentTypes($scope.token, $scope.myForm.loadingPortId).then(function(res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status == 200) {
                        $scope.inlandEquipmentList = res.data.data;
                    }
                });
            };

            $scope.getDestinationPort = (id) => {
                spinnerService.show("html5spinner");
                $scope.destinationPorts = [];
                freightHttpServices.getFreightList($scope.token, id).then(function(res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status == 200) {
                        $scope.freightList = res.data.data;
                        $scope.loadingPortsName = $scope.loadingPortList.filter(function(hero) {
                            return hero._id == id;
                        });
                        if ($scope.loadingPortsName) {
                            $scope.myForm.loadingPortName = $scope.loadingPortsName[0].loadingPortName;
                        }

                        $scope.freightList.forEach(({cityName, countryName}) => {
                            if ($scope.destinationPorts.findIndex(dp => (dp.cityName == cityName && dp.countryName == countryName)) == -1) {
                                $scope.destinationPorts.push({ cityName, countryName });
                            }

                            $scope.destinationPorts.sort((a, b) => {
                                return a.cityName < b.cityName ? -1 : (a.cityName > b.cityName ? 1 : 0);
                            });
                        });
                        $scope.getEquipmentTypes();
                        $scope.getEquipmentList();
                    }
                });
            };

            function getBag(bagId, data) {
                var bag = {};
                $scope.bags.forEach((val) => {
                    if (val._id == bagId) {
                        bag.name = val.bulkBag;
                        bag.bagCost = val.bagCost;
                    }
                });
                return bag;
            }

            $scope.initSales = function(pageNo) {
                $scope.active_function = "init";
                $scope.searchModel = {
                    limit: '10',
                    status: "0"
                };
                spinnerService.show("html5spinner");
                salesContractHttpServices.getsalesContract(pageNo, $scope.token, 10).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.salesContractList = $scope.transformSaleList(res.data.data.docs);
                        $scope.qtySum = res.data.data.qtySum;
                        $scope.page = res.data.data.page;
                        $scope.totalPages = res.data.data.total;

                        spinnerService.hide("html5spinner");
                    }
                });
            };
            $scope.DoCtrlPagingAct = function(text, page) {
                page = page || pageNo;
                localStorage.setItem('sales_Contract_page', page);
                var prev_filter = localStorage.getItem('sales_contract_filter');
                if (prev_filter) {
                    $scope.searchModel = JSON.parse(prev_filter);
                } else {
                    $scope.searchModel = {};
                }
                var keys = Object.keys($scope.searchModel);
                if (keys.length) {
                    if ($scope.searchModel && $scope.searchModel.commodityId) {
                        $scope.getGrade($scope.searchModel.commodityId);
                    }

                    $scope.search(page);
                } else {
                    $scope.initSales(page);
                }
            };

            $scope.clear = () => {
                localStorage.setItem('sales_Contract_page', 1);
                localStorage.removeItem('sales_contract_filter');
                $scope.initSales();
            };

            brokerHttpService.getBroker(brokerPage, $scope.token).then(function(res) {
                $scope.brokerList = res.data.status == 200 ? res.data.data : [];
            });

            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
                // console.log($scope.commoditys);
            });

            $scope.getEquipmentList = () => {
                $scope.equipmentList = [];
                $scope.freightList.filter(freight => freight.cityName == $scope.myForm.destination).forEach(freight => {
                    if ($scope.equipmentList.findIndex(equipment => equipment._id == freight.equipmentId._id) != -1) {
                        return;
                    }
                    $scope.equipmentList.push(freight.equipmentId);
                });
            };

            $scope.getFreightPrice = function() {
                spinnerService.show("html5spinner");
                if ($scope.freightList && $scope.freightList.length) {
                    for (var obj of $scope.freightList) {
                        if ($scope.myForm.destination == obj.cityName) {
                            $scope.myForm.country = obj.countryName;
                            break;
                        }
                    }
                    $scope.getEquipmentList();
                }

                var obj1 = {
                    equipmentId: $scope.myForm.equipmentType,
                    loadingPortId: $scope.myForm.loadingPortId,
                    city: $scope.myForm.destination,
                    freightCompanyId: $scope.myForm.freightCompanyId,
                    include: true,
                };

                freightHttpServices.freightCompanyList(obj1, $scope.token).then(function(res) {
                    $scope.myForm.freightCompanyList = res.data.status == 200 ? res.data.data : [];
                    spinnerService.hide("html5spinner");
                });
            };

            countryHttpService.getCountryList($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.updatedList = {};
                    res.data.data.forEach((val) => {
                        if ($scope.updatedList[val.country]) {
                            $scope.updatedList[val.country].push({
                                model: val.name + ' - ' + val.city
                            });
                        } else {
                            $scope.updatedList[val.country] = [{
                                model: val.name + ' - ' + val.city
                            }];
                        }
                    });
                    var arrayObjectData = [];
                    angular.forEach($scope.updatedList, (value, key) => {
                        arrayObjectData.push({
                            country: key
                        });
                    });
                    $scope.countries = arrayObjectData;
                }
            });

            $scope.getGrade = function(id) {
                if (id) {
                    spinnerService.show("html5spinner");

                    if ($scope.myForm.cropYear && $scope.myForm.commodityId) {
                        $scope.generateNo();
                    }
                    httpService.getGrade('', id, $scope.token).then(function(res) {
                        $scope.grades = res.data.status == 200 ? res.data.data : [];
                        $scope.contractGrade = [];
                        $scope.inventoryGrade = [];
                        $scope.grades.forEach((grade) => {
                            if (['Both', 'All'].includes(grade.gradeDisplay)) {
                                $scope.contractGrade.push(grade);
                                $scope.inventoryGrade.push(grade);

                            } else if (grade.gradeDisplay == 'Contract Grade') {
                                $scope.contractGrade.push(grade);

                            } else if (grade.gradeDisplay == 'Inventory Grade') {
                                $scope.inventoryGrade.push(grade);
                            }
                        });

                        spinnerService.hide("html5spinner");
                    });

                    $timeout(function() {

                        if (Array.isArray($scope.commoditys)) {

                            $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                                return hero._id == id;
                            });

                            $scope.myForm.commodityAlias = $scope.commodityGrades[0].commodityAlias;
                            $scope.commoditySampleAnalysis = $scope.commodityGrades[0].commoditySampleAnalysis;
                        }

                    }, 1000);
                } else {
                    $scope.grades = [];
                    $scope.contractGrade = [];
                    $scope.inventoryGrade = [];
                }

            };

            $scope.getGradeName = function(gradeId) {
                $timeout(function() {
                    if (!$scope.grades) {
                        return;
                    }
                    $scope.gradesName = $scope.grades.filter(function(hero) {
                        return hero._id == gradeId;
                    });
                    if ($scope.gradesName[0] && $scope.gradesName[0].name) {
                        $scope.myForm.gradeName = $scope.gradesName[0].gradeName;
                    }
                }, 2500);
            };

            $scope.getSigneeSignatures = function(signeeId) {
                $timeout(function() {
                    if (!$scope.updatedAdminList) {
                        return;
                    }
                    $scope.signeeSignatures = $scope.updatedAdminList.filter(function(hero) {
                        return hero._id == signeeId;
                    });
                    if ($scope.signeeSignatures[0] && $scope.signeeSignatures[0].signature) {
                        $scope.myForm.signature = $scope.signeeSignatures[0].signature;
                    }
                }, 2500);
            };

            $scope.getPackingUnitName = function(bagId) {
                $timeout(function() {
                    if (!$scope.bags) {
                        return;
                    }
                    $scope.packingUnitsName = $scope.bags.filter(function(hero) {
                        return hero._id == bagId;
                    });
                    if ($scope.packingUnitsName[0] && $scope.packingUnitsName[0].name) {
                        $scope.myForm.packingUnitName = $scope.packingUnitsName[0].name;
                        $scope.packingUnitBagsUnit = $scope.packingUnitsName[0].bagWeightUnit;
                        $scope.packingUnitBagsType = $scope.packingUnitsName[0].bulkBag;
                        $scope.myForm.bagWeight = $scope.packingUnitsName[0].bagWeight + ' ' + $scope.packingUnitsName[0].bagWeightUnit;
                    }
                }, 2500);
                $scope.setBagsPerContainer();
            };
            $scope.getTagtypeName = function(tagId) {
                $timeout(function() {
                    if (!$scope.tagsList) {
                        return;
                    }
                    $scope.getTagsName = $scope.tagsList.filter(function(hero) {
                        return hero._id == tagId;
                    });
                    if ($scope.getTagsName[0] && $scope.getTagsName[0].tags) {
                        $scope.myForm.tagName = $scope.getTagsName[0].tags;
                    }
                }, 2500);
            };
            $scope.getBrokerName = function(brokerId) {
                $timeout(function() {
                    if (!$scope.brokerList) {
                        return;
                    }
                    $scope.getBrokersName = $scope.brokerList.filter(function(hero) {
                        return hero._id == brokerId;
                    });
                    if ($scope.getBrokersName[0] && $scope.getBrokersName[0].businessName) {
                        $scope.myForm.brokerName = $scope.getBrokersName[0].businessName;
                    }
                }, 2500);
            };
            $scope.getPricingTerms = function(termsId) {
                $timeout(function() {
                    if (!$scope.pricingTermsList) {
                        return;
                    }
                    $scope.getPriceTermsName = $scope.pricingTermsList.filter(function(hero) {
                        return hero._id == termsId;
                    });
                    if ($scope.getPriceTermsName[0] && $scope.getPriceTermsName[0].pricingTerms) {
                        $scope.myForm.pricingTermsName = $scope.getPriceTermsName[0].pricingTerms;
                    }
                }, 2500);
            };
            $scope.getPaymentTerms = function(paymentTermsId) {
                $timeout(function() {
                    if (!$scope.paymentTermsList) {
                        return;
                    }
                    $scope.getPaymentTermsName = $scope.paymentTermsList.filter(function(hero) {
                        return hero._id == paymentTermsId;
                    });
                    if ($scope.getPaymentTermsName[0] && $scope.getPaymentTermsName[0].paymentTerms) {
                        $scope.myForm.paymentTermsName = $scope.getPaymentTermsName[0].paymentTerms;
                    }
                }, 2500);
            };
            $scope.getPaymentMethod = function(paymentMethodId) {
                $timeout(function() {
                    if (!$scope.paymentMethodList) {
                        return;
                    }
                    $scope.getPaymentMethodName = $scope.paymentMethodList.filter(function(hero) {
                        return hero._id == paymentMethodId;
                    });
                    if ($scope.getPaymentMethodName[0] && $scope.getPaymentMethodName[0].paymentMethod) {
                        $scope.myForm.paymentMethodName = $scope.getPaymentMethodName[0].paymentMethod;
                    }
                }, 2500);
            };
            $scope.getTradeRules = function(tradeId) {
                $timeout(function() {
                    if (!$scope.tradeRulesList) {
                        return;
                    }
                    $scope.getTradeRulesName = $scope.tradeRulesList.filter(function(hero) {
                        return hero._id == tradeId;
                    });
                    if ($scope.getTradeRulesName[0] && $scope.getTradeRulesName[0].tradeRule) {
                        $scope.myForm.tradeRulesName = $scope.getTradeRulesName[0].tradeRules;
                    }
                }, 2500);
            };
            $scope.getMethodOfShipping = function(shippingId) {
                $timeout(function() {
                    if (!$scope.equipmentList) {
                        return;
                    }
                    $scope.getMethodOfShip = $scope.equipmentList.filter(function(hero) {
                        return hero._id == shippingId;
                    });
                    if ($scope.getMethodOfShip[0] && $scope.getMethodOfShip[0].equipmentName) {
                        $scope.myForm.methodOfShipmentName = $scope.getMethodOfShip[0].equipmentName;
                    }
                }, 2500);
            };

            $scope.getVariances = function(varianceId) {
                $timeout(function() {
                    if (!$scope.varianceList) {
                        return;
                    }
                    $scope.getVariancesName = $scope.varianceList.filter(function(hero) {
                        return hero._id == varianceId;
                    });
                    if ($scope.getVariancesName[0] && $scope.getVariancesName[0].varianceName) {
                        $scope.myForm.varianceName = $scope.getVariancesName[0].varianceName;
                    }
                }, 2500);
            };

            $scope.getEquipmentType = function(equipmentTypeId) {
                $timeout(function() {
                    if (!$scope.equipmentList) {
                        return;
                    }
                    $scope.getEquipmentTypeName = $scope.equipmentList.filter(function(hero) {
                        return hero._id == equipmentTypeId;
                    });
                    if ($scope.getEquipmentTypeName[0] && $scope.getEquipmentTypeName[0].equipmentName) {
                        $scope.myForm.equipmentTypeName = $scope.getEquipmentTypeName[0].equipmentName;
                    }
                    $scope.isInlandEquipmentRequired();
                    $scope.getFreightPrice();
                }, 2500);
            };

            $scope.isInlandEquipmentRequired = () => {
                const equipment = $scope.equipmentList.find(eq => eq._id == $scope.myForm.equipmentType);
                $scope.inlandEquipmentRequired = (equipment && ['Ocean'].includes(equipment.equipmentType));
                return $scope.inlandEquipmentRequired;
            };

            $scope.generateNo = () => {
                if ($stateParams.type != 'edit' && $scope.myForm.commodityId && $scope.myForm.cropYear) {
                    $scope.myForm.contractNumber = '';

                    if ($scope.myForm.commodityId) {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == $scope.myForm.commodityId;
                        });
                        $scope.myForm.commodityName = $scope.commodityGrades[0].commodityName;
                    }

                    $scope.myForm.contractYear = moment(new Date()).format('YYYY');

                    salesContractHttpServices.getsalesContractCount($stateParams.buyerId, $scope.myForm.commodityId, $scope.myForm.cropYear, $scope.token, $scope.myForm.contractYear).then(function(res) {
                        if (res.data.status == 200) {

                            $scope.count = res.data.data;

                            if (!$stateParams.contractNumber) {
                                if ($scope.count) {
                                    var last_count = $scope.count.contractNumber.slice(-4);
                                    var next_sequence = Number(last_count) + 1;
                                    $scope.myForm.contractNumber = 'S' + $scope.myForm.cropYear + $scope.commodityGrades[0].commodityCode + next_sequence;
                                } else {
                                    $scope.myForm.contractNumber = 'S' + $scope.myForm.cropYear + $scope.commodityGrades[0].commodityCode + "2000";
                                }
                            }
                        }
                    });
                }

                $scope.getCommodityPricing($scope.myForm.commodityId, $scope.myForm.gradeId, $scope.myForm.cropYear);
            };

            $scope.getCommodityPricing = (commodityId, gradeId, cropYear) => {
                if (commodityId && gradeId && cropYear) {
                    salesStampHttpServices
                        .getCommodityPricing(commodityId, gradeId, cropYear, $scope.token)
                        .then(function(res) {
                            $scope.commodityPricingList = res.data.status == 200 ? res.data.data : {};
                            $scope.myForm.targetFOBCAD = 0;
                            if ($scope.commodityPricingList) {
                                $scope.commodityPricingList.targetFOB.toFixed(2);
                            }
                        });
                }
            };
//ship ment quantity -total quantity
            $scope.getEndDate = function(shipment, index) {
                shipment.endDate = moment(shipment.startDate).add(1, 'M').format('YYYY-MM-DD');
                if ($scope.myForm.contractQuantity > 0) {
                    var total_quantity = $scope.myForm.shipmentScheldule.sum('quantity');
                    shipment.quantity = $scope.myForm.contractQuantity - total_quantity;
                    shipment.quantity = shipment.quantity ? shipment.quantity.toFixed(2) : shipment.quantity;

                    var total_units = $scope.myForm.shipmentScheldule.sum('units');
                    shipment.units = $scope.myForm.packedIn - total_units;
                } else {
                    swal("Here's a message!", 'Please select contract quantity.', "error");
                }
            };

            Array.prototype.sum = function(prop) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++)
                    if (this[i][prop]) total += Number(this[i][prop]);
                return total;
            };

            $scope.validateQuantity = function(shipment) {
                if ($scope.myForm.contractQuantity > 0) {
                    $scope.myForm.contractQuantity = Number($scope.myForm.contractQuantity);
                    var total = $scope.myForm.shipmentScheldule.sum('quantity');
                    var remaining = $scope.myForm.contractQuantity.toFixed(2) - total.toFixed(2);
                    if (remaining < 0) {
                      shipment.quantity = 0;
                    }
                } else {
                    swal("Here's a message!", 'Please select contract quantity.', "error");
                }
            };

            $scope.validateUnit = (shipment) => {
                if ($scope.myForm.packedIn > 0) {
                    var total = $scope.myForm.shipmentScheldule.sum('units');
                    var remaining = $scope.myForm.packedIn - total;
                    if (remaining < 0) {
                        shipment.units = 0;
                    }
                } else {
                    swal("Here's a message!", 'Please select packedIn value.', "error");
                }
            };

            $scope.handleLoadingTypeChange = function (loadingType) {
                if (loadingType === 'Palletized and Shrink Wrapped') {
                    $scope.bags = $scope.bagList.filter(function(bag) {
                        return bag.includePallets;
                    });
                    return;
                }
                $scope.palletUnit = null;
                $scope.noOfPallets = 0;
                $scope.bags = $scope.bagList.map(function(bag) { return bag; });
            };

            var all_keys = ['brokerId', 'brokerNumber', 'commissionType', 'brokerCommision', 'brokerTaxNumber', 'showBroker', 'buyerReferenceNumber',
                'gradeId', 'inventoryGrade', 'noOfPallets', 'palletUnit', 'cropyear', 'tag', 'tagType', 'countryId', 'contractQuantity', 'units', 'packingUnit',
                'packedIn', 'loadingType', 'loadingPortId', 'equipmentType', 'noOfBags', 'variance', 'certificateAnalysis', 'equipmentId', 'destination',
                'freightCompanyId', 'netFOBCAD', 'qualityClause', 'shippingOption', 'contractCurrency', 'amount', 'amountUnit', 'pricingTerms', 'paymentMethod',
                'paymentTerms', 'showDocuments', 'exchangeRate', 'tradeRules', 'otherConditions', 'shippingComment', 'sampleApproval', 'unitFcl', 'stuffingInstruction'
            ];

            $scope.submit = (valid) => {

                var chosenbag = $scope.bags.find(function(bag) {
                    return $scope.myForm.packingUnit == bag._id;
                });

                var chosenFreightComapnay = $scope.myForm.freightCompanyList.find(function (freightCompany) {
                    return freightCompany._id == $scope.myForm.freightCompanyId;
                });

                if (chosenbag.bulkBag == 'Bag' && chosenFreightComapnay.oceanFreight.bagToBag <= 0) {
                    swal("Data invalid!", 'Bag price is not available with chosen freight company.', "error");
                    return;
                }

                if (chosenbag.bulkBag == 'Bulk' && chosenFreightComapnay.oceanFreight.bulkToBulk <= 0) {
                    swal("Data invalid!", 'Bulk price is not available with chosen freight company.', "error");
                    return;
                }

                $scope.submitted = true;
                var packedIn = $scope.myForm.shipmentScheldule.sum('units');
                var contractQuantity = $scope.myForm.shipmentScheldule.sum('quantity');
                contractQuantity = contractQuantity ? contractQuantity.toFixed(2) : contractQuantity;
                $scope.myForm.contractQuantity = $scope.myForm.contractQuantity ? (Number($scope.myForm.contractQuantity)).toFixed(2) : $scope.myForm.contractQuantity;

                if ($scope.myForm.units == "LBS") {
                    $scope.myForm.quantityLbs = $scope.myForm.contractQuantity;
                    $scope.myForm.cwtQuantity = $scope.myForm.quantityLbs / 100;
                } else if ($scope.myForm.units == "CWT") {
                    $scope.myForm.quantityLbs = $scope.myForm.contractQuantity * 100;
                    $scope.myForm.cwtQuantity = $scope.myForm.contractQuantity;
                } else if ($scope.myForm.units == "MT") {
                    $scope.myForm.quantityLbs = $scope.myForm.contractQuantity * 2204.62;
                    $scope.myForm.cwtQuantity = $scope.myForm.contractQuantity / 22.0462;
                } else if ($scope.myForm.units == "BU") {
                    const idx = $scope.commoditys.findIndex(c => c._id == $scope.myForm.commodityId);
                   $scope.myForm.quantityLbs = $scope.myForm.contractQuantity * $scope.commoditys[idx].commodityWeight ;
                    $scope.myForm.cwtQuantity = $scope.myForm.quantityLbs / 100;
                }

                if (!$scope.myForm.contractQuantity || $scope.myForm.contractQuantity < 1) {
                    swal("Here's a message!", 'Please enter contract quantity.', "error");
                    return;
                } else if (!$scope.myForm.packedIn || $scope.myForm.packedIn < 1) {
                    swal("Here's a message!", 'Please enter packedIn value.', "error");
                    return;
                } else if ($scope.myForm.contractQuantity != contractQuantity) {
                    swal("Here's a message!", 'Contract quanity and shipment total quantity must be equal.', "error");
                    return;
                } else if ($scope.myForm.packedIn != packedIn) {
                    swal("Here's a message!", 'Contract packedIn value  and shipment total packedIn value must be equal.', "error");
                    return;
                } else {

                    if ($scope.myForm._id) {

                        var changed_key = [];
                        for (var i = 0; i < all_keys.length; i++) {
                            if ($scope.oldData[all_keys[i]] != $scope.myForm[all_keys[i]]) {
                                changed_key.push(all_keys[i]);
                            }
                        }

                        var newDocuments = $scope.myForm.documents.filter(document => document._id).map((document) => document._id);
                        if ($scope.oldData.documents.length == newDocuments.length) {
                            var count = 0;
                            $scope.oldData.documents.forEach((documentId) => {
                                if (newDocuments.indexOf(documentId) != -1) count++;
                            });

                            if (count != newDocuments.length) changed_key.push("documents");
                        } else {
                            changed_key.push("documents");
                        }

                        // check changes in shipmentScheldule
                        if ($scope.myForm.shipmentScheldule.length == $scope.oldData.shipmentScheldule.length) {
                            for (var j = 0; j < $scope.myForm.shipmentScheldule.length; j++) {
                                if ($scope.myForm.shipmentScheldule[j].shipmentType != $scope.oldData.shipmentScheldule[j].shipmentType) {
                                    changed_key.push("shipmentSchedule");
                                    break;
                                } else if ($scope.myForm.shipmentScheldule[j].startDate != $scope.oldData.shipmentScheldule[j].startDate) {
                                    changed_key.push("shipmentSchedule");
                                    break;
                                } else if ($scope.myForm.shipmentScheldule[j].endDate != $scope.oldData.shipmentScheldule[j].endDate) {
                                    changed_key.push("shipmentSchedule");
                                    break;
                                } else if ($scope.myForm.shipmentScheldule[j].units != $scope.oldData.shipmentScheldule[j].units) {
                                    changed_key.push("shipmentSchedule");
                                    break;
                                } else {

                                    var oldQuantity = $scope.oldData.shipmentScheldule[j].quantity ? Number($scope.oldData.shipmentScheldule[j].quantity).toFixed(2) : 0;
                                    var newQuantity = $scope.myForm.shipmentScheldule[j].quantity ? Number($scope.myForm.shipmentScheldule[j].quantity).toFixed(2) : 0;
                                    if (oldQuantity != newQuantity) {
                                        changed_key.push("shipmentSchedule");
                                        break;
                                    }
                                }
                            }
                        } else {
                            changed_key.push("shipmentSchedule");
                        }

                        // console.log(changed_key);
                        $scope.myForm.someFieldValueChanged = changed_key.length ? true : false;

                    }

                    $scope.myForm.exchangeDeduction = $scope.currencyList[0].exchangeDeduction;
                    $scope.myForm.salesStampGenerated = false;
                    if (valid) {
                        if ($scope.myForm.contractCurrency == 'CAD') {
                            $scope.myForm.exchangeRate = 1;
                        }
                        if ($scope.myForm.showBroker) {
                            if (!$scope.myForm.brokerId) {
                                swal("Here's a message!", 'Please select broker.', "error");
                                return;
                            } else {
                                $scope.myForm.buyerId = $stateParams.buyerId;
                                $scope.myForm.date = moment($scope.myForm.date);
                                $scope.myForm.contractYear = moment($scope.myForm.date).format('YYYY');
                                $scope.myForm.documents = $scope.myForm.documents.filter(document => document._id).map((document) => document._id);
                                spinnerService.show("html5spinner");

                                salesContractHttpServices.addsalesContract($scope.myForm, $scope.token).then(function(res) {
                                    spinnerService.hide("html5spinner");
                                    if (res.data.status == 200) {
                                        swal({
                                            title: `Sales contract ${ $scope.myForm._id ? 'updated' : 'created'}`,
                                            text: `To ${ $scope.myForm._id ? 'updated' : 'generate'} sales stamp click on below button.`,
                                            type: "success",
                                            confirmButtonColor: "#DD6B55",
                                            confirmButtonText: "Generate",
                                            closeOnConfirm: true,
                                            closeOnCancel: true
                                        },
                                        function(isConfirm) {
                                            if (isConfirm) {
                                                $state.go('salesStamp',{
                                                    buyerId : res.data.data.buyerId,
                                                    contractNumber: res.data.data.contractNumber
                                                });
                                            }
                                        });

                                    }
                                });
                            }
                        } else {
                            $scope.myForm.buyerId = $stateParams.buyerId;
                            $scope.myForm.date = moment($scope.myForm.date);
                            $scope.myForm.contractYear = moment($scope.myForm.date).format('YYYY');
                            $scope.myForm.documents = $scope.myForm.documents.filter(document => document._id).map((document) => document._id);
                            spinnerService.show("html5spinner");

                            salesContractHttpServices.addsalesContract($scope.myForm, $scope.token).then(function(res) {
                                spinnerService.hide("html5spinner");
                                if (res.data.status == 200) {
                                    swal({
                                            title: `Sales contract ${ $scope.myForm._id ? 'updated' : 'created'}`,
                                            text: `To ${ $scope.myForm._id ? 'update' : 'generate'} sales stamp click on below button.`,
                                            type: "success",
                                            confirmButtonColor: "#DD6B55",
                                            confirmButtonText: "Generate",
                                            closeOnConfirm: true,
                                            closeOnCancel: true
                                        },
                                        function(isConfirm) {
                                            if (isConfirm) {
                                                $state.go('salesStamp',{
                                                    buyerId : res.data.data.buyerId,
                                                    contractNumber: res.data.data.contractNumber
                                                });
                                            }
                                        });
                                }
                            });
                        }
                    }
                }
            };

            $scope.delete = function(id) {
                if (id) {
                    $scope.arr = [id];
                }
                if ($scope.arr.length == 0) {
                    swal("Here's a message!", 'Select atleast one Sales Contract.', "error");
                } else {
                    $scope.data = {
                        idsArray: $scope.arr
                    };
                    swal({
                            title: "Are you sure?",
                            text: "Your will not be able to recover this Sales Contract!",
                            type: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#DD6B55",
                            confirmButtonText: "Yes, delete it!",
                            cancelButtonText: "No, cancel!",
                            closeOnConfirm: false,
                            closeOnCancel: false
                        },
                        function(isConfirm) {
                            if (isConfirm) {
                                salesContractHttpServices.removesalesContract($scope.data, $scope.token).then(function(res) {
                                    if (res.data.status == 200) {
                                        $scope.initSales();
                                        $scope.arr = [];
                                        $scope.allChecked = true;
                                        swal("Deleted!", "Your Sales Contract has been deleted.", "success");
                                    }
                                });
                            } else {
                                swal("Cancelled", "Your Sales Contract name is safe :)", "error");
                            }
                        });
                }
            };
            $scope.showBrokerNote = function(note) {
              $scope.brokerNote = note;
              console.log(note, 'called');

              $(".add_pdf_qty.broker-note").fadeIn();
              $(".popup_overlay").fadeIn();
            };

            $scope.uploadForm = {};
            $scope.openPopup = function (type, data) {
              if (type == "uploadPDF") {
                $scope.uploadForm.signedContractPdf = null;
                $scope.uploadForm.brokerNote = data.brokerNote;
                $scope.errMsg = "";
                $scope.file = "";
                $scope.selectedContract = data;
                $('[name="addPdfAndQtyForm_342159"]')[0].reset();
                $(".add_pdf_qty.upload-form-popup").fadeIn();
                $(".popup_overlay").fadeIn();
              }
            };

            $scope.selectFile = function (input, type) {
              $scope.uploadForm[type] = input.files[0];
              if (!$scope.uploadForm[type]) {
                return;
              }
              var ext = $scope.uploadForm[type].name.split(".").pop();
              if (!["pdf", "jpg", "png", "jpeg"].includes(ext)) {
                $scope.errMsgs = "Invalid file selected";
                $scope.uploadForm[type] = "";
              }
            };

            $scope.exportSheet = (data) => {
                var obj = { fileName: 'sales Contract' + ' report.xlsx' };
                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'salesContract/export', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
                request.setRequestHeader("Authorization", "Bearer " + $scope.token);
                request.onload = function(e) {
                    if (this.status === 200) {
                        var file = window.URL.createObjectURL(this.response);
                        var a = document.createElement("a");
                        a.href = file;
                        a.download = obj.fileName;
                        document.body.appendChild(a);
                        a.click();
                    }

                };

                var searchParam = Object.assign({}, $scope.searchModel);
                searchParam.getSum = true;
                searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
                searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');
                searchParam.shippingStartDate = commonService.adjustDate(searchParam.shippingStartDate);
                searchParam.shippingEndDate = commonService.adjustDate(searchParam.shippingEndDate, ']');
                searchParam.fileName = obj.fileName;
                console.log(searchParam);
                request.send(JSON.stringify(searchParam));
            };

            $scope.isverifyFucntion = (data) => {
                salesContractHttpServices.changeVerifyStatus(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        swal("Alert!", res.data.userMessage, "success");
                        $scope.initSales(1);
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            };

            $scope.savePaymentTerms = function(type) {
                spinnerService.show("html5spinner");
                if (type == 'paymentTerms') {
                    paymentTermsHttpService.addpaymentTerms($scope.payment, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initPaymentTerms();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'paymentMethod') {
                    paymentMethodHttpService.addpaymentMethod($scope.payment, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initpaymentMethod();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'pricingTerms') {
                    pricingTermsHttpService.addpricingTerms($scope.payment, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initpricingTerms();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'tradeRules') {
                    tradeRulesHttpService.addtradeRules($scope.payment, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.inittradeRules();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'documents') {
                    documentsHttpService.adddocuments($scope.payment, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initdocuments();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'bags') {
                    bagsHttpService.addbags($scope.payment, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.initbags();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'origins') {
                    originHttpService.addOrigin({ name: $scope.payment.originName }, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.loadOrigins();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                }
            };

            $scope.selectedFile = (input) => {
                $scope.file = input.files[0];
                if ($scope.file.name.split('.').pop() !== 'pdf') {
                    $scope.errMsg = "Invalid pdf file";
                    $scope.file = '';
                }
            };

            $scope.uploadPdf = (field) => {
              if (!($scope.uploadForm[field] || $scope.uploadForm.brokerNote)) {
                $scope.errMsg = 'Form can not be submitted empty';
                return;
              }

              spinnerService.show("html5spinner");
              var data = {
                file: $scope.uploadForm[field],
                field: field,
                brokerNote: ($scope.uploadForm.brokerNote || '')
              };
              salesContractHttpServices
                .uploadPdf(data, $scope.selectedContract._id, $scope.token)
                .then(
                  function (res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status == 200) {
                      Object.assign($scope.selectedContract, res.data.data);
                      $scope.closepop();
                      swal("Success", "Pdf uploaded successfully.", "success");
                      $scope.initSales($scope.page);
                    } else {
                      $scope.errMsg = res.data.userMessage;
                    }
                  },
                  function (error) {
                    spinnerService.hide("html5spinner");
                  }
                );
            };

            $scope.deleteSignedContract = (data) => {
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this signed contract!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            spinnerService.show("html5spinner");
                            salesContractHttpServices.removeSignedContract(data._id, $scope.token).then(function(res) {
                                spinnerService.hide("html5spinner");
                                if (res.data.status == 200) {
                                    data.contractIsSigned = false;
                                    swal("Deleted!", "Signed contract deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your signed contract is safe :)", "error");
                        }
                    });
            };

            $scope.email = (request) => {
                $scope.salesContractDetails = request;
                spinnerService.show("html5spinner");
                $timeout(function() {
                    var html = document.getElementById("printSectionId").innerHTML;
                    var data = {
                        html: html,
                        subject: 'Rudy Agro Delivery Contract Number - ' + $scope.salesContractDetails.contractNumber,
                        name: $scope.salesContractDetails.buyerId.businessName,
                        pdfType: 'Sales Contract',
                        email: $scope.salesContractDetails.buyerId.email
                    };

                    httpService.sendContract(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.mailData = res.data.data;
                            spinnerService.hide("html5spinner");
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                    });
                }, 1000);
            };

            $scope.changeSalesContractStatus = (contract) => {
                if(contract.status == 1) {
                    swal({
                        title: "Are you sure?",
                        text: "You want to adjust the purchase to the delivered qty?",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, Complete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: true,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            $scope.salesContractStatusChange(contract);
                        } else {
                            swal("Cancelled", "Your contract file is safe :)", "error");
                            $scope.search();
                        }
                    });
                } else {
                    $scope.salesContractStatusChange(contract);
                }
            };

            $scope.salesContractStatusChange = (contract) => {
                var data = {
                    _id: contract._id,
                    status: Number(contract.status),
                    statusChanged: true
                };
                const idx = $scope.salesContractList.findIndex(sc => sc._id == contract._id);
                spinnerService.show("html5spinner");
                salesContractHttpServices.changeSalesContractStatus(data, $scope.token).then(function(res) {
                    spinnerService.hide("html5spinner");
                        if (res.data.status == 200) {
                            $scope.salesContractList[idx] = res.data.data;
                            if ($scope.salesContractList[idx].shipmentScheldule) {
                                var newArr = [];
                                $scope.salesContractList[idx].shipmentScheldule.forEach(function(val) {
                                    if (val == null || Object.entries(val).length === 0) {

                                    } else {
                                        newArr.push(val);
                                    }
                                });
                                $scope.salesContractList[idx].shipmentScheldule = newArr;
                                if ($scope.salesContractList[idx].shipmentScheldule.length > 0) {
                                    $scope.salesContractList[idx].shimStartDate = $scope.salesContractList[idx].shipmentScheldule[0].startDate;
                                    $scope.salesContractList[idx].shimEndDate = $scope.salesContractList[idx].shipmentScheldule[$scope.salesContractList[idx].shipmentScheldule.length - 1].endDate;
                                }
                            }

                            var shipQty = $scope.salesContractList[idx].scale ?
                                $scope.salesContractList[idx].scale.reduce(function(acc, next) {
                                    return !next.void ? acc + next.unloadWeidht : acc;
                                }, 0) * 2.2046 : 0;
                            shipQty += ($scope.salesContractList[idx].tradeScale ?
                                $scope.salesContractList[idx].tradeScale.reduce(function(acc, next) {
                                    return !next.void ? acc + next.unloadWeidht : acc;
                                }, 0) * 2.2046 : 0);
                            shipQty += ($scope.salesContractList[idx].scale_loadsheet ?
                                $scope.salesContractList[idx].scale_loadsheet.reduce(function(acc, next) {
                                    return !next.void ? acc + next.unloadWeidht : acc;
                                }, 0) * 2.2046 : 0);

                            $scope.salesContractList[idx].delQty = Math.round(shipQty);
                            if ($scope.salesContractList[idx].shipmentScheldule) {
                                var newArr = $scope.salesContractList[idx].shipmentScheldule
                                    .filter(function(val){ return !(val == null || Object.entries(val).length === 0);});
                                $scope.salesContractList[idx].shipmentScheldule = newArr;
                                if ($scope.salesContractList[idx].shipmentScheldule.length > 0) {
                                    $scope.salesContractList[idx].shimStartDate = $scope.salesContractList[idx].shipmentScheldule[0].startDate;
                                    $scope.salesContractList[idx].shimEndDate = $scope.salesContractList[idx].shipmentScheldule[$scope.salesContractList[idx].shipmentScheldule.length - 1].endDate;
                                }

                            }
                            $scope.salesContractList[idx].status = $scope.salesContractList[idx].status.toString();

                            swal("Alert", res.data.userMessage, "success");
                        } else {
                            $scope.salesContractList[idx].status = contract.old_status;
                            swal("Error", res.data.userMessage, "success");
                        }
                    }
                );

            };

            $scope.getMaxWeight = function() {
              maxWeightHttpService.allMaxWeight($scope.token)
                .then(function(res) {
                  $scope.maxWeights = res.data.data;
                });
            };

            $scope.calculateMinDate = (index) => {
                date = $scope.myForm.date;
                return moment(date).add(1, 'D').format('YYYY-MM-DD');
            };

            $scope.plusAddNewTerms = function(type) {
                if (type == 'paymentTerms') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".paymentTerms").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'paymentMethod') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".paymentMethod").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'pricingTerms') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".pricingTerms").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'tradeRules') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".tradeRules").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'documents') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".documents").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'bags') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".bags").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'origins') {
                    $scope.payment = {};
                    $scope.inputField = type;
                    $(".origins").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'maxWeight') {
                  if (!$scope.maxWeights) $scope.getMaxWeight();
                  $scope.payment = {};
                  $scope.inputField = type;
                  $(".maxWeight").fadeIn();
                  $(".popup_overlay").fadeIn();
              }
            };

            $scope.openPop = function(type, data) {
                if (type == 'edit') {
                    $scope.inputField = type;
                    $scope.myForm = data;
                    $(".add_coomm").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'add') {
                    $scope.myForm = {};
                    $scope.inputField = type;
                    $(".add_coomm").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else if (type == 'uploadPDF') {
                    $scope.selectedContract = data;
                    $scope.file = '';
                    $scope.errMsg = '';
                    angular.element("input[type='file']").val(null);
                    $(".add_coomm").fadeIn();
                    $(".popup_overlay").fadeIn();
                } else {
                    $scope.inputField = type;
                    $scope.myForm = data;
                    $(".add_coomm").fadeIn();
                    $(".popup_overlay").fadeIn();
                }
            };
            $scope.closepop = function() {
                $(".add_coomm").fadeOut();
                $(".paymentTerms").fadeOut();
                $(".paymentMethod").fadeOut();
                $(".pricingTerms").fadeOut();
                $(".tradeRules").fadeOut();
                $(".documents").fadeOut();
                $(".bags").fadeOut();
                $(".popup_overlay").fadeOut();
            };
            $(".popup_overlay , .close").click(function() {
                $(".add_coomm").fadeOut();
                $(".paymentTerms").fadeOut();
                $(".paymentMethod").fadeOut();
                $(".pricingTerms").fadeOut();
                $(".tradeRules").fadeOut();
                $(".documents").fadeOut();
                $(".bags").fadeOut();
                $(".popup_overlay").fadeOut();
            });
            $('body').on('click', '.popup_overlay', function() {
                $scope.closepop();
            });

            $scope.ticketList = (contractNumber, delQty) => {
                if (delQty > 0) {
                    $state.go("ticketList", {
                        seqNo: 2,
                        contractNumber: contractNumber
                    });
                }
            };

        });
