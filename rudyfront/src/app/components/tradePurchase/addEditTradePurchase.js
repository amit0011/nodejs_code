angular
    .module('myApp.addEditTradePurchase', [])
    .controller('addEditTradePurchaseCtrl',
        function (
            $scope,
            tradePurchaseHttpServices,
            brokerHttpService,
            pricingTermsHttpService,
            paymentTermsHttpService,
            tradeRulesHttpService,
            documentsHttpService,
            equipmentHttpService,
            loadingPortHttpService,
            varianceHttpService,
            sudAdminHttpService,
            tagsHttpService,
            bagsHttpService,
            httpService,
            $state,
            $stateParams,
            currencyHttpService,
            $timeout,
            spinnerService,
            buyerHttpServices,
            imageUrl,
            $rootScope,
            certificateCostHttpService,
            paymentMethodHttpService,
            originHttpService,
            commonService
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.sales || !data.sales.tradePurchaseContract || (!data.sales.tradePurchaseContract.add || !data.sales.tradePurchaseContract.edit)) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            var state = $rootScope.previousState.$$state().name;

            if (state) {
                localStorage.setItem('prev_state', state);
            }
            $scope.myForm = {
                otherConditions: 'Sale is subject to EDC approval of the Buyer.'
            };
            $scope.payment = {};
            $scope.arr = [];
            $scope.active = {
                page: 'tradePurchaseContract'
            };
            $scope.allChecked = true;
            $scope.disableField = false;
            var i, item;
            $scope.printTicket = false;
            var pageNo = '';
            var brokerPage = '';
            $scope.backShow = false;
            $scope.userProfile = JSON.parse(localStorage.getItem('userProfile'));
            $scope.imagePath = imageUrl;
            $scope.myForm.date = moment(new Date()).format('YYYY-MM-DD');

            $scope.type = $stateParams.tradeId ? 'edit' : '';

            $scope.myForm.shipmentScheldule = [{}];
            $scope.searchModel = {
                limit: '10'
            };

            $scope.back = function () {
                $state.go('tradePurchase');
            };
            $scope.cropYears = commonService.cropYears();
            $scope.plusshipmentScheldule = function () {
                var rem_quantity = $scope.myForm.contractQuantity - $scope.myForm.shipmentScheldule.sum('quantity');
                var rem_units = $scope.myForm.packedIn - $scope.myForm.shipmentScheldule.sum('units');
                if (rem_quantity > 0 && rem_units > 0) {
                    $scope.myForm.shipmentScheldule.push({});
                }
            };

            $scope.removeshipmentScheldule = function (index) {
                $scope.myForm.shipmentScheldule.splice(index, 1);
            };

            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));

            $scope.initdocuments = () => {
                documentsHttpService.getdocuments($scope.token).then(function (res) {
                    $scope.documentsList = res.data.status == 200 ? res.data.data : [];
                });
            };

            $scope.initdocuments();

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
            $scope.loadOrigins();

            varianceHttpService.getvariance($scope.token).then(function (res) {
                $scope.varianceList = res.data.status == 200 ? res.data.data : [];
            });


            certificateCostHttpService.getcertificateCost('', $scope.token).then(function (res) {
                $scope.certificateCostList = res.data.status == 200 ? res.data.data : [];
            });


            sudAdminHttpService.getadmin(pageNo, $scope.token).then(function (res) {
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



            tagsHttpService.gettags($scope.token).then(function (res) {
                $scope.tagsList = res.data.status == 200 ? res.data.data : [];
            });


            $scope.inittradeRules = () => {
                tradeRulesHttpService.gettradeRules($scope.token).then(function (res) {
                    $scope.tradeRulesList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.inittradeRules();


            currencyHttpService.getcurrency($scope.token).then(function (res) {
                if (res.data.status == 200) {
                    $scope.currencyList = res.data.data;
                    $scope.myForm.exchangeRate = $scope.currencyList[0].currencyCADUSD;
                }
            });


            $scope.initpricingTerms = () => {
                pricingTermsHttpService.getpricingTerms($scope.token).then(function (res) {
                    $scope.pricingTermsList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.initpricingTerms();


            $scope.initPaymentTerms = () => {
                paymentTermsHttpService.getpaymentTerms($scope.token).then(function (res) {
                    $scope.paymentTermsList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.initPaymentTerms();


            $scope.initpaymentMethod = () => {
                paymentMethodHttpService.getpaymentMethod($scope.token).then(function (res) {
                    $scope.paymentMethodList = res.data.status == 200 ? res.data.data : [];
                });
            };
            $scope.initpaymentMethod();

            loadingPortHttpService.getLoadingPort('', $scope.token).then(function (res) {
                $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
            });


            $scope.initbags = () => {
                bagsHttpService.getbags('', $scope.token).then(function (res) {
                    $scope.bagsList = res.data.status == 200 ? res.data.data : [];
                });
            };

            $scope.initbags();


            brokerHttpService.getBroker(brokerPage, $scope.token).then(function (res) {
                $scope.brokerList = res.data.status == 200 ? res.data.data : [];
            });


            httpService.getCommodity($scope.token).then(function (res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            });

            $scope.matchingDocument = function(matchingDocId) {
                return function (x) { return x._id == matchingDocId;};
            };

            $scope.fetchBuyerDetails = function(buyerId) {
              buyerHttpServices.getBuyerDetails(buyerId, $scope.token).then(function (res) {
                $scope.buyerDetails = res.data.status == 200 ? res.data.data : [];
                if ($scope.buyerDetails.documents && $scope.buyerDetails.documents.length && $stateParams.type != 'edit' && !$stateParams.contractNumber) {
                    $timeout(function () {
                        $scope.documentsList.map(function (el) {
                            for (var i = 0; i < $scope.buyerDetails.documents.length; i++) {
                                if ($scope.buyerDetails.documents[i]._id == el._id) {
                                    el.ticked = true;
                                }
                            }
                        });
                    }, 2000);

                }
              },
              function (error) {
                  console.log(JSON.stringify(error));
              });
            };

            if ($stateParams.tradeId) {
                $scope.backShow = true;
                $scope.disableField = true;

                tradePurchaseHttpServices.getTradePurchaseDetails($stateParams.tradeId, $scope.token).then(function (res) {
                    if (res.data.status == 200) {
                      $scope.myForm = res.data.data;
                      $scope.fetchBuyerDetails($scope.myForm.buyerId);
                        var b = [];
                        for (var obj of res.data.data.shipmentScheldule) {
                            if (obj == null) {
                                b.push({});
                                $scope.myForm.shipmentScheldule = b;
                            }
                        }

                        if (res.data.data.documents) {
                            $timeout(function () {
                                $scope.documentsList.map(function (el) {
                                    for (var i = 0; i < res.data.data.documents.length; i++) {
                                        if (res.data.data.documents[i]._id == el._id) {
                                            var index = $scope.documentsList.findIndex($scope.matchingDocument(res.data.data.documents[i]._id));
                                            $scope.documentsList[index].ticked = true;
                                        }
                                    }
                                });
                            }, 1000);
                        }


                        $scope.getBrokerName($scope.myForm.brokerId);
                        $scope.getMethodOfShipping($scope.myForm.methodOfShipment);
                        $scope.getEquipmentType($scope.myForm.equipmentType);
                        $scope.getPackingUnitName($scope.myForm.packingUnit);
                        $scope.getTagtypeName($scope.myForm.tagType);
                        $scope.getDestinationPort(res.data.data.loadingPortId);
                        $scope.getGrade(res.data.data.commodityId);
                        $scope.getVariances($scope.myForm.variance);

                        $scope.myForm.cropYear = res.data.data.cropYear;
                        $scope.myForm.date = moment(res.data.data.date).format('YYYY-MM-DD');

                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                },
                    function (error) {
                        console.log(JSON.stringify(error));
                    });
            }


            $scope.getDestinationPort = (id) => {
                equipmentHttpService.getEquipment('', $scope.token, id).then(function (res) {
                    if (res.data.status == 200) {
                        $scope.inlandEquipmentList = [];
                        $scope.equipmentList = res.data.data;
                        for (var i = 0; i < res.data.data.length; i++) {
                            if (res.data.data[i].equipmentType == 'Inland') {
                                $scope.inlandEquipmentList.push(res.data.data[i]);
                            }
                        }
                    }
                });
            };




            $scope.getGrade = (id) => {
                if (id) {
                    spinnerService.show("html5spinner");

                    if ($scope.myForm.cropYear && $scope.myForm.commodityId && !$stateParams.tradeId) {
                        $scope.generateNo();
                    }
                    httpService.getGrade('', id, $scope.token).then(function (res) {
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



                    $timeout(function () {

                        if (Array.isArray($scope.commoditys)) {

                            $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
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

            $scope.getGradeName = (gradeId) => {
                if (gradeId) {
                    $timeout(function () {
                        $scope.gradesName = $scope.grades.filter(function (hero) {
                            return hero._id == gradeId;
                        });
                        if ($scope.gradesName) {
                            $scope.myForm.gradeName = $scope.gradesName[0].gradeName;
                        }
                    }, 1500);
                }
            };

            $scope.getSigneeSignatures = (signeeId) => {
                if (signeeId) {
                    $timeout(function () {
                        $scope.signeeSignatures = $scope.updatedAdminList.filter(function (hero) {
                            return hero._id == signeeId;
                        });
                        if ($scope.signeeSignatures) {
                            $scope.myForm.signature = $scope.signeeSignatures[0].signature;
                        }
                    }, 1500);
                }
            };

            $scope.getPackingUnitName = (bagId) => {
                if (bagId) {
                    $timeout(function () {
                        $scope.packingUnitsName = $scope.bagsList.filter(function (hero) {
                            return hero._id == bagId;
                        });
                        if ($scope.packingUnitsName && $scope.packingUnitsName.length) {
                            $scope.myForm.packingUnitName = $scope.packingUnitsName[0].name;
                            $scope.packingUnitBagsUnit = $scope.packingUnitsName[0].bagWeightUnit;
                            $scope.packingUnitBagsType = $scope.packingUnitsName[0].bulkBag;
                            $scope.myForm.bagWeight = $scope.packingUnitsName[0].bagWeight + ' ' + $scope.packingUnitsName[0].bagWeightUnit;
                        }
                    }, 1500);
                }
            };
            $scope.getTagtypeName = (tagId) => {
                if (tagId) {
                    $timeout(function () {
                        $scope.getTagsName = $scope.tagsList.filter(function (hero) {
                            return hero._id == tagId;
                        });
                        if ($scope.getTagsName) {
                            $scope.myForm.tagName = $scope.getTagsName[0].tags;
                        }
                    }, 1500);
                }
            };
            $scope.getBrokerName = (brokerId) => {
                if (brokerId) {
                    $timeout(function () {
                        $scope.getBrokersName = $scope.brokerList.filter(function (hero) {
                            return hero._id == brokerId;
                        });
                        if ($scope.getBrokersName) {
                            $scope.myForm.brokerName = $scope.getBrokersName[0].businessName;
                        }
                    }, 1500);
                }
            };
            $scope.getPricingTerms = (termsId) => {
                if (termsId) {
                    $timeout(function () {
                        $scope.getPriceTermsName = $scope.pricingTermsList.filter(function (hero) {
                            return hero._id == termsId;
                        });
                        if ($scope.getPriceTermsName) {
                            $scope.myForm.pricingTermsName = $scope.getPriceTermsName[0].pricingTerms;
                        }
                    }, 1500);
                }
            };
            $scope.getPaymentTerms = (paymentTermsId) => {
                if (paymentTermsId) {
                    $timeout(function () {
                        $scope.getPaymentTermsName = $scope.paymentTermsList.filter(function (hero) {
                            return hero._id == paymentTermsId;
                        });
                        if ($scope.getPaymentTermsName) {
                            $scope.myForm.paymentTermsName = $scope.getPaymentTermsName[0].paymentTerms;
                        }
                    }, 1500);
                }
            };
            $scope.getPaymentMethod = (paymentMethodId) => {
                if (paymentMethodId) {
                    $timeout(function () {
                        $scope.getPaymentMethodName = $scope.paymentMethodList.filter(function (hero) {
                            return hero._id == paymentMethodId;
                        });
                        if ($scope.getPaymentMethodName) {
                            $scope.myForm.paymentMethodName = $scope.getPaymentMethodName[0].paymentMethod;
                        }
                    }, 1500);
                }
            };
            $scope.getTradeRules = (tradeId) => {
                if (tradeId) {
                    $timeout(function () {
                        $scope.getTradeRulesName = $scope.tradeRulesList.filter(function (hero) {
                            return hero._id == tradeId;
                        });
                        if ($scope.getTradeRulesName) {
                            $scope.myForm.tradeRulesName = $scope.getTradeRulesName[0].tradeRules;
                        }
                    }, 1500);
                }
            };
            $scope.getMethodOfShipping = (shippingId) => {
                if (shippingId) {
                    $scope.getMethodOfShip = $scope.equipmentList.filter(function (hero) {
                        return hero._id == shippingId;
                    });
                    if ($scope.getMethodOfShip) {
                        $scope.myForm.methodOfShipmentName = $scope.getMethodOfShip[0].equipmentName;
                    }
                }
            };

            $scope.getVariances = (varianceId) => {
                if (varianceId) {
                    $timeout(function () {
                        $scope.getVariancesName = $scope.varianceList.filter(function (hero) {
                            return hero._id == varianceId;
                        });
                        if ($scope.getVariancesName) {
                            $scope.myForm.varianceName = $scope.getVariancesName[0].varianceName;
                        }
                    }, 1500);
                }
            };

            $scope.getEquipmentType = (equipmentTypeId) => {
                if (equipmentTypeId) {
                    $timeout(function () {
                        $scope.getEquipmentTypeName = $scope.equipmentList.filter(function (hero) {
                            return hero._id == equipmentTypeId;
                        });
                        //  console.log($scope.getEquipmentTypeName);
                        if ($scope.getEquipmentTypeName) {
                            $scope.myForm.equipmentTypeName = $scope.getEquipmentTypeName[0].equipmentName;
                        }
                    }, 1500);
                }
            };


            $scope.generateNo = () => {
                if ($stateParams.type != 'edit' && $scope.myForm.commodityId && $scope.myForm.cropYear) {
                    $scope.myForm.contractNumber = '';
                    if ($scope.myForm.commodityId) {
                        $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
                            return hero._id == $scope.myForm.commodityId;
                        });
                        $scope.myForm.commodityName = $scope.commodityGrades[0].commodityName;
                    }

                    $scope.myForm.contractYear = moment(new Date()).format('YYYY');

                    tradePurchaseHttpServices.getTradePurchaseCount($stateParams.buyerId, $scope.myForm.commodityId, $scope.myForm.cropYear, $scope.token, $scope.myForm.contractYear).then(function (res) {
                        if (res.data.status == 200) {

                            $scope.count = res.data.data;

                            if (!$stateParams.contractNumber) {
                                if ($scope.count) {
                                    var last_count = $scope.count.contractNumber.slice(-4);
                                    var next_sequence = Number(last_count) + 1;
                                    var converted_string = next_sequence.toString();
                                    next_sequence = converted_string.length == 3 ? "0" + next_sequence : next_sequence;
                                    $scope.myForm.contractNumber = 'P' + $scope.myForm.cropYear + $scope.commodityGrades[0].commodityCode + next_sequence;
                                } else {
                                    $scope.myForm.contractNumber = 'P' + $scope.myForm.cropYear + $scope.commodityGrades[0].commodityCode + "0100";
                                }
                            }
                        }
                    },
                        function (error) {
                            console.log(JSON.stringify(error));
                        });
                }
            };
            $scope.getEndDate = (shipment, index) => {
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

            Array.prototype.sum = function (prop) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++)
                    if (this[i][prop]) total += Number(this[i][prop]);
                return total;
            };



            $scope.validateQuantity = (shipment) => {
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


            $scope.submit = (valid) => {
                $scope.submitted = true;
                var packedIn = $scope.myForm.shipmentScheldule.sum('units');
                var contractQuantity = $scope.myForm.shipmentScheldule.sum('quantity');
                contractQuantity = contractQuantity ? contractQuantity.toFixed(2) : contractQuantity;
                $scope.myForm.contractQuantity = $scope.myForm.contractQuantity ? (Number($scope.myForm.contractQuantity)).toFixed(2) : $scope.myForm.contractQuantity;
                if (!$scope.myForm.contractQuantity || $scope.myForm.contractQuantity < 1) {
                    swal("Here's a message!", 'Please enter contract quantity.', "error");
                } else if (!$scope.myForm.packedIn || $scope.myForm.packedIn < 1) {
                    swal("Here's a message!", 'Please enter packedIn value.', "error");
                } else if ($scope.myForm.contractQuantity != contractQuantity) {
                    swal("Here's a message!", 'Contract quanity and shipment total quantity must be equal.', "error");
                } else if ($scope.myForm.packedIn != packedIn) {
                    swal("Here's a message!", 'Contract packedIn value  and shipment total packedIn value must be equal.', "error");
                } else {
                    $scope.myForm.salesStampGenerated = false;
                    if (valid) {
                        if ($scope.myForm.units == "Lbs") {
                            $scope.myForm.quantityLbs = $scope.myForm.contractQuantity;
                            $scope.myForm.cwtQuantity = $scope.myForm.quantityLbs / 100;
                        } else if ($scope.myForm.units == "CWT") {
                            $scope.myForm.quantityLbs = $scope.myForm.contractQuantity * 100;
                            $scope.myForm.cwtQuantity = $scope.myForm.contractQuantity;
                        } else if ($scope.myForm.units == "MT") {
                            $scope.myForm.quantityLbs = $scope.myForm.contractQuantity * 2204.62;
                            $scope.myForm.cwtQuantity = $scope.myForm.contractQuantity / 22.0462;
                        }
                        if ($scope.myForm.contractCurrency == 'CAD') {
                            $scope.myForm.exchangeRate = 1;
                        }

                        $scope.myForm.buyerId = $stateParams.buyerId;
                        $scope.myForm.date = moment($scope.myForm.date);
                        $scope.myForm.contractYear = moment($scope.myForm.date).format('YYYY');
                        $scope.myForm.documents = $scope.myForm.documents.filter(document => document._id).map((document) => document._id);


                        if ($scope.myForm.showBroker) {
                            if (!$scope.myForm.brokerId) {
                                swal("Here's a message!", 'Please select broker.', "error");
                            } else {

                                spinnerService.show("html5spinner");
                                tradePurchaseHttpServices.addtradePurchase($scope.myForm, $scope.token).then(function (res) {
                                    spinnerService.hide("html5spinner");
                                    if (res.data.status == 200) {
                                        $scope.myForm = {};
                                        $scope.commoditySampleAnalysis = [];
                                        $state.go('tradePurchase');

                                    } else {
                                        swal("Error", res.data.data.userMessage, "error");
                                    }
                                },
                                    function (error) {
                                        spinnerService.hdie("html5spinner");
                                    });
                            }
                        } else {

                            spinnerService.show("html5spinner");
                            tradePurchaseHttpServices.addtradePurchase($scope.myForm, $scope.token).then(function (res) {
                                spinnerService.hide("html5spinner");
                                if (res.data.status == 200) {
                                    $scope.myForm = {};
                                    $scope.commoditySampleAnalysis = [];
                                    $state.go('tradePurchase');

                                } else {
                                    swal("Error", res.data.data.userMessage, "error");
                                }
                            },
                                function (error) {
                                    spinnerService.hide("html5spinner");
                                });
                        }
                    }
                }
            };




            $scope.savePaymentTerms = function (type) {
                spinnerService.show("html5spinner");
                if (type == 'paymentTerms') {
                    paymentTermsHttpService.addpaymentTerms($scope.payment, $scope.token).then(function (res) {
                        if (res.data.status == 200) {
                            $scope.initPaymentTerms();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'paymentMethod') {
                    paymentMethodHttpService.addpaymentMethod($scope.payment, $scope.token).then(function (res) {
                        if (res.data.status == 200) {
                            $scope.initpaymentMethod();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'pricingTerms') {
                    pricingTermsHttpService.addpricingTerms($scope.payment, $scope.token).then(function (res) {
                        if (res.data.status == 200) {
                            $scope.initpricingTerms();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'tradeRules') {
                    tradeRulesHttpService.addtradeRules($scope.payment, $scope.token).then(function (res) {
                        if (res.data.status == 200) {
                            $scope.inittradeRules();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'documents') {
                    documentsHttpService.adddocuments($scope.payment, $scope.token).then(function (res) {
                        if (res.data.status == 200) {
                            $scope.initdocuments();
                            $scope.closepop();
                        } else {
                            swal("Error", res.data.userMessage, "error");
                        }
                        spinnerService.hide("html5spinner");
                    });
                } else if (type == 'bags') {
                    bagsHttpService.addbags($scope.payment, $scope.token).then(function (res) {
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

            $scope.calculateMinDate = (index) => {
                date = index == 0 ? $scope.myForm.date : $scope.myForm.shipmentScheldule[index - 1].endDate;
                return moment(date).add(1, 'D').format('YYYY-MM-DD');
            };


            $scope.plusAddNewTerms = function (type) {
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
                }
            };

            $scope.openPop = function (type, data) {
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
            $scope.closepop = function () {
                $(".add_coomm").fadeOut();
                $(".paymentTerms").fadeOut();
                $(".paymentMethod").fadeOut();
                $(".pricingTerms").fadeOut();
                $(".tradeRules").fadeOut();
                $(".documents").fadeOut();
                $(".bags").fadeOut();
                $(".popup_overlay").fadeOut();
            };
            $(".popup_overlay , .close").click(function () {
                $(".add_coomm").fadeOut();
                $(".paymentTerms").fadeOut();
                $(".paymentMethod").fadeOut();
                $(".pricingTerms").fadeOut();
                $(".tradeRules").fadeOut();
                $(".documents").fadeOut();
                $(".bags").fadeOut();
                $(".popup_overlay").fadeOut();
            });
            $('body').on('click', '.popup_overlay', function () {
                $scope.closepop();
            });
        });
