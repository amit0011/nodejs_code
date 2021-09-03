angular.module('myApp.commodity', [])
    .controller('commodityCtrl', function($scope, httpService, $rootScope, $state) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.commodities || !data.setting.commodities.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'commodity'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.sampleArr = [];
        $scope.shipmentArr = [];
        $scope.deliveryArr = [];
        $scope.allChecked = true;
        var i, item;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initCommodity = function() {
            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commodity = res.data.status == 200 ? res.data.data : [];
            });
        };

        httpService.getCommodityType($scope.token, {populateByProducts: true}).then(function(res) {
            $scope.commodityList = res.data.status == 200 ? res.data.data : [];
        });


        httpService.getAnalysis($scope.token).then(function(res) {
            $scope.analysisList = res.data.status == 200 ? res.data.data : [];
        });

        $scope.getByProductCommodity = function(byProductTypes) {
            $scope.byProducts = [];
            byProductTypes.forEach(function(bpType) {
                var bp = $scope.commodity.filter(function(commodity) {
                    return commodity.commodityTypeId._id == bpType._id;
                });
                $scope.byProducts = $scope.byProducts.concat(bp);
            });
        };

        $scope.organicOptions = [
          {text: 'Yes', value: true},
          {text: 'No', value: false},
        ];

        $scope.calculateByProduct = function() {
            // find the commodity type of selected commodity
            var selectedCommodityType = $scope.commodityList.find(function(commodityType) {
                return commodityType._id == $scope.updateForm.commodityTypeId;
            });

            // find out byProducts setting on behalf of selected commodity Type
            // and find out if total damage column to show on by-producs setting
            var byProductsTypes = [];
            $scope.willHaveTotalDamage = false;
            if (selectedCommodityType && selectedCommodityType.byProducts) {
                byProductsTypes = selectedCommodityType.byProducts;
                $scope.willHaveTotalDamage = selectedCommodityType.willHaveTotalDamage;
            }

            // find out and set byProducts commodities list to show on UI
            $scope.getByProductCommodity(byProductsTypes);

            // merging saved by-product setting and by-product list to show on UI
            $scope.mergeSpecsToByProducts();
        };

        $scope.mergeSpecsToByProducts = function() {
            $scope.byProducts.forEach(function(byProduct) {

                // filter out byProduct and specs already saved commodities
                var byProductInDb = $scope.updateForm.byProducts ?
                    $scope.updateForm.byProducts.find(function(bp) {return bp.byProduct == byProduct._id;}) :
                    {};

                // go through commodities selected delivery specs to find out selected one for by-product
                var deliveries = $scope.deliveryArr.map(function(del) {
                    var checked = byProductInDb && byProductInDb.specs ? byProductInDb.specs.includes(del) : false;
                    return {spec: del, checked: checked};
                });

                byProduct.deliverySpecs = deliveries;
                byProduct.willHaveTotalDamage = byProductInDb && byProductInDb.willHaveTotalDamage ? true : false;
            });
        };

        $scope.sampleCheckBox = function(id) {
            var idx = $scope.sampleArr.indexOf(id);
            if (idx > -1) {
                $scope.sampleArr.splice(idx, 1);
            } else {
                $scope.sampleArr.push(id);
            }
        };

        $scope.getSampleAnalysisNameById = sample => {
            const analysis = $scope.updateForm.commoditySampleAnalysis.find(s => s._id == sample);
            if (!analysis) {
                return '';
            }
            return analysis.analysisName;
        };

        $scope.getDeliveryAnalysisNameById = delivery => {
            const analysis = $scope.updateForm.commodityDeliveryAnalysis.find(d => d._id == delivery);
            if (!analysis) {
                return '';
            }
            return analysis.analysisName;
        };

        $scope.getShipmentAnalysisNameById = shipment => {
            const analysis = $scope.updateForm.commodityShipmentAnalysis.find(s => s._id == shipment);
            if (!analysis) {
                return '';
            }
            return analysis.analysisName;
        };

        $scope.deliveryCheckBox = function(id,obj) {
            var idx = $scope.deliveryArr.indexOf(id);
            if (idx > -1) {
                $scope.deliveryArr.splice(idx, 1);
            } else {
                $scope.deliveryArr.push(id);
            }
            $scope.mergeSpecsToByProducts();
        };

        $scope.showDeliveryCheckBox = function(id) {
            var idx = $scope.showDeliveryArr.indexOf(id);
            if (idx > -1) {
                $scope.showDeliveryArr.splice(idx, 1);
            } else {
                $scope.showDeliveryArr.push(id);
            }
        };

        $scope.showByProducts = function () {
            if (!($scope.updateForm && $scope.updateForm.commodityTypeId)) {
                return false;
            }
            return $scope.deliveryArr.length > 0 && $scope.byProducts && $scope.byProducts.length;
        };

        $scope.shipmentCheckBox = function(id,obj) {
            var idx = $scope.shipmentArr.indexOf(id);
            if (idx > -1) {
                $scope.shipmentArr.splice(idx, 1);
            } else {
                $scope.shipmentArr.push(id);
            }
        };

        $scope.showShipmentCheckBox = function(id) {
            var idx = $scope.showShipmentArr.indexOf(id);
            if ( idx > -1) {
                $scope.showShipmentArr.splice(idx, 1);
            } else {
                $scope.showShipmentArr.push(id);
            }
        };

        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.commodity.length; i++) {
                    item = $scope.commodity[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.commodity[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.commodity.length; i++) {
                    item = $scope.commodity[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.commodity[i]._id);
                    $scope.allChecked = true;
                }
            }
        };

        $scope.byProductCheckBox = function(byProduct, specs, forTotalDamage) {
            var id = byProduct._id;
            if (!$scope.updateForm.byProducts) {
                $scope.updateForm.byProducts = [];
            }

            var idx = $scope.updateForm.byProducts.findIndex(function(bp) {
                return bp.byProduct == id;
            });

            if (forTotalDamage) {
                $scope.setTotalDamage(idx, byProduct);
            } else {
                $scope.setSpecs(idx, id, specs);
            }
        };

        $scope.setSpecs = function(idx, byProductId, specs) {
            if (!specs.checked && idx === -1) {
                return;
            }

            // case if want to remove specs
            if (!specs.checked) {
                $scope.updateForm.byProducts[idx].specs = $scope.updateForm.byProducts[idx].specs.filter(function(s) {
                    return s !== specs.spec;
                });
                return;
            }

            // case if want to add specs
            if (idx === -1) {
                $scope.updateForm.byProducts.push({byProduct: byProductId, specs: [specs.spec]});
                return;
            }

            $scope.updateForm.byProducts[idx].specs.push(specs.spec);
        };

        $scope.setTotalDamage = function (idx, byProduct) {
            if (!byProduct.willHaveTotalDamage && idx === -1) {
                return;
            }

            // case if want to add specs
            if (idx === -1) {
                $scope.updateForm.byProducts.push({
                    byProduct: byProduct._id,
                    specs: [],
                    willHaveTotalDamage: true
                });
                return;
            }

            $scope.updateForm.byProducts[idx].willHaveTotalDamage = byProduct.willHaveTotalDamage;
        };

        $scope.checkBox = function(id) {
            if ($scope.arr.indexOf(id) > -1) {
                $scope.arr.splice(id, 1);
            } else {
                $scope.arr.push(id);
            }
        };

        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one commodity.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this commodity!",
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
                            httpService.removeCommodity($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initCommodity();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your commodity has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your commodity file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.openPop = function(type, data) {
            // $scope.initCommodity();
            if (type == 'edit') {
                $scope.sampleArr = [];
                $scope.shipmentArr = [];
                $scope.deliveryArr = [];
                $scope.showDeliveryArr = [];
                $scope.showShipmentArr = [];
                $scope.updateForm = {};
                $scope.inputField = type;
                $scope.newData = data;
                for (var i = 0; i < $scope.newData.commoditySampleAnalysis.length; i++) {
                    $scope.sampleArr.push($scope.newData.commoditySampleAnalysis[i]._id);
                }
                for (var j = 0; j < $scope.newData.commodityDeliveryAnalysis.length; j++) {
                    $scope.deliveryArr.push($scope.newData.commodityDeliveryAnalysis[j]._id);
                }

                if ($scope.newData.commodityShowDeliveryAnalysis && $scope.newData.commodityShowDeliveryAnalysis.length) {
                    $scope.showDeliveryArr = $scope.newData.commodityShowDeliveryAnalysis;
                } else {
                    $scope.newData.commodityShowDeliveryAnalysis = [];
                }

                for (var k = 0; k < $scope.newData.commodityShipmentAnalysis.length; k++) {
                    $scope.shipmentArr.push($scope.newData.commodityShipmentAnalysis[k]._id);
                }

                if ($scope.newData.commodityShowShipmentAnalysis && $scope.newData.commodityShowShipmentAnalysis.length) {
                    $scope.showShipmentArr = $scope.newData.commodityShowShipmentAnalysis;
                } else {
                    $scope.newData.commodityShowShipmentAnalysis = [];
                }

                $scope.updateForm = _.clone(data);
                $scope.updateForm.commodityTypeId = data.commodityTypeId._id;

                var temp = [];
                $scope.analysisList.filter(function(el) {
                    var test = _.clone(el);
                    test.checked = false;
                    for (var l = 0; l < $scope.updateForm.commoditySampleAnalysis.length; l++) {
                        if (test._id == $scope.updateForm.commoditySampleAnalysis[l]._id) {
                            test.checked = true;
                        }
                    }
                    temp.push(test);
                });
                $scope.updateForm.commoditySampleAnalysis = temp;

                var temp11 = [];
                $scope.analysisList.filter(function(el) {
                    var test = _.clone(el);
                    test.checked = false;
                    for (var m = 0; m < $scope.updateForm.commodityShipmentAnalysis.length; m++) {
                        if (test._id == $scope.updateForm.commodityShipmentAnalysis[m]._id) {
                            test.checked = true;
                        }
                    }
                    test.selected = $scope.updateForm.commodityShowShipmentAnalysis.indexOf(test._id) != -1 ? true : false;
                    temp11.push(test);
                });
                $scope.updateForm.commodityShipmentAnalysis = temp11;

                var temp22 = [];
                $scope.analysisList.filter(function(el) {
                    var test = _.clone(el);
                    test.checked = false;
                    test.selected = false;

                    for (var n = 0; n < $scope.updateForm.commodityDeliveryAnalysis.length; n++) {
                        if (test._id == $scope.updateForm.commodityDeliveryAnalysis[n]._id) {
                            test.checked = true;
                        }
                    }

                    test.selected = $scope.updateForm.commodityShowDeliveryAnalysis.indexOf(test._id) != -1 ? true : false;
                    temp22.push(test);
                });

                $scope.updateForm.commodityDeliveryAnalysis = temp22;
                $scope.calculateByProduct();
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            } else {
                $scope.inputField = type;
                $scope.newData = data;
                $scope.updateForm = _.clone(data);
                $scope.updateForm.commodityTypeId = data.commodityTypeId._id;

                if (!$scope.updateForm.commodityShowDeliveryAnalysis) {
                    $scope.updateForm.commodityShowDeliveryAnalysis = [];
                }

                if (!$scope.updateForm.commodityShowShipmentAnalysis) {
                    $scope.updateForm.commodityShowShipmentAnalysis = [];
                }


                var temp_1 = [];
                $scope.analysisList.filter(function(el) {
                    var test = _.clone(el);
                    test.checked = false;
                    for (var o = 0; o < $scope.updateForm.commoditySampleAnalysis.length; o++) {
                        if (test._id == $scope.updateForm.commoditySampleAnalysis[o]._id) {
                            test.checked = true;
                        }
                    }

                    temp_1.push(test);
                });
                $scope.updateForm.commoditySampleAnalysis = temp_1;

                var temp1 = [];
                $scope.analysisList.filter(function(el) {
                    var test = _.clone(el);
                    test.checked = false;
                    for (var p = 0; p < $scope.updateForm.commodityShipmentAnalysis.length; p++) {
                        if (test._id == $scope.updateForm.commodityShipmentAnalysis[p]._id) {
                            test.checked = true;
                        }
                    }
                    test.selected = $scope.updateForm.commodityShowShipmentAnalysis.indexOf(test._id) != -1 ? true : false;
                    temp1.push(test);
                });
                $scope.updateForm.commodityShipmentAnalysis = temp1;

                var temp2 = [];
                $scope.analysisList.filter(function(el) {
                    var test = _.clone(el);
                    test.checked = $scope.updateForm.commodityDeliveryAnalysis;
                    for (var q = 0; q < $scope.updateForm.commodityDeliveryAnalysis.length; q++) {
                        if (test._id == $scope.updateForm.commodityDeliveryAnalysis[q]._id) {
                            test.checked = true;
                        }
                    }
                    test.selected = $scope.updateForm.commodityShowDeliveryAnalysis.indexOf(test._id) != -1 ? true : false;
                    temp2.push(test);
                });
                $scope.updateForm.commodityDeliveryAnalysis = temp2;

                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };

        $scope.saveChanges = function() {
            $scope.updateForm.commoditySampleAnalysis = $scope.sampleArr;
            $scope.updateForm.commodityShipmentAnalysis = $scope.shipmentArr;
            $scope.updateForm.commodityDeliveryAnalysis = $scope.deliveryArr;
            $scope.updateForm.commodityWeightType = 'Lbs';
            $scope.updateForm.commodityShowDeliveryAnalysis = $scope.showDeliveryArr.filter((val) => val).map((val1) => val1);
            $scope.updateForm.commodityShowShipmentAnalysis = $scope.showShipmentArr.filter((val) => val).map((val1) => val1);
            $scope.gradeId = $scope.updateForm.commodityGrade.filter(grade => grade._id).map((grade) => grade._id);
            $scope.updateForm.commodityGradeId = $scope.gradeId;
            httpService.updateCommodity($scope.updateForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.closepop();
                    $scope.initCommodity();
                    swal("Alert!", res.data.userMessage, "success");
                }
            });
        };
        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
        };
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });
