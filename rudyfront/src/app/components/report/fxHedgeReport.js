angular
    .module('myApp.fxHedgeReport', [])
    .controller('fxHedgeReportCtrl',
        function(
            $scope,
            $rootScope,
            reportHttpServices,
            spinnerService,
            commonService,
            apiUrl,
            $state,
            $sce
        ) {

            $scope.active = {
                page: 'fxHedge'
            };

            $scope.$on('access', (event, data) => {
                if (!data || !data.reports || !data.reports.fxHedge || !data.reports.fxHedge.view) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            var cdate = moment();
            var year = cdate.year();
            $scope.myForm = {
                year: (cdate.month() > 8 ? year : year - 1).toString()
            };

            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.cropYears = commonService.cropYears();
            $scope.formatAmount = function(amount, month, matchMonth) {
                var formattedText = amount < 0 ? ('<span style="color:red;">(' + Math.abs(amount) + ')</span>') : ('<span>' + amount + '</span>');
                var text = '';

                if (!month || !matchMonth) {
                    text = formattedText;
                } else {
                    text = month == matchMonth ? formattedText : ('<span>' + 0 + '</span>');
                }

                return $sce.trustAsHtml(text);
            };

            function initList() {

                reportHttpServices
                    .fxHedgeReport($scope.myForm.year, $scope.token)
                    .then(function(ObjS) {
                        if (ObjS.data.status == 200) {
                            $scope.fxContract = ObjS.data.data.fxConctract[0];
                            $scope.sales = ObjS.data.data.sales;
                            $scope.getTotalUSDLongShort();
                            $scope.getTotalAvg();
                        }
                        $scope.list = ObjS.data.status == 200 ? ObjS.data.data : [];
                        spinnerService.hide("html5spinner");
                    });
            }

            $scope.search = () => {
                initList();
            };

            initList();

            $scope.clear = () => {
                $scope.myForm = {
                    year: new Date().getFullYear().toString()
                };
                initList();
            };

            $scope.getTotalUSDLongShort = () => {
                function remaining(key) {
                    if ($scope.fxContract && $scope.fxContract.usd)
                        return $scope.sales[key] - $scope.fxContract.usd[key];
                    else return 0;
                }
                $scope.totalUSDShortLongValue = remaining('sep') + remaining('oct') + remaining('nov') + remaining('dec') + remaining('jan') + remaining('feb') + remaining('mar') + remaining('apr') + remaining('may') + remaining('jun') + remaining('jul') + remaining('aug');
                if ($scope.totalUSDShortLongValue) $scope.totalUSDShortLongValue = $scope.totalUSDShortLongValue.toFixed(4);
            };

            $scope.getTotalAvg = () => {
                function total(key) {
                    if ($scope.fxContract && $scope.fxContract.usd)
                        return $scope.fxContract.fxWeightedAverageRate[key];
                    else return 0;
                }
                $scope.avgRate = total('sep') + total('oct') + total('nov') + total('dec') + total('jan') + total('feb') + total('mar') + total('apr') + total('may') + total('jun') + total('jul') + total('aug');
                if ($scope.avgRate) $scope.avgRate = $scope.avgRate.toFixed(4);
                return $scope.avgRate;
            };

            $scope.exportToXl = () => {

                if (!$scope.fxContract || !$scope.fxContract.contract || $scope.fxContract.contract.length == 0) return;
                var newData = [];

                $scope.fxContract.contract.forEach((val) => {
                    newData.push({
                        "Encore Order # ": val.contractNumber,
                        "FX Hedge Rate ": val.strikeRate,
                        "SEPT ": val.month == 9 ? val.usdAmount.toFixed(4) : "0.0000",
                        "OCT ": val.month == 10 ? val.usdAmount.toFixed(4) : "0.0000",
                        "NOV ": val.month == 11 ? val.usdAmount.toFixed(4) : "0.0000",
                        "DEC ": val.month == 12 ? val.usdAmount.toFixed(4) : "0.0000",
                        "JAN ": val.month == 1 ? val.usdAmount.toFixed(4) : "0.0000",
                        "FEB ": val.month == 2 ? val.usdAmount.toFixed(4) : "0.0000",
                        "MAR ": val.month == 3 ? val.usdAmount.toFixed(4) : "0.0000",
                        "APR ": val.month == 4 ? val.usdAmount.toFixed(4) : "0.0000",
                        "May ": val.month == 5 ? val.usdAmount.toFixed(4) : "0.0000",
                        "JUN ": val.month == 6 ? val.usdAmount.toFixed(4) : "0.0000",
                        "JUL ": val.month == 7 ? val.usdAmount.toFixed(4) : "0.0000",
                        "AUG ": val.month == 8 ? val.usdAmount.toFixed(4) : "0.0000",
                        "Total ": val.totalValue.toFixed(4),
                        "SEPTEMBER ": val.sep.toFixed(4),
                        "OCTOBER ": val.oct.toFixed(4),
                        "NOVEMBER ": val.nov.toFixed(4),
                        "DECEMBER ": val.dec.toFixed(4),
                        "JANUARY ": val.jan.toFixed(4),
                        "FEBRUARY ": val.feb.toFixed(4),
                        "MARCH ": val.mar.toFixed(4),
                        "APRIL ": val.apr.toFixed(4),
                        "MAY ": val.may.toFixed(4),
                        "JUNE ": val.jun.toFixed(4),
                        "JULY ": val.jul.toFixed(4),
                        "AUGUST ": val.aug.toFixed(4)
                    });
                });

                newData.push({
                    "Encore Order # ": "",
                    "FX Hedge Rate ": "Total USD",
                    "SEPT ": $scope.fxContract.usd.sep.toFixed(4),
                    "OCT ": $scope.fxContract.usd.oct.toFixed(4),
                    "NOV ": $scope.fxContract.usd.nov.toFixed(4),
                    "DEC ": $scope.fxContract.usd.dec.toFixed(4),
                    "JAN ": $scope.fxContract.usd.jan.toFixed(4),
                    "FEB ": $scope.fxContract.usd.feb.toFixed(4),
                    "MAR ": $scope.fxContract.usd.mar.toFixed(4),
                    "APR ": $scope.fxContract.usd.apr.toFixed(4),
                    "May ": $scope.fxContract.usd.may.toFixed(4),
                    "JUN ": $scope.fxContract.usd.jun.toFixed(4),
                    "JUL ": $scope.fxContract.usd.jul.toFixed(4),
                    "AUG ": $scope.fxContract.usd.aug.toFixed(4),
                    "Total ": $scope.fxContract.totalUSD.toFixed(4),
                    "SEPTEMBER ": $scope.fxContract.totalAvgRate.sep.toFixed(4),
                    "OCTOBER ": $scope.fxContract.totalAvgRate.oct.toFixed(4),
                    "NOVEMBER ": $scope.fxContract.totalAvgRate.nov.toFixed(4),
                    "DECEMBER ": $scope.fxContract.totalAvgRate.dec.toFixed(4),
                    "JANUARY ": $scope.fxContract.totalAvgRate.jan.toFixed(4),
                    "FEBRUARY ": $scope.fxContract.totalAvgRate.feb.toFixed(4),
                    "MARCH ": $scope.fxContract.totalAvgRate.mar.toFixed(4),
                    "APRIL ": $scope.fxContract.totalAvgRate.apr.toFixed(4),
                    "MAY ": $scope.fxContract.totalAvgRate.may.toFixed(4),
                    "JUNE ": $scope.fxContract.totalAvgRate.jun.toFixed(4),
                    "JULY ": $scope.fxContract.totalAvgRate.jul.toFixed(4),
                    "AUGUST ": $scope.fxContract.totalAvgRate.aug.toFixed(4)
                });
                newData.push({
                    "Encore Order # ": "",
                    "FX Hedge Rate ": "Avg Rate",
                    "SEPT ": $scope.fxContract.totalAvgRate.sep.toFixed(4),
                    "OCT ": $scope.fxContract.totalAvgRate.oct.toFixed(4),
                    "NOV ": $scope.fxContract.totalAvgRate.nov.toFixed(4),
                    "DEC ": $scope.fxContract.totalAvgRate.dec.toFixed(4),
                    "JAN ": $scope.fxContract.totalAvgRate.jan.toFixed(4),
                    "FEB ": $scope.fxContract.totalAvgRate.feb.toFixed(4),
                    "MAR ": $scope.fxContract.totalAvgRate.mar.toFixed(4),
                    "APR ": $scope.fxContract.totalAvgRate.apr.toFixed(4),
                    "May ": $scope.fxContract.totalAvgRate.may.toFixed(4),
                    "JUN ": $scope.fxContract.totalAvgRate.jun.toFixed(4),
                    "JUL ": $scope.fxContract.totalAvgRate.jul.toFixed(4),
                    "AUG ": $scope.fxContract.totalAvgRate.aug.toFixed(4),
                    "Total ": "",
                    "SEPTEMBER ": "",
                    "OCTOBER ": "",
                    "NOVEMBER ": "",
                    "DECEMBER ": "",
                    "JANUARY ": "",
                    "FEBRUARY ": "",
                    "MARCH ": "",
                    "APRIL ": "",
                    "MAY ": "",
                    "JUNE ": "",
                    "JULY ": "",
                    "AUGUST ": ""
                });
                newData.push({
                    "Encore Order # ": "",
                    "FX Hedge Rate ": "FX Weighted Average",
                    "SEPT ": $scope.fxContract.fxWeightedAverageRate.sep.toFixed(4),
                    "OCT ": $scope.fxContract.fxWeightedAverageRate.oct.toFixed(4),
                    "NOV ": $scope.fxContract.fxWeightedAverageRate.nov.toFixed(4),
                    "DEC ": $scope.fxContract.fxWeightedAverageRate.dec.toFixed(4),
                    "JAN ": $scope.fxContract.fxWeightedAverageRate.jan.toFixed(4),
                    "FEB ": $scope.fxContract.fxWeightedAverageRate.feb.toFixed(4),
                    "MAR ": $scope.fxContract.fxWeightedAverageRate.mar.toFixed(4),
                    "APR ": $scope.fxContract.fxWeightedAverageRate.apr.toFixed(4),
                    "May ": $scope.fxContract.fxWeightedAverageRate.may.toFixed(4),
                    "JUN ": $scope.fxContract.fxWeightedAverageRate.jun.toFixed(4),
                    "JUL ": $scope.fxContract.fxWeightedAverageRate.jul.toFixed(4),
                    "AUG ": $scope.fxContract.fxWeightedAverageRate.aug.toFixed(4),
                    "Total ": "",
                    "SEPTEMBER": "",
                    "OCTOBER ": "",
                    "NOVEMBER ": "",
                    "DECEMBER ": "",
                    "JANUARY ": "",
                    "FEBRUARY ": "",
                    "MARCH ": "",
                    "APRIL ": "",
                    "MAY ": "",
                    "JUNE ": "",
                    "JULY ": "",
                    "AUGUST ": ""
                });
                newData.push({
                    "Encore Order # ": "",
                    "FX Hedge Rate ": "Total Hedge",
                    "SEPT ": $scope.fxContract.totalUSD.toFixed(4),
                    "OCT ": "AVG RATE",
                    "NOV ": $scope.avgRate,
                    "DEC ": "",
                    "JAN ": "",
                    "FEB ": "",
                    "MAR ": "",
                    "APR ": "",
                    "May ": "",
                    "JUN ": "",
                    "JUL ": "",
                    "AUG ": "",
                    "Total ": "",
                    "SEPTEMBER ": "",
                    "OCTOBER ": "",
                    "NOVEMBER ": "",
                    "DECEMBER ": "",
                    "JANUARY ": "",
                    "FEBRUARY ": "",
                    "MARCH ": "",
                    "APRIL ": "",
                    "MAY ": "",
                    "JUNE ": "",
                    "JULY ": "",
                    "AUGUST ": ""
                });
                newData.push({
                    "Encore Order # ": "",
                    "FX Hedge Rate ": "FX Position by Month (short/long)",
                    "SEPT ": ($scope.sales.sep - $scope.fxContract.usd.sep).toFixed(4),
                    "OCT ": ($scope.sales.oct - $scope.fxContract.usd.oct).toFixed(4),
                    "NOV ": ($scope.sales.nov - $scope.fxContract.usd.nov).toFixed(4),
                    "DEC ": ($scope.sales.dec - $scope.fxContract.usd.dec).toFixed(4),
                    "JAN ": ($scope.sales.jan - $scope.fxContract.usd.jan).toFixed(4),
                    "FEB ": ($scope.sales.feb - $scope.fxContract.usd.feb).toFixed(4),
                    "MAR ": ($scope.sales.mar - $scope.fxContract.usd.mar).toFixed(4),
                    "APR ": ($scope.sales.apr - $scope.fxContract.usd.apr).toFixed(4),
                    "May ": ($scope.sales.may - $scope.fxContract.usd.may).toFixed(4),
                    "JUN ": ($scope.sales.jun - $scope.fxContract.usd.jun).toFixed(4),
                    "JUL ": ($scope.sales.jul - $scope.fxContract.usd.jul).toFixed(4),
                    "AUG ": ($scope.sales.aug - $scope.fxContract.usd.aug).toFixed(4),
                    "Total ": "",
                    "SEPTEMBER ": "",
                    "OCTOBER ": "",
                    "NOVEMBER ": "",
                    "DECEMBER ": "",
                    "JANUARY ": "",
                    "FEBRUARY ": "",
                    "MARCH ": "",
                    "APRIL ": "",
                    "MAY ": "",
                    "JUNE ": "",
                    "JULY ": "",
                    "AUGUST ": ""
                });
                newData.push({
                    "Encore Order # ": "",
                    "FX Hedge Rate ": "TL USD Long/Short",
                    "SEPT ": $scope.totalUSDShortLongValue,
                    "OCT ": "",
                    "NOV ": "",
                    "DEC ": "",
                    "JAN ": "",
                    "FEB ": "",
                    "MAR ": "",
                    "APR ": "",
                    "May ": "",
                    "JUN ": "",
                    "JUL ": "",
                    "AUG ": "",
                    "Total ": "",
                    "SEPTEMBER ": "",
                    "OCTOBER ": "",
                    "NOVEMBER ": "",
                    "DECEMBER ": "",
                    "JANUARY ": "",
                    "FEBRUARY ": "",
                    "MARCH ": "",
                    "APRIL ": "",
                    "MAY ": "",
                    "JUNE ": "",
                    "JULY ": "",
                    "AUGUST ": ""
                });
                var obj = {
                    'data': newData,
                    'fileName': moment().format('DD/MM/YYYY') + '_fx_hedge_report.xlsx'
                };

                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'export', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
                request.onload = function(e) {
                    if (this.status === 200) {
                        var a = document.createElement("a");
                        a.href = window.URL.createObjectURL(this.response);
                        a.download = obj.fileName;
                        document.body.appendChild(a);
                        a.click();
                    }
                };
                request.send(JSON.stringify(obj));
            };
        });
