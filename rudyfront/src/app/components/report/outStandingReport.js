angular.module('myApp.outStandingReport', [])
    .controller('outStandingReportCtrl', function($scope, apiUrl, $rootScope, httpService, spinnerService, reportHttpServices, commonService, $state) {


        $scope.$on('access', (event, data) => {
            if (!data || !data.reports || !data.reports.openContracts || !data.reports.openContracts.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'openContracts'
        };
        $scope.cropYears = commonService.cropYears();
        $scope.editMode = function(report) {
            $scope.selectedOutstandingReport = angular.copy(report);
            report.edit = !report.edit;
        };

        $scope.searchForm = {
            date: moment().format('YYYY-MM-DD'),
            reportName: 'OpenContractSalesExcel',
            entityName: 'OpenContractSales'
        };

        $scope.cancel = function(report) {
            report.remainingUSDAmount = $scope.selectedOutstandingReport.remainingUSDAmount;
            report.edit = !report.edit;
        };

        $scope.save = function(report) {

            var data = {
                _id: report._id,
                remainingUSDAmount: report.remainingUSDAmount
            };

            reportHttpServices
                .updateOutstandingSalesReport(data, $scope.token)
                .then(function(res) {
                    if (res.data.status == 200) {
                        $scope.getSales();
                        swal("success", "Report updated", "success");
                    }
                }, function(error) {
                    swal("ERROR", "Something went wrong", "error");
                });

        };


        var prev_filter = localStorage.getItem('outStanding_report_filter');

        $scope.myForm = prev_filter ? JSON.parse(prev_filter) : {};

        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.tab = localStorage.getItem('outStanding_report_tab') || 1;


        $scope.setTab = function(newTab) {
            $scope.tab = newTab;
            localStorage.setItem('outStanding_report_tab', JSON.stringify(newTab));
            if (newTab == 1) {
                $scope.getSales();
            } else {
                $scope.getPurchase();
            }
        };

        $scope.filter = function() {
            return $scope.tab == 1 ? $scope.getSales() : $scope.getPurchase();
        };

        $scope.clear = function() {
            $scope.myForm = {};
            $scope.filter();
        };


        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });

        $scope.getSales = () => {
            localStorage.setItem('outStanding_report_filter', JSON.stringify($scope.myForm));
            spinnerService.show('html5spinner');

            var searchParam = Object.assign({}, $scope.myForm);
            searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
            searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

            reportHttpServices
                .outstandingSalesReport(searchParam, $scope.token)
                .then((objS) => {
                    spinnerService.hide('html5spinner');
                    $scope.salesList = objS.data.status == 200 ? objS.data.data.docs : [];
                });
        };

        $scope.commissionType = function(cType) {
            switch (cType) {
                case "$":
                    return "$/CWT";
                case "%":
                    return "%";
                case "$pmt":
                    return "$/MT";
                default:
                    return "";
            }
        };

        $scope.getPurchase = () => {
            localStorage.setItem('outStanding_report_filter', JSON.stringify($scope.myForm));
            spinnerService.show('html5spinner');

            var searchParam = Object.assign({}, $scope.myForm);
            searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
            searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

            reportHttpServices
                .outstandingPurchaseReport(searchParam, $scope.token)
                .then((objS) => {
                    spinnerService.hide('html5spinner');
                    // $scope.purchaseList = objS.data.status == 200 ? objS.data.data.docs : [];
                    $scope.purchaseList = [];
                    $scope.tradePurchaseList = [];
                    if (objS.data.status == 200) {
                        $scope.purchaseList = objS.data.data;
                        $scope.tradePurchaseList = objS.data.trade;
                        $scope.tradePurchaseList.forEach(function(trade, index) {
                            $scope.tradePurchaseList[index].quantityUnit = trade.units;
                        });
                    }

                });
        };


        $scope.getShippedQuantityLbs = (scale) => {
            var totalShippedQuantityLbs = 0;
            if (scale && scale.length > 0) {
                scale.forEach((val) => {
                    // convert kg to pounds ( Number(val.netWeight) * 2.2046)
                    totalShippedQuantityLbs += val.unloadWeidht && !val.void ? Number(val.unloadWeidht) * 2.2046 : 0;
                });
            }
            return totalShippedQuantityLbs;
        };

        $scope.getQuantityLbs = (contract) => {
            var contractQuantity = 0;
            if (contract.contractQuantity) {
                if (contract.quantityUnit == 'Lbs') {
                    contractQuantity = Number(contract.contractQuantity);
                } else if (contract.quantityUnit == 'CWT') {
                    contractQuantity = Number(contract.contractQuantity) * 100;
                } else if (contract.quantityUnit == 'MT') {
                    var total_cwt = 22.0462 * Number(contract.contractQuantity);
                    contractQuantity = total_cwt * 100;
                } else if (contract.quantityUnit == 'BU') {
                    contractQuantity = Number(contract.contractQuantity) * 60;
                }
            }
            return contractQuantity;
        };

        $scope.getContractSalesPriceCWT = function(report) {
            report.contractSalesPriceCWT = report.amount/(report.amountUnit == 'MT' ? 22.0462 : 1);
            return report.contractSalesPriceCWT;
        };

        $scope.getContractSalesPriceCWTCAD = function(report) {
            report.contractSalesPriceCWTCAD = (report.contractCurrency == 'USD' ? report.exchangeRate : 1) * report.contractSalesPriceCWT;
            return report.contractSalesPriceCWTCAD;
        };

        $scope.getTotalCost = function(report) {
            report.totalCost = (
                ((report.brokerCommision ? parseFloat(report.brokerCommision) : 0) + report.oceanFreightCWT +
                report.blFeeCWT + report.documentCostingCWT + report.lcCostCWT + report.ariPolicyCWT +
                report.insuranceRate) * report.exchangeRate + report.interestRateCWT +
                report.stuffingCWT + report.bagCostCWT + report.inlandFrtStuffingBuffer +
                (report.certificateAnalysis ? report.certificateAnalysis.cost : 0) + report.missCostCWT1 + report.missCostCWT2 +
                report.missCostCWT3
            );
            return report.totalCost;
        };

        $scope.filter();

        $scope.exportSalesData = function() {
            if ($scope.salesList && $scope.salesList.length != 0) {
                return $scope.salesList.map(function(report) {
                    return {
                        'Contract': report.contractNumber,
                        'Date': moment(report.createdAt).format('YYYY-MM-DD'),
                        'Customer': report.buyerId ? report.buyerId.businessName : '',
                        'Remaining USD Amount': report.remainingUSDAmount,
                        'Total Contract Qt': report.quantityLbs ? Number(report.quantityLbs).toFixed(2) : 0,
                        'Shipped QTY': ($scope.getShippedQuantityLbs(report.scale)).toFixed(0),
                        'Balance to ship': (report.quantityLbs - $scope.getShippedQuantityLbs(report.scale)).toFixed(0),
                        'Contract Terms': report.pricingTerms && report.pricingTerms.pricingTerms,
                        'Destination': report.destination,
                        'Contract Sales Price': report.amount ? Number(report.amount).toFixed(2) : 0,
                        'Price Per': report.amountUnit,
                        'Currency': report.contractCurrency,
                        'Contract Sales(CWT)': Number($scope.getContractSalesPriceCWT(report)).toFixed(4),
                        'CAD Contract Sales(CWT)': Number($scope.getContractSalesPriceCWTCAD(report)).toFixed(4),
                        'NetFOB': report.netFOBCAD ? Number(report.netFOBCAD).toFixed(4) : 0,
                        'Broker Comm': report.brokerCommision ? (Number(report.brokerCommision).toFixed(4) + $scope.commissionType(report.commissionType)) : 0,
                        'Ocean Freight (CWT)': report.oceanFreightCWT ? Number(report.oceanFreightCWT).toFixed(4) : 0,
                        'BL Fee (CWT)': Number(report.blFeeCWT).toFixed(4),
                        'Docs Fee (CWT)': report.documentCostingCWT ? Number(report.documentCostingCWT).toFixed(4) : 0,
                        'LC Costing (CWT)': report.lcCostCWT ? Number(report.lcCostCWT).toFixed(4) : 0,
                        'Insurance Rate (CWT)': report.insuranceRate ? Number(report.insuranceRate).toFixed(4) : 0,
                        'ARI/CWT': Number(report.ariPolicyCWT).toFixed(4),
                        'Exchange Rate': report.exchangeRate ? Number(report.exchangeRate).toFixed(4) : 0,
                        'Interest Rate (CWT)': report.interestRateCWT ? Number(report.interestRateCWT).toFixed(4) : 0,
                        'Stuffing': report.stuffingCWT ? Number(report.stuffingCWT).toFixed(4) : 0,
                        'Inland Freight': report.inlandFrtStuffingBuffer ? Number(report.inlandFrtStuffingBuffer).toFixed(4) : 0,
                        'Bag Cost': report.bagCostCWT ? Number(report.bagCostCWT).toFixed(4) : 0,
                        'Cert/Analysis cost': report.certificateAnalysis ? report.certificateAnalysis.cost : '',
                        'Misc 1': report.missCostCWT1 ? report.missCostCWT1.toFixed(4) : 0,
                        'Misc 2': report.missCostCWT2 ? report.missCostCWT2.toFixed(4) : 0,
                        'Misc 3': report.missCostCWT3 ? report.missCostCWT3.toFixed(4) : 0,
                        'Total Cost': $scope.getTotalCost(report).toFixed(4),
                        'CAD/CWT': (report.contractSalesPriceCWTCAD - report.totalCost).toFixed(4),
                        'CAD NET/CWT': ''
                    };
                });
            }
        };

        $scope.exportData = () => {
            var newData = [];
            if ($scope.tab == 1) {
              if ($scope.searchForm.date === moment().format("YYYY-MM-DD")) {
                newData = $scope.exportSalesData();
              } else {
                spinnerService.show("html5spinner");
                httpService.getArchiveExcel($scope.token, $scope.searchForm)
                    .then(function(res) {
                        spinnerService.hide("html5spinner");
                        if (res.data.status === 200 && res.data.data) {
                            window.location.href = res.data.data.reportUrl;
                            return;
                        }
                        alert('Excel not present in archive.');
                    });
              }
            } else {

                if ($scope.purchaseList && $scope.purchaseList.length != 0) {
                    newData = $scope.purchaseList.map((report) => {
                        return {
                            'Contract': report.contractNumber,
                            'Date': moment(report.createdAt).format('YYYY-MM-DD'),
                            'Commodity': report.commodityId ? report.commodityId.commodityName : '',
                            'Grade': report.gradeId ? report.gradeId.gradeName : '',
                            'Shipment': moment(report.shipmentPeriodFrom).format('YYYY-MM-DD') + '/' + moment(report.shipmentPeriodTo).format('YYYY-MM-DD'),
                            'Total Contract Qty(lbs)': ($scope.getQuantityLbs(report)).toFixed(0),
                            'Shipped': ($scope.getShippedQuantityLbs(report.scale)).toFixed(0),
                            'Balance': ($scope.getQuantityLbs(report) - $scope.getShippedQuantityLbs(report.scale)).toFixed(0),
                            'Contract Price': report.price + '/' + report.priceUnit + ' ' + report.priceCurrency,
                            'Freight': report.freightRatePerMT ? report.freightRatePerMT.toFixed(4) : 0.00,
                            'RAL del/cwt': report.CWTDel ? Number(report.CWTDel).toFixed(4) : 0.00
                        };
                    });
                }
            }

            if (newData && newData.length) {
                var name = $scope.tab == 1 ? '_outstanging_sales' : '_outstanging_purchase';
                var obj = {
                    'data': newData,
                    'fileName': moment().format('MM/DD/YYYY') + name + '_report.xlsx'
                };

                var request = new XMLHttpRequest();
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

        };

    });
