angular.module('myApp.positionReport', [])
    .controller('positionReportCtrl', function($scope, apiUrl, $rootScope, $state, httpService, commonService, spinnerService, reportHttpServices, $timeout) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.reports || !data.reports.position || !data.reports.position.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });


        $scope.active = {
            page: 'position'
        };
        $scope.myForm = {};
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.tab = 1;
        $scope.cropYears = commonService.cropYears();
        $scope.refreshProValue = () => {
            $scope.allTotalCWT = 0;
            $scope.TotalProQuantityLbs = 0;
            $scope.TotalProCWT = 0;
            $scope.TotalProSept = 0;
            $scope.TotalProOct = 0;
            $scope.TotalProNov = 0;
            $scope.TotalProDec = 0;
            $scope.TotalProJan = 0;
            $scope.TotalProFeb = 0;
            $scope.TotalProMarch = 0;
            $scope.TotalProApril = 0;
            $scope.TotalProMay = 0;
            $scope.TotalProJune = 0;
            $scope.TotalProJuly = 0;
            $scope.TotalProAugust = 0;
            $scope.TotalProNetFOBCAD = 0;
            $scope.TotalProWeightAvg = 0;
        };
        $scope.refreshSaleValue = () => {
            $scope.salesallTotalCWT = 0;
            $scope.TotalSaleQuantityLbs = 0;
            $scope.TotalSaleCWT = 0;
            $scope.TotalSaleSept = 0;
            $scope.TotalSaleOct = 0;
            $scope.TotalSaleNov = 0;
            $scope.TotalSaleDec = 0;
            $scope.TotalSaleJan = 0;
            $scope.TotalSaleFeb = 0;
            $scope.TotalSaleMarch = 0;
            $scope.TotalSaleApril = 0;
            $scope.TotalSaleMay = 0;
            $scope.TotalSaleJune = 0;
            $scope.TotalSaleJuly = 0;
            $scope.TotalSaleAugust = 0;
            $scope.TotalSaleNetFOBCAD = 0;
            $scope.TotalSaleWeightAvg = 0;
        };
        $scope.setTab = function(newTab, commodityId, gradeId) {
            $scope.tab = newTab;
            if (commodityId) {
                $scope.myForm.commodityId = commodityId;
                $scope.myForm.inventoryGrade = gradeId;
                $scope.getGrade(commodityId, 'myForm');
                $scope.initPosition(commodityId);
                $scope.initSalesPosition(commodityId);
            }
        };

        function compare(s, e) {
            var a = new Date(s.list[0].createdAt),
                b = new Date(e.list[0].createdAt);
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        }

        $scope.isSet = function(tabNum) {
            return $scope.tab === tabNum;
        };
        $scope.initSalesSummaryReport = () => {
            if (!$scope.myForm.year) {
                $scope.salesSummaryReport = [];
                return;
            }
            var year = [$scope.myForm.year];

            spinnerService.show("html5spinner");
            reportHttpServices.getSalesSummaryReport(year, $scope.token).then(function(res) {
                spinnerService.hide("html5spinner");

                $scope.salesSummaryReport = [];
                $scope.reportUpdated = null;

                if (res.data.status == 200 && res.data.data) {
                    const postitionReport = res.data.data;
                    $scope.reportUpdated = postitionReport.updatedAt;
                    $scope.whenWillBeUpdated = postitionReport.whenWillBeUpdated;
                    var data = postitionReport.report.data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].total_production_purchase || data[i].total_weightedAvg || data[i].totalSale || data[i].total_salesAvg) {
                            $scope.salesSummaryReport.push(data[i]);
                        }
                    }
                    $scope.salesSummaryReport.sort(function(a, b) {
                        return a.commodityId.commodityName > b.commodityId.commodityName ? 1 : (a.commodityId.commodityName < b.commodityId.commodityName ? -1 : 0);
                    });

                }

            });
        };
        $scope.initSalesSummaryReport();

        $scope.initPosition = (commodityId) => {

            var year = [$scope.myForm.year];

            if (commodityId == undefined) {
                commodityId = '';
            }

            spinnerService.show("html5spinner");
            reportHttpServices.getPositionReport(commodityId, year, $scope.myForm.inventoryGrade, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.positionReport = res.data.data;
                    $scope.refreshProValue();
                    if ($scope.positionReport) {
                        for (var i = 0; i < $scope.positionReport.length; i++) {
                            if ($scope.positionReport[i].list[0].status != 2) {
                                $scope.allTotalCWT += Number($scope.positionReport[i].total);
                            }
                        }
                        for (var j = 0; j < $scope.positionReport.length; j++) {
                            for (var k = 0; k < $scope.positionReport[j].list.length; k++) {
                                var contractRef = $scope.positionReport[j].list[k];
                                if (contractRef.quantityLbs && contractRef.status != 2) {
                                    $scope.TotalProQuantityLbs += contractRef.quantityLbs;

                                }

                                if (contractRef.growerId) {
                                    if (contractRef.contractNumber.substring(0, 2) == 'PC') {
                                        $scope.positionReport[j].list[k].url = '/purchaseConfirmation/' + contractRef.growerId._id + '/edit/' + contractRef.contractNumber;
                                    } else {
                                        $scope.positionReport[j].list[k].url = '/addProductionContract/' + contractRef.growerId._id + '/edit/' + contractRef.contractNumber;
                                    }

                                    $scope.positionReport[j].list[k].user = `/growerDetails/${contractRef.growerId._id}`;
                                    $scope.positionReport[j].list[k].contractName = contractRef.personFarmType == 'Person' ? contractRef.growerId.firstName + ' ' + contractRef.growerId.lastName : (contractRef.farmName || contractRef.growerId.farmName);
                                } else if(contractRef.buyerId) {
                                    $scope.positionReport[j].list[k].url = '/editTradePurchase/' + $scope.positionReport[j]._id;
                                    $scope.positionReport[j].list[k].CWTDel = contractRef.netFOBCAD;

                                    $scope.positionReport[j].list[k].user = `/buyerDetails/${contractRef.buyerId._id}`;
                                    $scope.positionReport[j].list[k].contractName = contractRef.buyerId.businessName;
                                } else {
                                    $scope.positionReport[j].list[k].CWTDel = contractRef.amount;
                                }

                                if ($scope.allTotalCWT && contractRef.status != 2) {
                                    $scope.positionReport[j].list[k].weightAvg = ($scope.positionReport[j].total / $scope.allTotalCWT) * contractRef.CWTDel;
                                }
                                if (contractRef.status != 2) {
                                    $scope.TotalProCWT += contractRef.totalCWT;
                                    $scope.TotalProSept += contractRef.deliveryMonth == 9 ? contractRef.totalCWT : 0;
                                    $scope.TotalProOct += contractRef.deliveryMonth == 10 ? contractRef.totalCWT : 0;
                                    $scope.TotalProNov += contractRef.deliveryMonth == 11 ? contractRef.totalCWT : 0;
                                    $scope.TotalProDec += contractRef.deliveryMonth == 12 ? contractRef.totalCWT : 0;
                                    $scope.TotalProJan += contractRef.deliveryMonth == 1 ? contractRef.totalCWT : 0;
                                    $scope.TotalProFeb += contractRef.deliveryMonth == 2 ? contractRef.totalCWT : 0;
                                    $scope.TotalProMarch += contractRef.deliveryMonth == 3 ? contractRef.totalCWT : 0;
                                    $scope.TotalProApril += contractRef.deliveryMonth == 4 ? contractRef.totalCWT : 0;
                                    $scope.TotalProMay += contractRef.deliveryMonth == 5 ? contractRef.totalCWT : 0;
                                    $scope.TotalProJune += contractRef.deliveryMonth == 6 ? contractRef.totalCWT : 0;
                                    $scope.TotalProJuly += contractRef.deliveryMonth == 7 ? contractRef.totalCWT : 0;
                                    $scope.TotalProAugust += contractRef.deliveryMonth == 8 ? contractRef.totalCWT : 0;

                                    $scope.TotalProNetFOBCAD += contractRef.CWTDel;
                                    $scope.TotalProWeightAvg += contractRef.weightAvg;
                                }
                            }
                        }

                        $scope.positionReport.sort(compare);
                    }
                    spinnerService.hide("html5spinner");
                }
            });
        };
        $scope.initSalesPosition = (commodityId) => {

            var year = [$scope.myForm.year];

            if (commodityId == undefined) {
                commodityId = '';
            }
            spinnerService.show("html5spinner");
            reportHttpServices.getPositionSalesReport(commodityId, year, $scope.myForm.inventoryGrade, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.positionSalesReport = res.data.data;
                    $scope.refreshSaleValue();
                    spinnerService.hide("html5spinner");
                    if ($scope.positionSalesReport) {
                        for (var i = 0; i < $scope.positionSalesReport.length; i++) {
                            if ($scope.positionSalesReport[i].status != 2) {
                                $scope.salesallTotalCWT += Number($scope.positionSalesReport[i].total);
                            }
                        }
                        for (var j = 0; j < $scope.positionSalesReport.length; j++) {
                            for (var k = 0; k < $scope.positionSalesReport[j].list.length; k++) {
                                var report = $scope.positionSalesReport[j].list[k];
                                if ($scope.positionSalesReport[j].list[k].buyerId) {
                                    $scope.positionSalesReport[j].list[k].contractUrl = 'editSalesContract/' + report.buyerId._id + '/' + report.contractNumber + '/edit';
                                    $scope.positionSalesReport[j].list[k].profileUrl = 'buyerDetails/' + report.buyerId._id;
                                    $scope.positionSalesReport[j].list[k].contractName = report.buyerId.businessName;
                                } else {
                                    $scope.positionSalesReport[j].list[k].contractUrl = '';
                                    $scope.positionSalesReport[j].list[k].profileUrl = '';
                                    $scope.positionSalesReport[j].list[k].netFOBCAD = report.amount;
                                }

                                if ($scope.salesallTotalCWT && $scope.positionSalesReport[j].list[k].status != 2) {
                                        $scope.positionSalesReport[j].list[k].weightAvg = ($scope.positionSalesReport[j].list[k].totalCWT / $scope.salesallTotalCWT) * $scope.positionSalesReport[j].list[k].netFOBCAD;
                                    }
                                if ($scope.positionSalesReport[j].list[k].status != 2) {
                                    $scope.TotalSaleQuantityLbs += $scope.positionSalesReport[j].list[k].quantityLbs;
                                    $scope.TotalSaleCWT += $scope.positionSalesReport[j].list[k].totalCWT;
                                    $scope.TotalSaleSept += $scope.positionSalesReport[j].list[k].deliveryMonth == 9 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleOct += $scope.positionSalesReport[j].list[k].deliveryMonth == 10 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleNov += $scope.positionSalesReport[j].list[k].deliveryMonth == 11 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleDec += $scope.positionSalesReport[j].list[k].deliveryMonth == 12 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleJan += $scope.positionSalesReport[j].list[k].deliveryMonth == 1 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleFeb += $scope.positionSalesReport[j].list[k].deliveryMonth == 2 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleMarch += $scope.positionSalesReport[j].list[k].deliveryMonth == 3 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleApril += $scope.positionSalesReport[j].list[k].deliveryMonth == 4 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleMay += $scope.positionSalesReport[j].list[k].deliveryMonth == 5 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleJune += $scope.positionSalesReport[j].list[k].deliveryMonth == 6 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleJuly += $scope.positionSalesReport[j].list[k].deliveryMonth == 7 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;
                                    $scope.TotalSaleAugust += $scope.positionSalesReport[j].list[k].deliveryMonth == 8 ? $scope.positionSalesReport[j].list[k].totalCWT : 0;

                                    $scope.TotalSaleNetFOBCAD += $scope.positionSalesReport[j].list[k].netFOBCAD;
                                    $scope.TotalSaleWeightAvg += ($scope.positionSalesReport[j].list[k].weightAvg || 0);
                                }
                            }
                        }

                        $scope.positionSalesReport.sort(compare);

                    }
                }
            });
        };
        httpService.getCommodity($scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.commoditys = res.data.data;
            }
        });
        $scope.getGrade = function(id, formName) {
            httpService.getGrade('', id, $scope.token).then(function(res) {
                $scope.grades = res.data.status == 200 ? res.data.data : [];
                var varName = 'inventoryGrade'+formName;
                $scope[varName] = [];
                $scope.grades.forEach((grade) => {
                    if (['Both', 'All'].includes(grade.gradeDisplay)) {
                        $scope[varName].push(grade);
                    } else if (grade.gradeDisplay == 'Inventory Grade') {
                        $scope[varName].push(grade);
                    }
                });
            });
        };
        $scope.commodityFilterValue = '';
        $scope.commodityFilter = (commodityId) => {
            if ($scope.tab == 1) {
                $scope.commodityFilterValue = commodityId;
                if (commodityId) {
                    $scope.getGrade(commodityId, 'myForm');
                } else {
                    $scope.inventoryGrade = [];
                }
                $scope.inventoryGradeFilterValue = '';
                $scope.myForm.inventoryGrade = '';
                // $scope.initSalesSummaryReport();
            } else {
                $scope.myForm.inventoryGrade = '';
                $scope.getGrade(commodityId, 'myForm');
                $scope.initPosition(commodityId);
                $scope.initSalesPosition(commodityId);
            }

        };

        $scope.getClass = (data) => {
            if (data.status == 2) return "clsRed";
            else return "";
        };

        $scope.cropYearFilter = (commodityId) => {
            $scope.startYear = '';
            $scope.endYear = '';

            if ($scope.myForm.year) {
                $scope.startYear = Number($scope.myForm.year);
                $scope.endYear = $scope.startYear + 1;
            }
            if ($scope.tab == 1) {
                $scope.commodityFilterValue = '';
                $scope.inventoryGradeFilterValue = '';
                $scope.myForm.commodityId = null;
                $scope.myForm.inventoryGrade = null;

                $scope.initSalesSummaryReport();
            } else {
                $scope.initPosition(commodityId);
                $scope.initSalesPosition(commodityId);
            }

        };

        $scope.inventoryGradeFilterValue = '';
        $scope.inventoryGradeFilter = (commodityId) => {
            if ($scope.tab == 1) {
                $scope.inventoryGradeFilterValue = $scope.myForm.inventoryGrade;
                // $scope.initSalesSummaryReport();
            } else {
                $scope.initPosition(commodityId);
                $scope.initSalesPosition(commodityId);
            }

        };

        function getTotal(s) {
            return Number(s.total_production_purchase) - Number(s.totalSale);
        }

        $scope.exportData = () => {
            var newData = [],
                other_data = [];
            if ($scope.tab == 1) {
                newData = $scope.salesSummaryReport.map((s) => {
                    let margin = (s.total_salesAvg != 0 && s.total_weightedAvg != 0) ? (s.total_salesAvg - s.total_weightedAvg) : 0;
                    return {
                        'Commodity': s.commodityId ? s.commodityId.commodityName : '',
                        'Grade': s.inventoryGrade ? s.inventoryGrade.gradeName : '',
                        'TL Purchases': s.total_production_purchase ? s.total_production_purchase.toFixed(2) : 0.00,
                        'AVG Purchase': s.total_weightedAvg ? s.total_weightedAvg.toFixed(2) : 0.00,
                        'TL Sales': s.totalSale ? s.totalSale.toFixed(2) : 0.00,
                        'Avg Sales': s.total_salesAvg ? s.total_salesAvg.toFixed(2) : 0.00,
                        'Long/Short': getTotal(s),
                        'MG/CWT': margin.toFixed(2),
                        'YTD Gross Margin': '',
                        'Gain/Loss (CAD$)': ''
                    };
                });
            } else {

                if ($scope.positionReport && $scope.positionReport.length != 0) {
                    $scope.positionReport.forEach((p) => {
                        p.list.forEach((e) => {
                            var name = '';
                            if (e.personFarmType == 'Person') {
                                name = e.growerId.firstName + ' ' + e.growerId.lastName;
                            }
                            newData.push({
                                'Date': moment(e.createdAte).format('YYYY-MM-DD'),
                                'Contract Name': name,
                                'Contract#': e.contractNumber,
                                'Total Lbs': e.quantityLbs ? e.quantityLbs.toFixed(2) : 0.00,
                                'Total CWT': e.totalCWT ? e.totalCWT.toFixed(2) : 0.00,
                                'Sept': e.deliveryMonth == 9 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'Oct': e.deliveryMonth == 10 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'Nov': e.deliveryMonth == 11 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'Dec': e.deliveryMonth == 12 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'Jan': e.deliveryMonth == 1 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'Feb': e.deliveryMonth == 2 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'March': e.deliveryMonth == 3 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'April': e.deliveryMonth == 4 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'May': e.deliveryMonth == 5 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'June': e.deliveryMonth == 6 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'July': e.deliveryMonth == 7 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'August': e.deliveryMonth == 8 ? e.totalCWT ? e.totalCWT.toFixed(2) : 0.00 : 0.00,
                                'TL CWT': e.totalCWT ? e.totalCWT.toFixed(2) : 0.00,
                                'NET FOB CAD/CWT': e.CWTDel ? e.CWTDel.toFixed(2) : 0.00,
                                'Weight Avg Calc': e.weightAvg ? e.weightAvg.toFixed(2) : 0.00
                            });
                        });
                    });

                    newData.push({
                        'Date': '',
                        'Contract Name': '',
                        'Contract#': '',
                        'Total Lbs': $scope.TotalProQuantityLbs ? $scope.TotalProQuantityLbs.toFixed(2) : 0.00,
                        'Total CWT': $scope.TotalProCWT ? $scope.TotalProCWT.toFixed(2) : 0.00,
                        'Sept': $scope.TotalProSept ? $scope.TotalProSept.toFixed(2) : 0.00,
                        'Oct': $scope.TotalProOct ? $scope.TotalProOct.toFixed(2) : 0.00,
                        'Nov': $scope.TotalProNov ? $scope.TotalProNov.toFixed(2) : 0.00,
                        'Dec': $scope.TotalProDec ? $scope.TotalProDec.toFixed(2) : 0.00,
                        'Jan': $scope.TotalProJan ? $scope.TotalProJan.toFixed(2) : 0.00,
                        'Feb': $scope.TotalProFeb ? $scope.TotalProFeb.toFixed(2) : 0.00,
                        'March': $scope.TotalProMarch ? $scope.TotalProMarch.toFixed(2) : 0.00,
                        'April': $scope.TotalProApril ? $scope.TotalProApril.toFixed(2) : 0.00,
                        'May': $scope.TotalProMay ? $scope.TotalProMay.toFixed(2) : 0.00,
                        'June': $scope.TotalProJune ? $scope.TotalProJune.toFixed(2) : 0.00,
                        'July': $scope.TotalProJuly ? $scope.TotalProJuly.toFixed(2) : 0.00,
                        'August': $scope.TotalProAugust ? $scope.TotalProAugust.toFixed(2) : 0.00,
                        'TL CWT': $scope.TotalProCWT ? $scope.TotalProCWT.toFixed(2) : 0.00,
                        'NET FOB CAD/CWT': $scope.TotalProNetFOBCAD ? $scope.TotalProNetFOBCAD.toFixed(2) : 0.00,
                        'Weight Avg Calc': $scope.TotalProWeightAvg ? $scope.TotalProWeightAvg.toFixed(2) : 0.00,
                    });
                }

                if ($scope.positionSalesReport && $scope.positionSalesReport.length != 0) {
                    $scope.positionSalesReport.forEach((p) => {
                        p.list.forEach((e) => {
                            other_data.push({
                                'Date': moment(e.createdAt).format('YYYY-MM-DD'),
                                'Contract Name': e.buyerId ? e.buyerId.businessName : '',
                                'Contract#': e.contractNumber,
                                'Total Lbs': e.quantityLbs ? e.quantityLbs.toFixed(2) : 0.00,
                                'Total CWT': e.totalCWT ? e.totalCWT.toFixed(2) : 0.00,
                                'Sept': e.deliveryMonth == 9 ? e.totalCWT.toFixed(2) : 0.00,
                                'Oct': e.deliveryMonth == 10 ? e.totalCWT.toFixed(2) : 0.00,
                                'Nov': e.deliveryMonth == 11 ? e.totalCWT.toFixed(2) : 0.00,
                                'Dec': e.deliveryMonth == 12 ? e.totalCWT.toFixed(2) : 0.00,
                                'Jan': e.deliveryMonth == 1 ? e.totalCWT.toFixed(2) : 0.00,
                                'Feb': e.deliveryMonth == 2 ? e.totalCWT.toFixed(2) : 0.00,
                                'March': e.deliveryMonth == 3 ? e.totalCWT.toFixed(2) : 0.00,
                                'April': e.deliveryMonth == 4 ? e.totalCWT.toFixed(2) : 0.00,
                                'May': e.deliveryMonth == 5 ? e.totalCWT.toFixed(2) : 0.00,
                                'June': e.deliveryMonth == 6 ? e.totalCWT.toFixed(2) : 0.00,
                                'July': e.deliveryMonth == 7 ? e.totalCWT.toFixed(2) : 0.00,
                                'August': e.deliveryMonth == 8 ? e.totalCWT.toFixed(2) : 0.00,
                                'TL CWT': e.totalCWT ? e.totalCWT.toFixed(2) : 0.00,
                                'NET FOB CAD/CWT': e.CWTDel ? e.CWTDel.toFixed(2) : 0.00,
                                'Weight Avg Calc': e.weightAvg ? e.weightAvg.toFixed(2) : 0.00
                            });
                        });

                    });

                    other_data.push({
                        'Date': '',
                        'Contract Name': '',
                        'Contract#': '',
                        'Total Lbs': $scope.TotalSaleQuantityLbs ? $scope.TotalSaleQuantityLbs.toFixed(2) : 0.00,
                        'Total CWT': $scope.TotalSaleCWT ? $scope.TotalSaleCWT.toFixed(2) : 0.00,
                        'Sept': $scope.TotalSaleSept ? $scope.TotalSaleSept.toFixed(2) : 0.00,
                        'Oct': $scope.TotalSaleOct ? $scope.TotalSaleOct.toFixed(2) : 0.00,
                        'Nov': $scope.TotalSaleNov ? $scope.TotalSaleNov.toFixed(2) : 0.00,
                        'Dec': $scope.TotalSaleDec ? $scope.TotalSaleDec.toFixed(2) : 0.00,
                        'Jan': $scope.TotalSaleJan ? $scope.TotalSaleJan.toFixed(2) : 0.00,
                        'Feb': $scope.TotalSaleFeb ? $scope.TotalSaleFeb.toFixed(2) : 0.00,
                        'March': $scope.TotalSaleMarch ? $scope.TotalSaleMarch.toFixed(2) : 0.00,
                        'April': $scope.TotalSaleApril ? $scope.TotalSaleApril.toFixed(2) : 0.00,
                        'May': $scope.TotalSaleMay ? $scope.TotalSaleMay.toFixed(2) : 0.00,
                        'June': $scope.TotalSaleJune ? $scope.TotalSaleJune.toFixed(2) : 0.00,
                        'July': $scope.TotalSaleJuly ? $scope.TotalSaleJuly.toFixed(2) : 0.00,
                        'August': $scope.TotalSaleAugust ? $scope.TotalSaleAugust.toFixed(2) : 0.00,
                        'TL CWT': $scope.TotalSaleCWT ? $scope.TotalSaleCWT.toFixed(2) : 0.00,
                        'NET FOB CAD/CWT': $scope.TotalSaleNetFOBCAD ? $scope.TotalSaleNetFOBCAD.toFixed(2) : 0.00,
                        'Weight Avg Calc': $scope.TotalSaleWeightAvg ? $scope.TotalSaleWeightAvg.toFixed(2) : 0.00,
                    });
                }
            }

            if (newData && newData.length) {
                var request = new XMLHttpRequest();
                var name = $scope.tab == 1 ? 'summary' : 'position_report';
                var obj = {
                    'data': newData,
                    'fileName': moment().format('MM/DD/YYYY') + name + '.xlsx'
                };


                request.open("POST", apiUrl + 'export', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
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

                request.send(JSON.stringify(obj));
            }

            if ($scope.tab != 1 && other_data && other_data.length) {
                var req = new XMLHttpRequest();
                var obj1 = {
                    'data': other_data,
                    'fileName': moment().format('MM/DD/YYYY') + ' SalesContract.xlsx'
                };
                req.open("POST", apiUrl + 'export', true);
                req.responseType = "blob";
                req.setRequestHeader("Content-type", "application/json");
                req.onload = function(e) {
                    if (this.status === 200) {
                        var file = window.URL.createObjectURL(this.response);
                        var a = document.createElement("a");
                        a.href = file;
                        a.download = obj1.fileName;
                        document.body.appendChild(a);
                        a.click();
                    }
                };

                req.send(JSON.stringify(obj1));

            }
        };

        $scope.print = function(printSectionId) {
            $timeout(function() {
                var innerContents = document.getElementById("printSectionId").innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=800,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();

            }, 1000);

        };

        $scope.regenerateReport = function() {
            if (!$scope.myForm.year) {
                return;
            }

            spinnerService.show("html5spinner");
            reportHttpServices.refreshPositionReport({ year: $scope.myForm.year }, $scope.token).then(res => {
                spinnerService.hide("html5spinner");

                $scope.salesSummaryReport = [];
                $scope.reportUpdated = null;

                if (res.data.status == 200 && res.data.data) {
                    const postitionReport = res.data.data;
                    $scope.reportUpdated = postitionReport.updatedAt;
                    var data = postitionReport.report.data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].total_production_purchase || data[i].total_weightedAvg || data[i].totalSale || data[i].total_salesAvg) {
                            $scope.salesSummaryReport.push(data[i]);
                        }
                    }
                    $scope.salesSummaryReport.sort(function(a, b) {
                        return a.commodityId.commodityName > b.commodityId.commodityName ? 1 : (a.commodityId.commodityName < b.commodityId.commodityName ? -1 : 0);
                    });
                }
            });
        };

        $scope.openPop = function(data) {
            $scope.adjustmentForm = {};
            $scope.adjustmentForm.commodityId = data.commodityId._id;
            $scope.adjustmentForm.inventoryGrade = data.inventoryGrade._id;
            $scope.adjustmentForm.cropYear = $scope.myForm.year;
            $scope.getGrade($scope.adjustmentForm.commodityId, 'adjustmentForm');
            $(".add_coomm").fadeIn();
        };

        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
        };


        $scope.addMonthlyAdjustment = function() {
            reportHttpServices
            .commodityMonthlyAdjustment($scope.adjustmentForm, $scope.token)
            .then(function(res) {
                if (res.data.status == 200) {
                $scope.adjustmentForm = {};
                $scope.closepop();
                swal("Message", res.data.userMessage, "success");
                } else {
                swal("Message", res.data.userMessage, "error");
                }
            });
        };

    });
