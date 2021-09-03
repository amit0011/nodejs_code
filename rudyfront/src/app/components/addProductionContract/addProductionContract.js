angular
    .module('myApp.addProductionContract', [])
    .controller('addProductionContractCtrl', function($rootScope, $scope, httpService, $state, $stateParams, $timeout, sudAdminHttpService, spinnerService, commonService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.purchase || !data.purchase.productionContracts || !data.purchase.productionContracts.viewMenu || (!data.purchase.productionContracts.add && !data.purchase.productionContracts.edit)) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'productionContract'
        };
        var state = $rootScope.previousState.$$state().name;
        if (state) {
            localStorage.setItem('prev_prod_state', state);
        }
        $scope.myForm = { CWTDel: 0 };
        $scope.sampleArr = [];
        $scope.shipmentArr = [];
        $scope.deliveryArr = [];
        $scope.myForm.landLocation = [{}];
        $scope.myForm.otherGradePrices = [{}];
        $scope.commodityTypePlus = true;
        $scope.commodityTypeInput = false;
        $scope.myForm.errorShowFob = false;
        $scope.disableField = false;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.growerId = $stateParams.growerId;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.productionContract = JSON.parse(localStorage.getItem('ProductionContract'));
        $scope.plusLandLocation = function() {
            $scope.myForm.landLocation.push({});
        };
        $scope.removeLandLocation = function(index) {
            $scope.myForm.landLocation.splice(index, 1);
        };
        $scope.plusotherGradePrices = function() {
            $scope.myForm.otherGradePrices.push({});
        };
        $scope.removeotherGradePrices = function(index) {
            $scope.myForm.otherGradePrices.splice(index, 1);
        };
        $scope.cropYears = commonService.cropYears();
        sudAdminHttpService.getGrainBuyer('ADMIN', 'Grain Buyer', $scope.token).then(function(res) {
            if (res.data.status == 200) {
                spinnerService.hide("html5spinner");
                $scope.grainBuyerList = res.data.data;
            } else {
                spinnerService.hide("html5spinner");
            }
        });

        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });

        $scope.getGrade = function(commodity) {
            if ($scope.myForm.commodityId && $scope.myForm.cropYear && $stateParams.type != 'edit') {
                $scope.generateContractNo();
            }
            var commodityId = typeof commodity === 'string' ? commodity : commodity._id;
            httpService.getGrade('', commodityId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.grades = res.data.data;
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
                }
            });
            $timeout(function() {
                $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                    return hero._id == commodity;
                });
                $scope.myForm.commodityName = $scope.commodityGrades[0] ? $scope.commodityGrades[0].commodityName : '';
            }, 1000);

        };
        $scope.getGradeName = (gradeId) => {
            if (gradeId) {
                $timeout(function() {
                    $scope.gradesName = $scope.grades.filter(function(hero) {
                        return hero._id == gradeId;
                    });
                    if ($scope.gradesName) {
                        $scope.myForm.gradeName = $scope.gradesName[0].gradeName;
                    }
                }, 1500);
            }
        };

        $scope.priceOptionChanged = function () {
          if ($scope.myForm.priceOption !== 'Fixed') {
            $scope.myForm.fixedPrice = null;
            $scope.myForm.fixedPriceUnit = '';
            $scope.myForm.fixedOnFirst = null;
            $scope.myForm.quantityLbs = 0;
          }
        };
        $scope.getCwtDelPrice = () => {
            $scope.priceOptionChanged();
            $scope.getBushelweight = $scope.commoditys && $scope.commoditys.filter(function(hero) {
                return hero._id == $scope.myForm.commodityId;
            });
            if ($scope.myForm.fixedPriceUnit == "Lbs") {
                $scope.myForm.quantityLbs = ($scope.myForm.fixedOnFirst || 0) * ($scope.myForm.acres || 0);
                $scope.CWTDel = (($scope.myForm.fixedPrice || 0) * 100) + ($scope.myForm.freightRate || 0) / 22.0462;

            } else if ($scope.myForm.fixedPriceUnit == "CWT") {
                $scope.myForm.quantityLbs = (($scope.myForm.fixedOnFirst || 0) * ($scope.myForm.acres || 0)) * 100;
                $scope.CWTDel = (Number($scope.myForm.fixedPrice) || 0) + ($scope.myForm.freightRate || 0) / 22.0462;

            } else if ($scope.myForm.fixedPriceUnit == "Bu") {
                $scope.myForm.quantityLbs = (($scope.myForm.fixedOnFirst || 0) * ($scope.myForm.acres || 0)) * Number($scope.getBushelweight[0].commodityWeight); //bushel weight set for commodity in commodity setup
                $scope.CWTDel = (($scope.myForm.fixedPrice || 0) * 100 / Number($scope.getBushelweight[0].commodityWeight)) + ($scope.myForm.freightRate || 0) / 22.0462;
            }

            if ($scope.CWTDel) {
                $scope.CWTDel = $scope.CWTDel.toFixed(2);
            }
            $scope.myForm.CWTDel = $scope.CWTDel;
        };
        $scope.btnShow = $stateParams.type;
        if ($stateParams.type == 'view' && $stateParams.contractNo) {
            httpService.getProductionContractByContractNo($stateParams.contractNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.contractDetailsByNo = res.data.data;
                    $scope.myForm = $scope.contractDetailsByNo;
                    $scope.myForm.contractReturnDate = moment($scope.contractDetailsByNo.contractReturnDate).format('YYYY-MM-DD');
                    $scope.myForm.deliveryDateFrom = moment($scope.contractDetailsByNo.deliveryDateFrom).format('YYYY-MM-DD');
                    $scope.myForm.deliveryDateTo = moment($scope.contractDetailsByNo.deliveryDateTo).format('YYYY-MM-DD');
                    $scope.myForm.landLocation = $scope.contractDetailsByNo.landLocation;
                    $scope.myForm.commodityId = $scope.contractDetailsByNo.commodityId._id;
                    if (!$scope.myForm.farmName) {
                      $scope.myForm.farmName = $scope.myForm.growerId ? $scope.myForm.growerId.farmName : null;
                    }
                    $scope.getGrade($scope.myForm.commodityId);
                    $scope.getGradeName($scope.contractDetailsByNo.gradeId._id);
                    var b = [];
                    for (var obj1 of res.data.data.otherGradePrices) {
                        if (obj1 == null) {
                            b.push({});
                            $scope.myForm.otherGradePrices = b;
                        }
                    }
                    var c = [];
                    for (var obj of res.data.data.landLocation) {
                        if (obj == null) {
                            c.push({});
                            $scope.myForm.landLocation = c;
                        }
                    }
                    if ($scope.contractDetailsByNo.personFarmType == 'Person') {
                        $scope.myForm.growerFullName = $scope.contractDetailsByNo.growerId.firstName + ' ' + $scope.contractDetailsByNo.growerId.lastName;
                    } else {
                        $scope.myForm.growerFullName = $scope.contractDetailsByNo.growerId.farmName;
                    }
                    $scope.myForm.gradeId = $scope.contractDetailsByNo.gradeId._id;
                    $scope.myForm.contractNumber = $scope.contractDetailsByNo.contractNumber;

                    $scope.oldData = angular.copy($scope.myForm);
                }
            }); 
        } else if ($stateParams.type == 'edit') {
            $scope.btnType = 'Save Changes';
            httpService.getProductionContractByContractNo($stateParams.contractNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.contractDetailsByNo = res.data.data;
                    $scope.myForm = $scope.contractDetailsByNo;
                    $scope.myForm.contractReturnDate = moment($scope.contractDetailsByNo.contractReturnDate).format('YYYY-MM-DD');
                    $scope.myForm.deliveryDateFrom = moment($scope.contractDetailsByNo.deliveryDateFrom).format('YYYY-MM-DD');
                    $scope.myForm.deliveryDateTo = moment($scope.contractDetailsByNo.deliveryDateTo).format('YYYY-MM-DD');
                    $scope.myForm.landLocation = $scope.contractDetailsByNo.landLocation;
                    $scope.myForm.commodityId = $scope.contractDetailsByNo.commodityId._id;
                    if (!$scope.myForm.farmName) {
                      $scope.myForm.farmName = $scope.myForm.growerId ? $scope.myForm.growerId.farmName : null;
                    }
                    $scope.getGrade($scope.myForm.commodityId);
                    $scope.getGradeName($scope.contractDetailsByNo.gradeId._id);
                    var b = [];
                    for (var obj1 of res.data.data.otherGradePrices) {
                        if (obj1 == null) {
                            b.push({});
                            $scope.myForm.otherGradePrices = b;
                        }
                    }
                    var c = [];
                    for (var obj of res.data.data.landLocation) {
                        if (obj == null) {
                            c.push({});
                            $scope.myForm.landLocation = c;
                        }
                    }
                    if ($scope.contractDetailsByNo.personFarmType == 'Person') {
                        $scope.myForm.growerFullName = $scope.contractDetailsByNo.growerId.firstName + ' ' + $scope.contractDetailsByNo.growerId.lastName;
                    } else {
                        $scope.myForm.growerFullName = $scope.contractDetailsByNo.growerId.farmName;
                    }
                    $scope.myForm.gradeId = $scope.contractDetailsByNo.gradeId._id;
                    $scope.myForm.contractNumber = $scope.contractDetailsByNo.contractNumber;

                    $scope.oldData = angular.copy($scope.myForm);
                }
            });
        } else {
            $scope.btnType = 'Submit';
            $scope.oldData = {};
        }
        httpService.getGrowerDetails($scope.growerId, $scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.growerDetails = res.data.data;
            } else {
                swal("Error", res.data.userMessage, "error");
            }
        });

        var growerId = '';

        if ($scope.productionContract) {
            $scope.productionContract.contractReturnDate = moment($scope.productionContract.contractReturnDate).format('YYYY-MM-DD');
            $scope.productionContract.deliveryDateFrom = moment($scope.productionContract.deliveryDateFrom).format('YYYY-MM-DD');
            $scope.productionContract.deliveryDateTo = moment($scope.productionContract.deliveryDateTo).format('YYYY-MM-DD');
            $timeout(function() {
                $scope.getGrade($scope.productionContract.commodityId);
            }, 1000);
            $scope.myForm = $scope.productionContract;
            $scope.myForm.landLocation = JSON.parse(localStorage.getItem('landLocation'));
        }
        $scope.generateContractNo = () => {
            if ($stateParams.type != 'edit' && $stateParams.type != 'view' && $stateParams.type == 'add') {
                if ($scope.myForm.commodityId) {
                    $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                        return hero._id == $scope.myForm.commodityId;
                    });
                    $scope.myForm.commodityName = $scope.commodityGrades[0] ? $scope.commodityGrades[0].commodityName : '';
                }

                httpService.getProductionContractCount($scope.myForm.cropYear, $scope.myForm.commodityId, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.count = res.data.data;
                        if ($scope.count) {
                            var contractNumber = $scope.count.contractNumber.replace('-R', '');
                            var last_count = contractNumber.slice(-4);
                            var next_sequence = Number(last_count) + 1;
                            $scope.myForm.contractNumber = 'P' + $scope.myForm.cropYear + $scope.commodityGrades[0].commodityCode + next_sequence;
                        } else {
                            $scope.myForm.contractNumber = 'P' + $scope.myForm.cropYear + $scope.commodityGrades[0].commodityCode + "2000";
                        }
                    }
                });
            }
        };

        var all_keys = [
            'nameOfContract', 'personFarmType', 'farmName', 'acres', 'landLocation', 'deliveryDateFrom', 'deliveryDateTo',
            'priceOption', 'deliveryOption', 'freightRate', 'fixedPrice', 'fixedPriceUnit', 'fixedOnFirst', 'fixedAdditionalProduction',
            'contractReturnDate', 'growerRetain', 'growerRetainUnits', 'CWTDel', 'delQty', 'harvestQty', 'harvestFileUrl',
            'otherComments', 'grainBuyer', 'gradeId', 'inventoryGrade', 'quantityLbs', 'units', 'contractNumber', 'commodityId',
            'cropYear', 'growerId', 'productionContractId', 'createdBy', 'status'
        ];

        $scope.submit = function(valid, error) {
          // console.log(error, valid);
            $scope.submitted = true;
            if (valid && $scope.myForm.priceOption) {
                if ($scope.myForm.priceOption == 'Fixed') {
                    valid = true;
                } else {
                    valid = true;
                }
            }
            if (valid && $scope.myForm.deliveryOption) {
                if ($scope.myForm.deliveryOption == 'FOB Farm') {
                    valid = true;
                    if(!$scope.myForm.freightRate){
                        valid = false;
                    }
                } else {
                    valid = true;
                }
            }

            if (valid) {
                if (!$scope.myForm.contractNumber) {
                    if ($scope.productionContract) {
                        $scope.myForm.contractNumber = $scope.productionContract.contractNumber;
                        $scope.myForm._id = $scope.productionContract._id;
                    }
                    if ($scope.myForm.personFarmType == 'Person') {
                        $scope.myForm.growerId = $scope.growerId;
                    } else {
                        $scope.myForm.growerId = $scope.growerId;
                    }
                }
                $scope.getBushelweight = $scope.commoditys.filter(function(hero) {
                    return hero._id == $scope.myForm.commodityId;
                });
                if ($scope.myForm.priceOption == 'Fixed') {
                    $scope.getCwtDelPrice();

                    var rolloverKeys = typeof $scope.myForm.rollover == 'object' ? _.keys($scope.myForm.rollover) : [];
                    if (rolloverKeys.length) {

                        if ( rolloverKeys.length > 1 ) {
                            var lastKey = rolloverKeys.sort().pop();
                            var sumofPrevQuantities = 0;
                            var quantityLbs;
                            for(var year of rolloverKeys) {
                                quantityLbs = ($scope.myForm.rollover[year].quantityLbs - 0);
                                sumofPrevQuantities += ( isNaN(quantityLbs) ? 0 : quantityLbs);
                            }
                            var qtyToUpdate = $scope.myForm.quantityLbs - sumofPrevQuantities;
                            if (qtyToUpdate >= 0) {
                                $scope.myForm.rollover[lastKey].quantityLbs = qtyToUpdate;
                            } else {
                                swal("Here's a message!", 'Quantity you entered is less than sum of previous year rollover quantities.', "error");
                                return;
                            }
                        } else {
                            $scope.myForm.rollover[rolloverKeys[0]].quantityLbs = $scope.myForm.quantityLbs;
                        }
                    }
                }
                $scope.myForm.createdBy = $scope.myForm.signee;
                $scope.myForm.deliveryDateFrom = moment($scope.myForm.deliveryDateFrom);
                $scope.myForm.deliveryDateTo = moment($scope.myForm.deliveryDateTo);
                $scope.myForm.contractReturnDate = moment($scope.myForm.contractReturnDate);

                $scope.myForm.growerId = $scope.growerId;
                spinnerService.show("html5spinner");

                var changed_key = [];
                for (var i = 0; i < all_keys.length; i++) {
                    if ($scope.oldData[all_keys[i]] != $scope.myForm[all_keys[i]]) {
                        changed_key.push(all_keys[i]);
                    }
                }

                $scope.myForm.someFieldValueChanged = changed_key.length ? true : false;
                httpService.addProductionContract($scope.myForm, $scope.token).then(function(res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status == 200) {
                        localStorage.setItem('ProductionContract', JSON.stringify(res.data.data));
                        localStorage.setItem('landLocation', JSON.stringify($scope.myForm.landLocation));
                        if (res.data.data) {

                            var state = localStorage.getItem('prev_prod_state');
                            if (state) {
                                if (state == 'productionContract') {
                                    $state.go('productionContract');
                                } else {
                                    $state.go('growerDetails', {
                                        id: $stateParams.growerId
                                    });
                                }
                            } else {
                                $state.go('productionContract');
                            }
                        }
                    }
                });
            }
        };

        $scope.viewPdf = () => {
            $state.go('confirmProductionContract', {
                growerId: $scope.growerId,
                contractNo: $scope.myForm.contractNumber
            });
        };
        $scope.print = function(printSectionId) {
            $timeout(function() {
                var innerContents = document.getElementById("printSectionId").innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=800,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();
                $state.go('growerDetails', {
                    growerId: $scope.growerId
                });
            }, 1000);

        };
        $scope.plusGrade = function(type, data) {
            $(".add_coomm").fadeIn();
            $(".popup_overlay").fadeIn();
        };
        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
        };
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });
