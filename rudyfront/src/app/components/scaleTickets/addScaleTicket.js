angular.module('myApp.addScaleTicket', [])
    .controller('addScaleTicketCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            httpService,
            $state,
            $stateParams,
            $timeout,
            spinnerService,
            tradePurchaseScaleHttpServices,
            sudAdminHttpService,
            binHttpService,
            tradePurchaseHttpServices,
            $rootScope,
            imageUrl) {


            $scope.$on('access', (event, data) => {

                if (!data || !data.truckScale || !data.truckScale.incoming || !data.truckScale.incoming.viewMenu) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });


            $scope.selected = {};
            $scope.allChecked = true;
            $scope.printTicket = false;
            var arrObj;
            $scope.showAllow = false;
            $scope.showMoisture = false;
            $scope.showLightbulb = '';
            $scope.imageUrl = imageUrl;


            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.userType = JSON.parse(localStorage.getItem('userType'));

            $scope.myForm = {gradeType: 'Delivery', growerOrBuyer: 'Grower'};
            $scope.myForm.netWeight = 0;
            $scope.ticketNumber = $stateParams.ticketNo;
            $scope.ticketType = 'Incoming';
            const contractType = 'Production Contracts';
            $scope.contractType = contractType;
            $scope.sizeKabuli = 'hide';
            $scope.grossTaken = false;
            $scope.tareTaken = false;
            $scope.allowCalculated = false;
            $scope.active = {
                page: 'scaleTicketIncoming'
            };
            $scope.myForm.withContractNumber = 'withContractNumber';

            $scope.backToIncoming = (type) => {
                if (type == 'incoming') {
                    $state.go('incoming');
                } else {
                    $state.go('outgoing');
                }
            };

            $scope.whoOptions = ['Grower', 'Buyer'];

            binHttpService.getbin($scope.token, '').then(function(res) {
                $scope.binList = res.data.status == 200 ? res.data.data : [];
            });

            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            });

            scaleTicketHttpServices.getTrucker($scope.token).then(function(res) {
                $scope.truckerList = res.data.status == 200 ? res.data.data : [];
            });

            scaleTicketHttpServices.getTrackWeight($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    if (res.data.data.weight > 0) {
                        $scope.showLightbulb = 'green';
                    } else {
                        $scope.showLightbulb = 'red';
                    }
                }
            });

            $scope.getContractList = (commodityId, growerId) => {
                if (commodityId) {
                  if($scope.myForm.growerOrBuyer === 'Buyer') {
                    scaleTicketHttpServices
                        .getBuyersByCommodityHaveTrade(growerId, commodityId, $scope.token)
                        .then(function(res) {
                            if (res.data.status == 200) {
                                $scope.buyerListByCommodity = res.data.data;
                            }
                        });
                  } else {
                    scaleTicketHttpServices
                        .getGrowerListByCommodity(growerId, commodityId, $scope.token)
                        .then(function(res) {
                            if (res.data.status == 200) {
                                $scope.growerListByCommodity = res.data.data;
                            }
                        });
                  }

                    $timeout(function() {
                        const commodity = $scope.commoditys.find(commodity => commodity._id == commodityId);
                        $scope.$apply(() => {
                            $scope.commodityDeliveryAnalysis = commodity.commodityDeliveryAnalysis;
                        });
                    }, 2000);
                }
            };

            $scope.getContractLists = (commodityId, growerId) => {
                if (commodityId && growerId) {
                    var data = {
                        commodityId: commodityId,
                        growerId: growerId
                    };
                    if($scope.myForm.growerOrBuyer === 'Buyer') {
                      tradePurchaseScaleHttpServices.getContractList(growerId, commodityId, $scope.token, true).then(function(res) {
                        $scope.productionContractList = res.data.status == 200 ? res.data.data : [];
                      });
                    } else {
                      scaleTicketHttpServices.getContractListByCommodity(data, $scope.token).then(function(res) {
                          if (res.data.status == 200) {
                              $scope.productionContractList = res.data.data.productionContract.concat(res.data.data.purchaseConfirmation);
                          }
                      });
                    }
                }
            };

            $scope.getGrade = (id, type) => {
                httpService.getGrade('', id, $scope.token).then(function(res) {
                    $scope.grades = res.data.status == 200 ? res.data.data : [];
                });

                if (!type && !$scope.myForm.analysis) {
                    $timeout(function() {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == id;
                        });
                        // $scope.$apply(() => {
                        //     $scope.commodityDeliveryAnalysis = $scope.commodityGrades[0].commodityDeliveryAnalysis;
                        // });
                    }, 3000);
                } else if (type == 'ticket' && $scope.myForm.analysis == 0) {
                    $timeout(function() {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == id;
                        });
                        // $scope.$apply(() => {
                        //     $scope.commodityDeliveryAnalysis = $scope.commodityGrades[0].commodityDeliveryAnalysis;
                        // });
                    }, 3000);
                } else if (type == 'ticket' && $scope.myForm.analysis.length) {
                    $timeout(function() {
                        $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                            return hero._id == id;
                        });
                        $scope.$apply(() => {
                            $scope.commodityDeliveryAnalysis = $scope.myForm.analysis.map(function(elem) {
                                return {
                                    analysisName: elem.analysisId.analysisName,
                                    _id: elem.analysisId._id,
                                    value: checkAnalysisValue(elem.value),
                                    weight: checkAnalysisValue(elem.weight),
                                    weightMT: checkAnalysisValue(elem.weightMT)
                                };
                            });

                        });
                    }, 3000);
                }

            };

            function checkAnalysisValue(value){
                if(value || value == 0){
                    return value;
                }else return '';
            }

            $scope.setContractGradeAllowance = function() {
                if ($scope.myForm.gradeType === 'Contract') {
                    return ($scope.myForm.allow = $scope.selectedContractGrade ? $scope.selectedContractGrade.gradeAllowance : 0);
                }
                return;
            };

            $scope.setAllow = function() {
                if ($scope.commodityGrades[0].commodityTypeId.commodityTypeName === 'Lentils') {
                    $scope.showAllow = true;
                    $scope.showDamage = true;

                    switch ($scope.myForm.delGrade) {
                        case 'Canada #1':
                            $scope.myForm.allow = 2;
                        break;

                        case 'Canada #2':
                            $scope.myForm.allow = 3.5;
                        break;

                        case 'Canada X#3':
                            $scope.myForm.allow = 5;
                        break;

                        case 'Canada #3':
                            $scope.myForm.allow = 10;
                        break;
                        default:
                            $scope.myForm.allow = 0;
                    }
                    $scope.setContractGradeAllowance();
                    $scope.calculateTotalDamageAndNetWeight();
                } else if (['Kabuli Chick Peas', 'Organic Kabuli Chickpeas'].includes($scope.myForm.commodityName)) {
                    $scope.showAllow = true;
                    $scope.showDamage = false;

                    $scope.totalOfAnalysis = 0;
                    $scope.totalOfAnalysisWeight = 0;
                    $scope.commodityDeliveryAnalysis.forEach(function(cda, idx) {
                        if (idx) {
                            $scope.totalOfAnalysis += Number(cda.value || 0);
                            $scope.totalOfAnalysisWeight += Number(cda.weight || 0);
                        }
                    });

                    switch ($scope.myForm.delGrade) {
                        case 'Canada #1':
                            $scope.myForm.allow = 0.5;
                        break;

                        case 'Canada #2':
                            $scope.myForm.allow = 1;
                        break;

                        case 'Canada #3':
                            $scope.myForm.allow = 2;
                        break;

                        default:
                            $scope.myForm.allow = 0;
                    }
                    $scope.setContractGradeAllowance();

                    $scope.myForm.netTotalWeight = ($scope.myForm.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - $scope.totalOfAnalysisWeight/1000;
                    $scope.myForm.netWeight = $scope.myForm.netTotalWeight * 1000;
                    return $scope.myForm.netWeight;
                } else if ($scope.myForm.commodityName === 'Faba Bean') {
                    $scope.showAllow = true;
                    $scope.showDamage = true;

                    switch ($scope.myForm.delGrade) {
                        case 'Canada #1':
                            $scope.myForm.allow = 4;
                        break;

                        case 'Canada #2':
                            $scope.myForm.allow = 6;
                        break;

                        case 'Canada #3':
                            $scope.myForm.allow = 10;
                        break;
                        default:
                            $scope.myForm.allow = 0;
                    }
                } else {
                    $scope.showAllow = false;
                    $scope.showDamage = false;

                    $scope.myForm.allow = false;
                }
            };

            $scope.calculateTotalDamageAndNetWeight = () => {
                $scope.totalOfAnalysis = 0;
                $scope.totalOfAnalysisWeight = 0;
                $scope.commodityDeliveryAnalysis.forEach((cda, idx) => {
                    if (idx) {
                        $scope.totalOfAnalysis += Number(cda.value || 0);
                        $scope.totalOfAnalysisWeight += Number(cda.weight || 0);
                    }
                });

                if ($scope.myForm.allow) {
                    if ($scope.myForm.allow < $scope.totalOfAnalysis) {
                        $scope.myForm.totalDamage = $scope.totalOfAnalysis;
                        if ($scope.allowCalculated) {
                            $scope.myForm.totalDamageMT = $scope.totalOfAnalysisWeight / 1000;
                        } else {
                            $scope.myForm.totalDamageMT = (((($scope.totalOfAnalysis - $scope.myForm.allow) / 100) * 2) * ($scope.myForm.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT));
                        }
                        $scope.myForm.netTotalWeight = ($scope.myForm.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - $scope.myForm.totalDamageMT;
                        $scope.myForm.netWeight = $scope.myForm.netTotalWeight * 1000;
                        console.log($scope.myForm.netWeight);
                    } else {
                        $scope.myForm.netTotalWeight = ($scope.myForm.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT);
                        $scope.myForm.netWeight = $scope.myForm.netTotalWeight * 1000;
                        $scope.myForm.totalDamage = $scope.totalOfAnalysis;
                        $scope.myForm.totalDamageMT = 0;
                    }
                } else {
                    $scope.myForm.totalDamage = $scope.totalOfAnalysis;
                    $scope.myForm.totalDamageMT = $scope.totalOfAnalysisWeight/1000;
                    $scope.myForm.netTotalWeight = ($scope.myForm.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - $scope.myForm.totalDamageMT;
                    $scope.myForm.netWeight = $scope.myForm.netTotalWeight * 1000;
                }
                return $scope.myForm.netWeight;
            };

            $scope.calculateMoisture = (weightMT) => {
                $scope.commodityDeliveryAnalysis.forEach($scope.calculateAnalysis);

                if ($scope.myForm.commodityName != 'Canaryseed') {

                    const dockageAnalysis = $scope.commodityDeliveryAnalysis.find(analysis => analysis.analysisName === 'Dockage');
                    if (dockageAnalysis) {
                        $scope.sampleweight = Number($scope.myForm.unloadWeidhtMT) - Number(dockageAnalysis.weightMT);
                    }

                    var netWeight = $scope.calculateTotalDamageAndNetWeight();
                    if ($scope.myForm.delGrade == '#1 Damp' || $scope.myForm.delGrade == '#2 Damp') {
                        if ($scope.myForm.moisture > 16) {
                            $scope.myForm.moistureAdjustment = $scope.myForm.moisture - 16;
                            $scope.showMoisture = true;
                            if ($scope.sampleweight) {
                                $scope.myForm.moistureAdjustmentWeight = ((Number($scope.sampleweight) * $scope.myForm.moistureAdjustment / 100));
                                $scope.myForm.netWeight = netWeight - ($scope.myForm.moistureAdjustmentWeight*1000);
                                $scope.myForm.netTotalWeight = ($scope.myForm.netWeight / 1000);
                            }
                        } else {
                            $scope.showMoisture = false;
                            $scope.myForm.netWeight = netWeight;
                            $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;
                        }
                    } else {
                        $scope.showMoisture = false;
                        $scope.myForm.netWeight = netWeight;
                        $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;
                    }
                } else {
                    if ($scope.myForm.moisture > 12) {
                        $scope.showMoisture = true;
                        $scope.myForm.moistureAdjustment = $scope.myForm.moisture - 12;
                        $scope.myForm.moistureAdjustmentWeight = $scope.myForm.netWeight * $scope.myForm.moistureAdjustment / 100;

                        $scope.myForm.dockageTotal = $scope.myForm.moistureAdjustment;
                        $scope.myForm.dockageTotalWeight = $scope.myForm.moistureAdjustmentWeight;

                        $scope.commodityDeliveryAnalysis.forEach(function(val) {
                            if (val && val.value) {
                                $scope.myForm.dockageTotal += Number(val.value);
                            }
                        });

                        $scope.commodityDeliveryAnalysis.forEach(function(val) {
                            if (val && val.weightMT) {
                                $scope.myForm.dockageTotalWeight += Number(val.weightMT);
                            }
                        });

                        $scope.myForm.netWeight = $scope.myForm.netWeight - $scope.myForm.dockageTotalWeight;
                        $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    }
                }
            };

            $scope.changeStatus = () => {
                if ($scope.myForm.receiptType == 'Special Bin Elevator Receipt') {
                    $scope.myForm.ticketStatus = 'SPECIAL';
                } else if ($scope.myForm.receiptType == 'Interim Primary Elevator Receipt') {
                    $scope.myForm.ticketStatus = 'INTERIM';
                } else if ($scope.myForm.receiptType == 'Primary Elevator Receipt') {
                    $scope.myForm.ticketStatus = 'PRIMARY'; //add386-389
                }   else if ($scope.myForm.receiptType == 'Non CGA Grain') {
                        $scope.myForm.ticketStatus = 'Non CGA Grain';
                } else if ($scope.myForm.receiptType == 'Non Producer Purchase') {
                        $scope.myForm.ticketStatus = 'Non Producer Purchase';      
                } else if ($scope.myForm.receiptType == 'Void') {
                    $scope.myForm.ticketStatus = 'VOID';
                }
            };

            sudAdminHttpService.getreceiver('', $scope.token, 'RECEIVER').then(function(res) {
                $scope.receiverList = res.data.status == 200 ? res.data.data : [];
            });

            function getWeight(sample, skip = []) {
                if (sample.analysisName != 'Dockage') {
                    sample.weight =  skip.includes(sample.analysisName) ? 0 : ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                    sample.weightMT = sample.weight / 1000;
                } else {
                    sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                    sample.weightMT = sample.weight / 1000;
                }
            }

            Array.prototype.sum = function(prop) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++)
                    if (this[i][prop]) total += this[i][prop];
                return $scope.myForm.unloadWeidht - total;
            };

            Array.prototype.totalWeight = function(prop, obj) {
                var total = 0;
                for (var i = 0, _len = this.length; i < _len; i++)
                    if (this[i][prop]) total += this[i][prop];
                return obj.unloadWeidht - total;
            };

            $scope.calculateAnalysis = (sample) => {
                $scope.allowCalculated = false;
                if (['Black Beans', 'Pinto Bean', 'Organic Pinto Beans', 'Cranberry Bean', 'Yellow Bean', 'Dark Red Kidney'].indexOf($scope.commodityGrades[0].commodityName) != -1) {
                    getWeight(sample);

                    if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2].value) {
                        $scope.myForm.splitTotal = Number($scope.commodityDeliveryAnalysis[1].value) + Number($scope.commodityDeliveryAnalysis[2].value);
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT;
                    }
                    if ($scope.myForm.delGrade == '#1 Damp' || $scope.myForm.delGrade == '#2 Damp') {
                        if ($scope.myForm.moisture > 16) {
                            $scope.myForm.moistureAdjustment = $scope.myForm.moisture - 16;
                            $scope.showMoisture = true;
                            if ($scope.sampleweight) {
                                $scope.myForm.moistureAdjustmentWeight = ((Number($scope.sampleweight) * $scope.myForm.moistureAdjustment / 100));
                                $scope.myForm.netTotalWeight = $scope.myForm.netTotalWeight - $scope.myForm.moistureAdjustmentWeight;
                                $scope.myForm.netWeight = $scope.myForm.netTotalWeight * 1000;
                            }
                        } else {
                            $scope.showMoisture = false;
                        }
                    } else {
                        $scope.showMoisture = false;
                    }
                }

                if (['Marrowfat Peas', 'Organic Marrowfat Peas'].includes($scope.commodityGrades[0].commodityName)) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == '18/64') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                        sample.weightMT = ($scope.myForm.unloadWeidht * (sample.value / 100) / 1000);
                    }

                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3].value && $scope.commodityDeliveryAnalysis[4].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                        $scope.myForm.splitTotalWeight = ($scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT);
                    }
                }
                if (['Whole Espace Green Peas', 'Whole Green Peas (Espace Type)'].includes($scope.commodityGrades[0].commodityName)) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Other Colors') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage') {
                        sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Bleach') {
                        sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                        sample.weightMT = ($scope.myForm.unloadWeidht * (sample.value / 100) / 1000);
                    }

                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3].value && $scope.commodityDeliveryAnalysis[4].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                    }
                }
                if ($scope.commodityGrades[0].commodityName == 'Other Colors') {

                    getWeight(sample);
                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value && $scope.commodityDeliveryAnalysis[4] && $scope.commodityDeliveryAnalysis[4].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                    }
                }
                if (['Kabuli Chick Peas', 'Organic Kabuli Chickpeas'].includes($scope.commodityGrades[0].commodityName)) {
                    $scope.allowCalculated = true;
                    $scope.setAllow();
                    if (['Splits', 'Pick'].includes(sample.analysisName)) {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = sample.weight / 1000;
                    } else if (['Green', 'Damage'].includes(sample.analysisName)) {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight - $scope.commodityDeliveryAnalysis[1].weight) * ((sample.value - $scope.myForm.allow) * 1.5 / 100);
                        sample.weight = ($scope.myForm.allow !== 0 && sample.weight > 0) ? sample.weight : 0;
                        sample.weightMT = sample.weight / 1000;
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                        sample.weightMT = ($scope.myForm.unloadWeidht * (sample.value / 100) / 1000);
                    } else {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                }

                if ($scope.commodityGrades[0].commodityName == 'CDC RAY') {

                    getWeight(sample);
                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[0] && $scope.commodityDeliveryAnalysis[0].value && $scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[0].value + $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value;
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[0].weightMT + $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT;
                    }
                }
                if ($scope.commodityGrades[0].commodityName == 'Austrian Winter Peas') {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                        sample.weightMT = ($scope.myForm.unloadWeidht * (sample.value / 100) / 1000);
                    } else {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }
                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                }
                if (['Whole Green Peas', 'Maple Peas', 'Maple Peas JPD', 'Organic Whole Green Peas', 'Organic Whole Green Peas Espace Type'].includes($scope.commodityGrades[0].commodityName)) {
                    const skip = ['Whole Green Peas', 'Maple Peas JPD', 'Organic Whole Green Peas', 'Organic Whole Green Peas Espace Type'].includes($scope.commodityGrades[0].commodityName) ? ['Damage', 'CSC', 'Bleach', 'O.C.'] : [];

                    getWeight(sample, skip);
                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        $scope.myForm.splitTotal = ($scope.commodityDeliveryAnalysis[1].value - 0) + ($scope.commodityDeliveryAnalysis[2].value - 0) + ($scope.commodityDeliveryAnalysis[3].value - 0);
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                }
                if ($scope.commodityGrades[0].commodityName == 'Maple Peas JP type') {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                        sample.weightMT = ($scope.myForm.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage') {
                        sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'St/Damage') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC' || sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }


                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;


                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        $scope.myForm.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                }
                if (['Whole Yellow Peas', 'Austrian Winter Peas 4'].includes($scope.commodityGrades[0].commodityName)) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = (($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                        sample.weightMT = ($scope.myForm.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage' || sample.analysisName == 'Bleach') {
                        sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    }

                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;


                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].value + ($scope.commodityDeliveryAnalysis[2].value || 0) + ($scope.commodityDeliveryAnalysis[3].value || 0);
                        $scope.myForm.splitTotalWeight = ($scope.commodityDeliveryAnalysis[1].weightMT || 0) + ($scope.commodityDeliveryAnalysis[2].weightMT || 0) + ($scope.commodityDeliveryAnalysis[3].weightMT || 0);
                    }
                }

                if (['Whole Red Lentils (Crimson type)', 'Large Green Lentils (Laird type)', 'Large Green Lentils', 'Richlea Lentils', 'Small Green Lentils (Eston)', 'Small Green Lentils (Eston Type)', 'Crimson Lentils', 'French Green Lentils', 'Organic Small Green Lentils'].includes($scope.commodityGrades[0].commodityName)) {
                    $scope.setAllow();
                    getWeight(sample);
                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;
                    // if (Number($scope.commodityDeliveryAnalysis[1].value) && Number($scope.commodityDeliveryAnalysis[2].value)) {
                        $scope.calculateTotalDamageAndNetWeight();
                    // }

                }
                if ($scope.commodityGrades[0].commodityName == 'Otebo Beans') {

                    getWeight(sample);
                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value) {
                        $scope.myForm.splitTotal = Number($scope.commodityDeliveryAnalysis[1].value) + Number($scope.commodityDeliveryAnalysis[2].value);
                        $scope.myForm.splitTotalWeight = Number($scope.commodityDeliveryAnalysis[1].weightMT) + Number($scope.commodityDeliveryAnalysis[2].weightMT);
                    }
                }
                if ($scope.commodityGrades[0].commodityName == 'Canaryseed') {

                    sample.weight = ($scope.myForm.unloadWeidht * sample.value) / 100;
                    sample.weightMT = sample.weight / 1000;

                    $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;

                    $scope.myForm.dockageTotal = 0;
                    $scope.myForm.dockageTotalWeight = 0;
                    $scope.commodityDeliveryAnalysis.forEach(function(val) {
                        if (val && val.value) {
                            $scope.myForm.dockageTotal += Number(val.value);
                        }
                    });

                    $scope.commodityDeliveryAnalysis.forEach(function(val) {
                        if (val && val.weightMT) {
                            $scope.myForm.dockageTotalWeight += Number(val.weightMT);
                        }
                    });
                }
                if ($scope.commodityGrades[0].commodityName == 'Faba Bean') {
                  $scope.setAllow();
                  if (sample.analysisName == 'Splits') {
                      sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                      sample.weightMT = (sample.weight / 1000);
                  } else if (sample.analysisName == 'Dockage') {
                      sample.weight = $scope.myForm.unloadWeidht * (sample.value / 100);
                      sample.weightMT = sample.weight / 1000;
                  } else if (sample.analysisName == 'Damage') {
                      var damage = sample.value - $scope.myForm.allow;
                      sample.weight = ($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight - $scope.commodityDeliveryAnalysis[1].weight) * ((damage > 0 ? damage : 0) * 1.5 / 100);
                      sample.weightMT = sample.weight / 1000;
                  } else if (sample.analysisName == 'CSC') {
                      sample.weight = 0; //($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                      sample.weightMT = 0; //(($scope.myForm.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                  }

                  $scope.myForm.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                  $scope.myForm.netTotalWeight = $scope.myForm.netWeight / 1000;


                  if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                      $scope.myForm.splitTotal = $scope.commodityDeliveryAnalysis[1].value + ($scope.commodityDeliveryAnalysis[2].value || 0) + ($scope.commodityDeliveryAnalysis[3].value || 0);
                      $scope.myForm.splitTotalWeight = ($scope.commodityDeliveryAnalysis[1].weightMT || 0) + ($scope.commodityDeliveryAnalysis[2].weightMT || 0) + ($scope.commodityDeliveryAnalysis[3].weightMT || 0);
                  }
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
                                    $scope.myForm.tareWeight = res.data.data.weight;
                                    $scope.calculateWeightMT('tara');
                                } else {
                                    $scope.myForm.grossWeight = res.data.data.weight;
                                    $scope.calculateWeightMT('gross');
                                    if ($scope.myForm.ticketNumber) {
                                        $scope.submit('gross');
                                    }
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


            $scope.calculateWeightMT = (type) => {
                if (!$scope.myForm.contractNumber) {
                    swal("Alert!", 'Please select contract first!', "error");
                } else {
                    if (type == 'gross') {
                        $scope.myForm.grossWeightMT = $scope.myForm.grossWeight / 1000;
                        $scope.myForm.date = moment().format('YYYY-MM-DD');
                        $scope.myForm.inTime = moment();
                        $scope.myForm.inTimeFormat = moment().format("hh:mm:ss A");
                        $scope.myForm.ticketType = $scope.ticketType;
                        $scope.myForm.contractType = contractType;
                        if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                          $scope.myForm.netWeight = $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                          $scope.myForm.netTotalWeight = $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
                        }
                        if (!$scope.myForm.ticketNumber && !$scope.creatingTicketNumber) {
                            $scope.creatingTicketNumber = true;
                            spinnerService.show("html5spinner");
                            scaleTicketHttpServices.generateScaleTicketId($scope.myForm, $scope.token, 'Incoming').then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.myForm.ticketNumber = res.data.data.ticketNumber;
                                    $scope.myForm.scaleTicketId = res.data.data._id;
                                    spinnerService.hide("html5spinner");
                                    $scope.creatingTicketNumber = false;
                                }
                            });
                        } else {
                            $scope.myForm.grossWeightMT = $scope.myForm.grossWeight / 1000;
                            $scope.myForm.ticketType = $scope.ticketType;
                            $scope.myForm.contractType = contractType;
                        }
                    }
                    if (type == 'tara') {
                        $scope.myForm.tareWeightMT = $scope.myForm.tareWeight / 1000;
                        $scope.myForm.exitTime = moment();
                        $scope.myForm.exitTimeFormat = moment().format("hh:mm:ss A");
                        if ($scope.myForm.tareWeight && $scope.myForm.grossWeight) {
                          $scope.myForm.netWeight = $scope.myForm.unloadWeidht = Number($scope.myForm.grossWeight || 0) - Number($scope.myForm.tareWeight || 0);
                          $scope.myForm.netTotalWeight = $scope.myForm.unloadWeidhtMT = $scope.myForm.unloadWeidht / 1000;
                        }
                    }
                }
            };


            var all_keys = ['displayOnTicket', 'delGrade', 'weigher', 'dockageBy', 'receiptType',
                'vehicleInstected', 'infestationCheck', 'specificationMet', 'allow', 'splitTotal',
                'splitTotalWeight', 'totalDamage', 'totalDamageMT', 'moistureAdjustment', 'moistureAdjustmentWeight', 'dockageTotal',
                'dockageTotalWeight', 'dockageCompleted', 'date', 'inTime', 'exitTime', 'binNumber', 'moisture', 'size', 'size7', 'size8', 'size9', 'size10',
                'truckingCompany', 'truckerBL', 'grossWeight', 'grossWeightMT', 'tareWeight', 'tareWeightMT', 'unloadWeidht',
                'unloadWeidhtMT', 'netWeight', 'netTotalWeight', 'comments', 'contractNumber', 'void'
            ];

            $scope.canSubmit = true;
            $scope.submit = (type, valid) => {
                $scope.myForm.status = 0;
                if (!type) $scope.submitted = true;
                if ((valid || type) && $scope.canSubmit) {
                    $scope.canSubmit = false;
                    if ($scope.previous_dockageCompleted_value) {
                        swal("Access Denied!", 'Scale ticket is locked.', "error");
                        $scope.canSubmit = true;
                        return;
                    }
                    if (!type && $scope.sizeKabuli == 'show') {
                        if ($scope.myForm.size7 || $scope.myForm.size8 || $scope.myForm.size9 || $scope.myForm.size10) {
                            var total = Number($scope.myForm.size7) + Number($scope.myForm.size8) + Number($scope.myForm.size9) + Number($scope.myForm.size10);
                            if (total.toFixed(3) != 100.000) {
                                swal("Error", 'Size 7,8,9 & 10 total needs to be 100%', "error");
                                $scope.canSubmit = true;
                                return;
                            }
                        }
                    }

                    $scope.changeStatus();
                    if ($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID') {
                        $scope.myForm.receiptType = 'Interim Primary Elevator Receipt';
                        $scope.myForm.ticketStatus = 'INTERIM';
                        if (!$scope.myForm.isMailReceiptType) {
                            $scope.myForm.isMailReceiptType = true;
                            $scope.myForm.mailSent = 1;
                            $scope.myForm.mailColor = 1;
                        }
                    }
                    if ($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.dockageCompleted && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID') {
                        $scope.myForm.receiptType = 'Primary Elevator Receipt';
                        $scope.myForm.ticketStatus = 'PRIMARY';
                        if (!$scope.myForm.isMailDockageCompleted) {
                            $scope.myForm.isMailDockageCompleted = true;
                            $scope.myForm.mailSent = 2;
                            $scope.myForm.mailColor = 2;
                        }
                    }
                    //844-864 add
                    if($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.dockageCompleted && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID' && $scope.myForm.ticketStatus != 'PRIMARY'){
                        $scope.myForm.receiptType = 'Non CGA Grain';
                        $scope.myForm.ticketStatus = 'Non CGA Grain';
                        if($scope.myForm.isMailDockageCompleted){
                            $scope.myForm.isMailDockageCompleted = true;
                            $scope.myForm.mailSent = 2;
                            $scope.myForm.mailColor = 2;

                        }
                    }
                    if($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.dockageCompleted && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID' && $scope.myForm.ticketStatus != 'PRIMARY' && $scope.myForm.ticketStatus != 'Non CGA Grain'){
                        $scope.myForm.receiptType = 'Non Producer Purchase';
                        $scope.myForm.ticketStatus = 'Non Producer Purchase';
                        if($scope.myForm.isMailDockageCompleted){
                            $scope.myForm.isMailDockageCompleted = true;
                            $scope.myForm.mailSent = 2;
                            $scope.myForm.mailColor = 2;

                        }
                    }

                    if ($scope.myForm.ticketId) {
                        var changed_key = [];
                        if(typeof $scope.oldData === 'undefined') {
                            $scope.oldData = {};
                        }
                        for (var i = 0; i < all_keys.length; i++) {
                            if ($scope.oldData[all_keys[i]] != $scope.myForm[all_keys[i]]) {
                                changed_key.push(all_keys[i]);
                            }
                        }
                        if (typeof $scope.oldData.analysis === 'undefined' || $scope.oldData.analysis.length != $scope.commodityDeliveryAnalysis.length) {
                            changed_key.push("commodityDeliveryAnalysis");
                        } else {
                            for (var j = 0; j < $scope.commodityDeliveryAnalysis.length; j++) {
                                var commDA = $scope.commodityDeliveryAnalysis[j];
                                var changed = false;
                                for (var d = 0; d < $scope.oldData.analysis.length; d++) {
                                    if (commDA.analysisName == $scope.oldData.analysis[d].analysisId.analysisName) {

                                        if ((commDA.value != $scope.oldData.analysis[d].value) && (commDA.value || $scope.oldData.analysis[d].value)) {
                                            changed_key.push("commodityDeliveryAnalysis");
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
                        $scope.myForm.someFieldValueChanged = changed_key.length ? true : false;
                    }

                    var sizeKabuli = [];

                    if (!$scope.myForm.ticketId) {

                        arrObj = $scope.commodityDeliveryAnalysis.map(function(elem) {
                            return {
                                analysisId: elem._id,
                                value: elem.value,
                                weight: elem.weight,
                                weightMT: elem.weightMT
                            };
                        });
                        if ($scope.myForm.commodityName == "Kabuli Chick Peas" || $scope.myForm.commodityName == 'Organic Kabuli Chickpeas') {
                            sizeKabuli = [{
                                size7: Number($scope.myForm.size7) || 0,
                                size8: Number($scope.myForm.size8) || 0,
                                size9: Number($scope.myForm.size9) || 0,
                                size10: Number($scope.myForm.size10) || 0,
                            }];
                        }
                        var data = _.assign({}, $scope.myForm, {
                            ticket: $scope.ticketType,
                            contractType: contractType,
                            netWeight: $scope.myForm.netWeight ? ($scope.myForm.netWeight.toFixed(3) - 0) : 0,
                            date: moment($scope.myForm.date),
                            analysis: arrObj,
                            scaleTicketId: $scope.myForm.ticketId,
                            sizeKabuli: sizeKabuli,
                        });
                        delete data._id;
                        if ($scope.myForm.growerOrBuyer === 'Buyer') {
                          data.buyerId = $scope.myForm.buyerId._id || $scope.selected.value._id;
                        } else {
                          data.growerId = $scope.myForm.growerId._id || $scope.selected.value._id;
                        }

                        spinnerService.show("html5spinner");
                        $scope.addRequest = true;
                        scaleTicketHttpServices.addScaleTicket(data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    if (type == 'tare' || type == 'gross') {
                                        $scope.myForm.ticketId = res.data.data._id;
                                    } else {
                                        $scope.myForm = {gradeType: 'Delivery', growerOrBuyer: 'Grower'};
                                        $scope.commodityDeliveryAnalysis = [];

                                        $state.go('incoming');
                                    }

                                }
                                spinnerService.hide("html5spinner");
                                $scope.addRequest = false;
                                $scope.canSubmit = true;
                            },
                            function(error) {
                                $scope.addRequest = false;
                                $scope.canSubmit = true;
                                spinnerService.hide("html5spinner");
                            });
                    } else {
                        if ($scope.Oldmoisture != $scope.myForm.moisture) {
                            $scope.calculateMoisture();
                        }
                        arrObj = $scope.commodityDeliveryAnalysis.map(function(elem) {
                            return {
                                analysisId: elem._id,
                                value: elem.value,
                                weight: elem.weight,
                                weightMT: elem.weightMT
                            };
                        });
                        sizeKabuli = [{
                            size7: Number($scope.myForm.size7 || 0),
                            size8: Number($scope.myForm.size8 || 0),
                            size9: Number($scope.myForm.size9 || 0),
                            size10: Number($scope.myForm.size10 || 0),
                        }];
                        if ($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID') {
                            $scope.myForm.receiptType = 'Interim Primary Elevator Receipt';
                            $scope.myForm.ticketStatus = 'INTERIM';
                            $scope.myForm.isMailReceiptType = true;
                            $scope.myForm.mailSent = 1;
                            $scope.myForm.mailColor = 1;
                        }
                        if ($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.dockageCompleted && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID') {
                            $scope.myForm.receiptType = 'Primary Elevator Receipt';
                            $scope.myForm.ticketStatus = 'PRIMARY';
                            $scope.myForm.isMailDockageCompleted = true;
                            $scope.myForm.mailSent = 2;
                            $scope.myForm.mailColor = 2;
                        }
                        //add line 993-1007 non cga and producer
                        if ($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.dockageCompleted && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID' && $scope.myForm.ticketStatus != 'PRIMARY') {
                            $scope.myForm.receiptType = 'Non CGA Grain';
                            $scope.myForm.ticketStatus = 'Non CGA Grain';
                            $scope.myForm.isMailDockageCompleted = true;
                            $scope.myForm.mailSent = 2;
                            $scope.myForm.mailColor = 2;
                        }
                        if ($scope.myForm.grossWeight && $scope.myForm.tareWeight && $scope.myForm.dockageCompleted && $scope.myForm.ticketStatus != 'SPECIAL' && $scope.myForm.ticketStatus != 'VOID' && $scope.myForm.ticketStatus != 'PRIMARY' && $scope.myForm.ticketStatus != 'Non CGA Grain') {
                            $scope.myForm.receiptType = 'Non Producer Purchase';
                            $scope.myForm.ticketStatus = 'Non Producer Purchase';
                            $scope.myForm.isMailDockageCompleted = true;
                            $scope.myForm.mailSent = 2; 
                            $scope.myForm.mailColor = 2;
                        }
                        $scope.myForm.sizeKabuli = sizeKabuli;
                        $scope.myForm.analysis = arrObj;
                        $scope.myForm.date = moment($scope.myForm.date);
                        $scope.myForm.inTime = moment($scope.myForm.inTime);
                        $scope.myForm.exitTime = moment($scope.myForm.exitTime);
                        $scope.myForm._id = $scope.myForm.ticketId;
                        delete $scope.myForm.date;
                        spinnerService.show("html5spinner");
                        $scope.addRequest = true;
                        $scope.myForm.netWeight = $scope.myForm.netWeight ? ($scope.myForm.netWeight.toFixed(3) - 0) : 0;

                        scaleTicketHttpServices.updateScaleTicket($scope.myForm, $scope.token).then(function(res) {
                                spinnerService.hide("html5spinner");

                                if (res.data.status == 200) {
                                    if (type == 'tare' || type == 'gross') {

                                    } else {
                                        $scope.myForm = {gradeType: 'Delivery', growerOrBuyer: 'Grower'};
                                        $scope.commodityDeliveryAnalysis = [];
                                        $state.go('incoming');
                                    }

                                }
                                $scope.canSubmit = true;
                                $scope.addRequest = false;
                            },
                            function(error) {
                                $scope.addRequest = false;
                                $scope.canSubmit = true;
                                spinnerService.hide("html5spinner");
                            });
                    }
                }
            };
                //contract list Response scale Ticket according
            $scope.setContractListResponse = function(res) {
              if (res.data.status == 200) {
                var oldGrowerOrBuyer = $scope.myForm.growerOrBuyer;
                $scope.contractDetailsByNo = res.data.data;
                $scope.selectedContractGrade = res.data.data.gradeId;
                $scope.myForm = $scope.contractDetailsByNo;
                $scope.myForm.gradeType = $scope.myForm.gradeType || 'Delivery';
                $scope.myForm.growerOrBuyer = oldGrowerOrBuyer || 'Grower';
                $scope.myForm.commodityName = $scope.contractDetailsByNo.commodityId.commodityName;
                $scope.myForm.commodityId = $scope.contractDetailsByNo.commodityId._id;
                $scope.getGrade($scope.myForm.commodityId);
                $scope.getTicketNumber();
                $scope.myForm.contractGradeName = $scope.contractDetailsByNo.gradeId.gradeName;
                $scope.myForm.gradeId = $scope.contractDetailsByNo.gradeId._id;
                if ($scope.myForm.commodityName == "Kabuli Chick Peas" || $scope.myForm.commodityName == "Organic Kabuli Chickpeas") {
                    $scope.sizeKabuli = 'show';
                } else {
                    $scope.sizeKabuli = 'hide';
                }
              } else {
                  swal("Alert", res.data.userMessage, "info");
              }
            };

            $scope.getContractInfo = (contractNumber) => {
                $scope.myForm.contractNumber = $scope.myForm.contractNumber || contractNumber;
                if ($scope.myForm.contractNumber) {
                  if ($scope.myForm.growerOrBuyer === 'Buyer') {
                    tradePurchaseHttpServices.searchTradePurchaseContract($scope.myForm.contractNumber, $scope.token).then($scope.setContractListResponse);
                  } else {
                    httpService.getProductionContractByContractNo($scope.myForm.contractNumber, $scope.token).then($scope.setContractListResponse);
                  }
                }
            };

            $scope.getTicketNumber = () => {
              if (!$scope.creatingTicketNumber) {
                $scope.creatingTicketNumber = true;
                scaleTicketHttpServices.getScaleTicketNumber($scope.ticketType, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.myForm.ticketNumber = Number(res.data.data.incomingNumber) + 1;
                        $scope.creatingTicketNumber = false;
                    }
                });
              }
            };



            if ($scope.ticketNumber && $scope.ticketNumber != 'add') {
                spinnerService.show("html5spinner");
                scaleTicketHttpServices.getScaleTicketDetails($scope.ticketNumber, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.myForm = res.data.data;
                            $scope.grossTaken = Boolean($scope.myForm.grossWeight);
                            $scope.tareTaken = Boolean($scope.myForm.tareWeight);

                            $scope.myForm.growerOrBuyer = $scope.myForm.growerOrBuyer || 'Grower';

                            $scope.myForm.ticketId = res.data.data._id;

                            if (res.data.data.binNumber) {
                                $scope.myForm.binNumber = res.data.data.binNumber._id;
                            }
                            $scope.myForm.date = moment($scope.myForm.date).format('YYYY-MM-DD');
                            $scope.Oldmoisture = $scope.myForm.moisture;
                            $scope.ticketType = $scope.myForm.ticketType;
                            $scope.contractType = $scope.myForm.contractType;
                            $scope.myForm.commodityName = $scope.myForm.commodityId.commodityName;
                            $scope.myForm.commodityId = $scope.myForm.commodityId._id;
                            $scope.myForm.contractNumber = $scope.myForm.contractNumber;

                            if ($scope.myForm.gradeId) {
                                $scope.myForm.contractGradeName = $scope.myForm.gradeId.gradeName;
                                $scope.myForm.gradeId = $scope.myForm.gradeId._id;
                            }

                            $scope.myForm.scaleTicketId = $scope.myForm._id;
                            $scope.myForm.receiptType = $scope.myForm.receiptType;

                            $scope.myForm.generateIncomingScalePDF = true;
                            if ("updatePdf" in $scope.myForm && $scope.myForm.updatePdf == false) {
                                $scope.myForm.generateIncomingScalePDF = false;
                            }
                            $scope.myForm.updatePdf = false;


                            if (!$scope.myForm.totalUnloadWeight) {
                                $scope.myForm.totalUnloadWeight = $scope.myForm.unloadWeidht;
                            }

                            if ($scope.myForm.allow) {
                                $scope.showAllow = true;
                            }
                            $scope.myForm.analysisList = res.data.data.analysis;
                            $scope.myForm.inTimeFormat = res.data.data.inTime ? moment(res.data.data.inTime).format("hh:mm:ss A") : '';
                            $scope.myForm.exitTimeFormat = res.data.data.exitTime ? moment(res.data.data.exitTime).format("hh:mm:ss A") : '';
                            var person = $scope.myForm.growerOrBuyer === 'Buyer' ? $scope.myForm.buyerId._id : $scope.myForm.growerId._id;
                            $scope.getContractLists($scope.myForm.commodityId, person);
                            if (res.data.data.moisture > 16) {
                                $scope.myForm.moistureAdjustment = res.data.data.moistureAdjustment;
                                $scope.myForm.moistureAdjustmentWeight = res.data.data.moistureAdjustmentWeight;
                                $scope.showMoisture = true;
                            }
                            $scope.getGrade($scope.myForm.commodityId, 'ticket');
                            if (res.data.data.truckingCompany) {
                                $scope.myForm.truckingCompany = res.data.data.truckingCompany._id;
                            }
                            if ($scope.myForm.commodityName == "Kabuli Chick Peas" || $scope.myForm.commodityName == "Organic Kabuli Chickpeas") {
                                $scope.sizeKabuli = 'show';
                                if (res.data.data.sizeKabuli[0]) {
                                    var sizeKabuli = res.data.data.sizeKabuli[0];
                                    $scope.myForm.size7 = sizeKabuli.size7 ? sizeKabuli.size7 : '';
                                    $scope.myForm.size8 = sizeKabuli.size8 ? sizeKabuli.size8 : '';
                                    $scope.myForm.size9 = sizeKabuli.size9 ? sizeKabuli.size9 : '';
                                    $scope.myForm.size10 = sizeKabuli.size10 ? sizeKabuli.size10 : '';
                                }
                            } else {
                                $scope.sizeKabuli = 'hide';
                            }

                            if ($scope.myForm.commodityName == 'Canaryseed') {
                                if (res.data.data.moisture > 12) {
                                    $scope.showMoisture = true;
                                    $scope.myForm.moistureAdjustment = res.data.data.moistureAdjustment;
                                    $scope.myForm.moistureAdjustmentWeight = res.data.data.moistureAdjustmentWeight;
                                }
                            }

                            if ($scope.myForm.isSplitTicket) {
                                $scope.referenceTicket = $scope.myForm.refTicketId ? $scope.myForm.refTicketId.ticketNumber : '';
                            }

                        }
                        spinnerService.hide("html5spinner");

                        $scope.previous_dockageCompleted_value = angular.copy($scope.myForm.dockageCompleted);

                        if ($scope.myForm.dockageCompleted) {
                            var div = document.createElement("div");
                            div.className += "overlay";
                            div.style.marginTop = '50px';
                            var mymyEl = document.getElementById('incomingTicket');
                            mymyEl.appendChild(div);
                        }

                        $scope.oldData = angular.copy($scope.myForm);

                    },
                    function(error) {
                        spinnerService.hide("html5spinner");
                    });
            }

            $scope.deleteSplits = function() {
                swal({
                    title: "Are you sure to delete splits?",
                    text: "You will not be able to recover scale splits!",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, delete it!",
                    cancelButtonText: "No, cancel!",
                    closeOnConfirm: true,
                    closeOnCancel: false
                },
                function(isConfirm) {
                    if (isConfirm) {
                        scaleTicketHttpServices.removeScaleSplits($scope.myForm._id, $scope.token).then(function(res) {
                            if (res.data.status == 200) {
                                $state.go('incoming');
                            }
                        });
                    } else {
                        swal({
                            title: "Cancelled!",
                            text: "Your employees info is safe :)",
                            type: "error",
                            timer: 1000
                        });
                    }
                });
            };

            $scope.addNewRow = function(index) {
                var totalSplits = $scope.list.length;
                var grossWeight = $scope.list[totalSplits-1].tareWeight;
                var grossWeightMT = $scope.list[totalSplits-1].tareWeightMT;

                $scope.list.push({
                    netWeight: 0,
                    netWeightMT: 0,
                    grossWeight: grossWeight,
                    grossWeightMT: grossWeightMT,
                    tareWeight: 0,
                    tareWeightMT: 0,
                    type: index ? "Secondary" : "Primary",
                    contractNumber: null,
                    updatePdf: true
                });
            };

            $scope.removeRow = function(index) {
                $scope.list.splice(index, 1);
            };

            $scope.splittTicket = () => {

                if ($scope.list.length == 1) {
                    swal("ERROR", "Please split ticket first", "info");
                    return;
                }

                var flag = false,
                    msg = "",
                    weight = 0;
                var selectedContracts = [];
                for (var s = 0; s < $scope.list.length; s++) {
                    var contractNumber = $scope.list[s].contractNumber;
                    if (!contractNumber) {
                        flag = true;
                        msg = `Contract number required in ${s+1} row`;
                        break;
                    } else if (!$scope.list[s].netWeightMT) {
                        flag = true;
                        msg = `Weight required in ${s+1} row`;
                        break;
                    }
                    if ($scope.list[s].netWeightMT) {
                        weight += Number($scope.list[s].netWeightMT);
                    }
                    if (selectedContracts.includes(contractNumber)) {
                        flag = true;
                        msg = `Contract number ${contractNumber} is already selected in multiple rows.`;
                        break;
                    }
                    selectedContracts.push(contractNumber);
                }

                if (flag) {
                    swal("Missing", msg, "info");
                    return;
                }
                var netWeightMT = +($scope.myForm.netWeight/1000).toFixed(3);
                if (weight != netWeightMT) {
                    swal("Error", `Total weight must be equal to ${netWeightMT}`, "error");
                    return;
                }

                var reqData = angular.copy($scope.list);
                reqData.forEach((val) => {
                    delete val.commodityName;
                    delete val.disabled;
                    delete val.contractList;
                });

                $scope.splittRequest = true;
                scaleTicketHttpServices.splittTicket({
                    data: reqData, ticketId: $scope.myForm._id
                }, $scope.token).then(function(res) {
                    $scope.splittRequest = false;
                    if (res.data.status == 200) {
                        $state.go('incoming');
                    }
                });

            };

            $scope.updateUnloadValue = () => {
                var sumOfWeights = $scope.list.reduce(function(acc, next) {
                    return {
                        netWeightMT: acc.netWeightMT + next.netWeightMT
                    };
                });
                var netWeightMT = +($scope.myForm.netWeight/1000).toFixed(3);
                $scope.list[0].netWeightMT = netWeightMT - sumOfWeights.netWeightMT + $scope.list[0].netWeightMT;

                var grossWeight = $scope.myForm.grossWeight;
                var grossWeightMT, tareWeight, tareWeightMT, netWeight;

                $scope.list = $scope.list.map(function(v) {
                    grossWeightMT = grossWeight / 1000;
                    tareWeight = v.grossWeight - v.unloadWeidht;
                    tareWeightMT = tareWeight / 1000;
                    netWeight =  v.netWeightMT ? v.netWeightMT * 1000 : 0;

                    v = Object.assign({}, v, {
                        netWeight: netWeight,
                        grossWeight: grossWeight,
                        grossWeightMT: grossWeightMT,
                        tareWeight: tareWeight,
                        tareWeightMT: tareWeightMT,
                    });

                    grossWeight = tareWeight;
                    return v;
                });
            };

            $scope.getContractListByGrowerIdAndCommodity = () => {
                var v = $scope.myForm;
                if (v.commodityId && v.growerId) {
                    var data = {
                        commodityId: v.commodityId,
                        growerId: v.growerId
                    };
                    scaleTicketHttpServices.getContractListByCommodity(data, $scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            $scope.contractListGrowerAndCommodity = res.data.data.productionContract.concat(res.data.data.purchaseConfirmation);
                        }
                    });
                }
            };

            $scope.openPop = function(type, data) {
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.activeCommodity = $scope.myForm.commodityName;
                $scope.getContractListByGrowerIdAndCommodity();

                if ($scope.myForm.isSplitTicket) {
                    $scope.list = [];
                    $scope.myForm.splits.forEach(function (split, idx) {
                        var dataSplit = _.clone(split);
                        dataSplit.type = idx > 1 ? "Secondary" : "Primary";
                        $scope.list.push(dataSplit);
                    });
                } else {
                    $scope.list = [{
                        netWeight: $scope.myForm.netWeight,
                        netWeightMT: +($scope.myForm.netWeight/1000).toFixed(3),
                        grossWeight: $scope.myForm.grossWeight,
                        grossWeightMT: $scope.myForm.grossWeightMT,
                        tareWeight: $scope.myForm.tareWeight,
                        tareWeightMT: $scope.myForm.tareWeightMT,
                        contractNumber: $scope.myForm.contractNumber,
                        type: "Primary"
                    }];
                    $scope.addNewRow(0);
                }
            };

            function getNetWeight(sample, obj) {
                if (sample.analysisName != 'Dockage') {
                    sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                    sample.weightMT = sample.weight / 1000;
                } else {
                    sample.weight = obj.unloadWeidht * (sample.value / 100);
                    sample.weightMT = sample.weight / 1000;
                }
            }

            $scope.getAnalysisValue = (sample, obj) => {

                if (['Black Beans', 'Pinto Bean', 'Organic Pinto Beans', 'Cranberry Bean', 'Yellow Bean', 'Dark Red Kidney'].indexOf($scope.activeCommodity) != -1) {

                    getNetWeight(sample, obj);

                    if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    for (var i = 0; i < $scope.commodityDeliveryAnalysis.length; i++) {
                        if ($scope.commodityDeliveryAnalysis[i].analysisName == 'Dockage') {
                            obj.sampleweight = Number(obj.unloadWeidhtMT) - Number($scope.commodityDeliveryAnalysis[i].weightMT);
                        }
                    }

                    obj.netWeight = $scope.commodityDeliveryAnalysis.sum("weight");
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value) {
                        obj.splitTotal = Number($scope.commodityDeliveryAnalysis[1].value) + Number($scope.commodityDeliveryAnalysis[2].value);
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT;
                    }
                    if ($scope.myForm.delGrade == '#1 Damp' || $scope.myForm.delGrade == '#2 Damp') {
                        if (obj > 16) {
                            obj.moistureAdjustment = obj - 16;

                            if (obj.sampleweight) {
                                obj.moistureAdjustmentWeight = ((Number(obj.sampleweight) * obj.moistureAdjustment / 100));
                                obj.netTotalWeight = obj.netTotalWeight - obj.moistureAdjustmentWeight;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            }
                        }
                    }
                } else if (['Marrowfat Peas', 'Organic Marrowfat Peas'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == '18/64') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    }

                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value && $scope.commodityDeliveryAnalysis[4] && $scope.commodityDeliveryAnalysis[4].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                        obj.splitTotalWeight = ($scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT);
                    }
                } else if (['Whole Espace Green Peas', 'Whole Green Peas (Espace Type)'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Other Colors') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    }

                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value && $scope.commodityDeliveryAnalysis[4] && $scope.commodityDeliveryAnalysis[4].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                    }
                } else if (['Other Colors'].indexOf($scope.activeCommodity) != -1) {

                    getNetWeight(sample, obj);
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value && $scope.commodityDeliveryAnalysis[4] && $scope.commodityDeliveryAnalysis[4].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT + $scope.commodityDeliveryAnalysis[4].weightMT;
                    }
                } else if (['Kabuli Chick Peas', 'Organic Kabuli Chickpeas'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Pick') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['CDC RAY'].indexOf($scope.activeCommodity) != -1) {

                    getNetWeight(sample, obj);
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[0] && $scope.commodityDeliveryAnalysis[0].value && $scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[0].value + $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[0].weightMT + $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT;
                    }
                } else if (['Austrian Winter Peas'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Whole Green Peas', 'Maple Peas', 'Maple Peas JPD'].indexOf($scope.activeCommodity) != -1) {

                    getNetWeight(sample, obj);
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Maple Peas JP type'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'St/Damage') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    }


                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = $scope.myForm.netWeight / 1000;


                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Whole Yellow Peas', 'Austrian Winter Peas 4'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.commodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage' || sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value && $scope.commodityDeliveryAnalysis[3] && $scope.commodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.commodityDeliveryAnalysis[1].value + $scope.commodityDeliveryAnalysis[2].value + $scope.commodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.commodityDeliveryAnalysis[1].weightMT + $scope.commodityDeliveryAnalysis[2].weightMT + $scope.commodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Whole Red Lentils (Crimson type)', 'Large Green Lentils (Laird type)', 'Large Green Lentils', 'Richlea Lentils', 'Small Green Lentils (Eston)', 'Small Green Lentils (Eston Type)', 'Crimson Lentils', 'French Green Lentils', 'Organic Small Green Lentils'].indexOf($scope.activeCommodity) != -1) {

                    getNetWeight(sample, obj);
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && Number($scope.commodityDeliveryAnalysis[1].value) && $scope.commodityDeliveryAnalysis[2] && Number($scope.commodityDeliveryAnalysis[2].value)) {
                        if ($scope.myForm.delGrade == 'Canada #1') {
                            obj.allow = $scope.setContractGradeAllowance() || 2;
                            obj.totalOfAnalysis = Number($scope.commodityDeliveryAnalysis[1].value || 0) + Number($scope.commodityDeliveryAnalysis[2].value || 0) + Number($scope.commodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < obj.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        } else if ($scope.myForm.delGrade == 'Canada #2') {
                            obj.allow = $scope.setContractGradeAllowance() || 3.5;
                            obj.totalOfAnalysis = Number($scope.commodityDeliveryAnalysis[1].value || 0) + Number($scope.commodityDeliveryAnalysis[2].value || 0) + Number($scope.commodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < obj.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        } else if ($scope.myForm.delGrade == 'Canada X#3') {
                            obj.allow = $scope.setContractGradeAllowance() || 5;
                            obj.totalOfAnalysis = Number($scope.commodityDeliveryAnalysis[1].value || 0) + Number($scope.commodityDeliveryAnalysis[2].value || 0) + Number($scope.commodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < obj.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        } else if ($scope.myForm.delGrade == 'Canada #3') {
                            obj.allow = $scope.setContractGradeAllowance() || 10;
                            obj.totalOfAnalysis = Number($scope.commodityDeliveryAnalysis[1].value || 0) + Number($scope.commodityDeliveryAnalysis[2].value || 0) + Number($scope.commodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < $scope.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.commodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        }

                    }
                } else if (['Otebo Beans'].indexOf($scope.activeCommodity) != -1) {

                    getNetWeight(sample, obj);
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.commodityDeliveryAnalysis[1] && $scope.commodityDeliveryAnalysis[1].value && $scope.commodityDeliveryAnalysis[2] && $scope.commodityDeliveryAnalysis[2].value) {
                        obj.splitTotal = Number($scope.commodityDeliveryAnalysis[1].value) + Number($scope.commodityDeliveryAnalysis[2].value);
                        obj.splitTotalWeight = Number($scope.commodityDeliveryAnalysis[1].weightMT) + Number($scope.commodityDeliveryAnalysis[2].weightMT);
                    }
                } else if (['Canaryseed'].indexOf($scope.activeCommodity) != -1) {

                    sample.weight = (obj.unloadWeidht * sample.value) / 100;
                    sample.weightMT = sample.weight / 1000;
                    obj.netWeight = $scope.commodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    $scope.commodityDeliveryAnalysis.forEach(function(val) {
                        if (val && val.value) {
                            obj.dockageTotal += Number(val.value);
                        }
                    });

                    $scope.commodityDeliveryAnalysis.forEach(function(val) {
                        if (val && val.weightMT) {
                            obj.dockageTotalWeight += Number(val.weightMT);
                        }
                    });
                }
            };


            function getSplittWeight(sample, obj) {
                if (sample.analysisName != 'Dockage') {
                    sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                    sample.weightMT = sample.weight / 1000;
                } else {
                    sample.weight = obj.unloadWeidht * (sample.value / 100);
                    sample.weightMT = sample.weight / 1000;
                }
            }

            $scope.getSplittAnalysisValue = (sample, obj) => {

                if (['Black Beans', 'Pinto Bean', 'Organic Pinto Beans', 'Cranberry Bean', 'Yellow Bean', 'Dark Red Kidney'].indexOf($scope.activeCommodity) != -1) {

                    getSplittWeight(sample, obj);

                    if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    for (var i = 0; i < $scope.splittCommodityDeliveryAnalysis.length; i++) {
                        if ($scope.splittCommodityDeliveryAnalysis[i].analysisName == 'Dockage') {
                            obj.sampleweight = Number(obj.unloadWeidhtMT) - Number($scope.splittCommodityDeliveryAnalysis[i].weightMT);
                        }
                    }

                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value) {
                        obj.splitTotal = Number($scope.splittCommodityDeliveryAnalysis[1].value) + Number($scope.splittCommodityDeliveryAnalysis[2].value);
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT;
                    }
                    if (obj.delGrade == '#1 Damp' || obj.delGrade == '#2 Damp') {
                        if (obj.moisture > 16) {
                            obj.moistureAdjustment = obj.moisture - 16;

                            if (obj.sampleweight) {
                                obj.moistureAdjustmentWeight = ((Number(obj.sampleweight) * obj.moistureAdjustment / 100));
                                obj.netTotalWeight = obj.netTotalWeight - obj.moistureAdjustmentWeight;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            }
                        }
                    }
                } else if (['Marrowfat Peas', 'Organic Marrowfat Peas'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == '18/64') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    }

                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value && $scope.splittCommodityDeliveryAnalysis[4] && $scope.splittCommodityDeliveryAnalysis[4].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT + $scope.splittCommodityDeliveryAnalysis[4].weightMT;
                        obj.splitTotalWeight = ($scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT + $scope.splittCommodityDeliveryAnalysis[4].weightMT);
                    }
                } else if (['Whole Espace Green Peas', 'Whole Green Peas (Espace Type)'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Other Colors') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    }

                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value && $scope.splittCommodityDeliveryAnalysis[4] && $scope.splittCommodityDeliveryAnalysis[4].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT + $scope.splittCommodityDeliveryAnalysis[4].weightMT;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT + $scope.splittCommodityDeliveryAnalysis[4].weightMT;
                    }
                } else if (['Other Colors'].indexOf($scope.activeCommodity) != -1) {

                    getSplittWeight(sample, obj);
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value && $scope.splittCommodityDeliveryAnalysis[4] && $scope.splittCommodityDeliveryAnalysis[4].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT + $scope.splittCommodityDeliveryAnalysis[4].weightMT;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT + $scope.splittCommodityDeliveryAnalysis[4].weightMT;
                    }
                } else if (['Kabuli Chick Peas', 'Organic Kabuli Chickpeas'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Pick') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].value + $scope.splittCommodityDeliveryAnalysis[2].value + $scope.splittCommodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['CDC RAY'].indexOf($scope.activeCommodity) != -1) {

                    getSplittWeight(sample, obj);
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[0] && $scope.splittCommodityDeliveryAnalysis[0].value && $scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[0].value + $scope.splittCommodityDeliveryAnalysis[1].value + $scope.splittCommodityDeliveryAnalysis[2].value;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[0].weightMT + $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT;
                    }
                } else if (['Austrian Winter Peas'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].value + $scope.splittCommodityDeliveryAnalysis[2].value + $scope.splittCommodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Whole Green Peas', 'Maple Peas', 'Maple Peas JPD'].indexOf($scope.activeCommodity) != -1) {

                    getSplittWeight(sample, obj);
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].value + $scope.splittCommodityDeliveryAnalysis[2].value + $scope.splittCommodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Maple Peas JP type'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'St/Damage') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    }


                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = $scope.myForm.netWeight / 1000;


                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].value + $scope.splittCommodityDeliveryAnalysis[2].value + $scope.splittCommodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Whole Yellow Peas', 'Austrian Winter Peas 4'].indexOf($scope.activeCommodity) != -1) {
                    if (sample.analysisName == 'Splits') {
                        sample.weight = (obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100);
                        sample.weightMT = ((obj.unloadWeidht - $scope.splittCommodityDeliveryAnalysis[0].weight) * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Dockage') {
                        sample.weight = obj.unloadWeidht * (sample.value / 100);
                        sample.weightMT = (obj.unloadWeidht * (sample.value / 100) / 1000);
                    } else if (sample.analysisName == 'Damage' || sample.analysisName == 'St/Damage' || sample.analysisName == 'Bleach') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    } else if (sample.analysisName == 'CSC') {
                        sample.weight = 0;
                        sample.weightMT = 0;
                    }

                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value && $scope.splittCommodityDeliveryAnalysis[3] && $scope.splittCommodityDeliveryAnalysis[3].value) {
                        obj.splitTotal = $scope.splittCommodityDeliveryAnalysis[1].value + $scope.splittCommodityDeliveryAnalysis[2].value + $scope.splittCommodityDeliveryAnalysis[3].value;
                        obj.splitTotalWeight = $scope.splittCommodityDeliveryAnalysis[1].weightMT + $scope.splittCommodityDeliveryAnalysis[2].weightMT + $scope.splittCommodityDeliveryAnalysis[3].weightMT;
                    }
                } else if (['Whole Red Lentils (Crimson type)', 'Large Green Lentils (Laird type)', 'Large Green Lentils', 'Richlea Lentils', 'Small Green Lentils (Eston)', 'Small Green Lentils (Eston Type)', 'Crimson Lentils', 'French Green Lentils', 'Organic Small Green Lentils'].indexOf($scope.activeCommodity) != -1) {

                    getSplittWeight(sample, obj);
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.sum("weight");
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[1] && Number($scope.splittCommodityDeliveryAnalysis[1].value) && $scope.splittCommodityDeliveryAnalysis[2] && Number($scope.splittCommodityDeliveryAnalysis[2].value)) {
                        if (obj.delGrade == 'Canada #1') {
                            obj.allow = $scope.setContractGradeAllowance() || 2;
                            obj.totalOfAnalysis = Number($scope.splittCommodityDeliveryAnalysis[1].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[2].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < obj.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        } else if (obj.delGrade == 'Canada #2') {
                            obj.allow = $scope.setContractGradeAllowance() || 3.5;
                            obj.totalOfAnalysis = Number($scope.splittCommodityDeliveryAnalysis[1].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[2].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < obj.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        } else if (obj.delGrade == 'Canada X#3') {
                            obj.allow = $scope.setContractGradeAllowance() || 5;
                            obj.totalOfAnalysis = Number($scope.splittCommodityDeliveryAnalysis[1].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[2].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < obj.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        } else if (obj.delGrade == 'Canada #3') {
                            obj.allow = $scope.setContractGradeAllowance() || 10;
                            obj.totalOfAnalysis = Number($scope.splittCommodityDeliveryAnalysis[1].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[2].value || 0) + Number($scope.splittCommodityDeliveryAnalysis[3].value || 0);
                            if (obj.allow < $scope.totalOfAnalysis) {
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = ((((obj.totalOfAnalysis - obj.allow) / 100) * 2) * (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT));
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT) - obj.totalDamageMT;
                                obj.netWeight = obj.netTotalWeight * 1000;
                            } else {
                                obj.netTotalWeight = (obj.unloadWeidhtMT - $scope.splittCommodityDeliveryAnalysis[0].weightMT);
                                obj.netWeight = obj.netTotalWeight * 1000;
                                obj.totalDamage = obj.totalOfAnalysis;
                                obj.totalDamageMT = 0;
                            }
                        }

                    }
                } else if (['Otebo Beans'].indexOf($scope.activeCommodity) != -1) {

                    getSplittWeight(sample, obj);
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.sum("weight");
                    obj.netTotalWeight = obj.netWeight / 1000;

                    if ($scope.splittCommodityDeliveryAnalysis[1] && $scope.splittCommodityDeliveryAnalysis[1].value && $scope.splittCommodityDeliveryAnalysis[2] && $scope.splittCommodityDeliveryAnalysis[2].value) {
                        obj.splitTotal = Number($scope.splittCommodityDeliveryAnalysis[1].value) + Number($scope.splittCommodityDeliveryAnalysis[2].value);
                        obj.splitTotalWeight = Number($scope.splittCommodityDeliveryAnalysis[1].weightMT) + Number($scope.splittCommodityDeliveryAnalysis[2].weightMT);
                    }
                } else if (['Canaryseed'].indexOf($scope.activeCommodity) != -1) {

                    sample.weight = (obj.unloadWeidht * sample.value) / 100;
                    sample.weightMT = sample.weight / 1000;
                    obj.netWeight = $scope.splittCommodityDeliveryAnalysis.totalWeight("weight", obj);
                    obj.netTotalWeight = obj.netWeight / 1000;


                    $scope.splittCommodityDeliveryAnalysis.forEach(function(val) {
                        if (val && val.value) {
                            obj.dockageTotal += Number(val.value);
                        }
                    });

                    $scope.splittCommodityDeliveryAnalysis.forEach(function(val) {
                        if (val && val.weightMT) {
                            obj.dockageTotalWeight += Number(val.weightMT);
                        }
                    });
                }
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
