angular.module('myApp.tradeScaleTicketPdf', [])
    .controller('tradeScaleTicketPdfCtrl', function($scope, imageUrl, $state, tradePurchaseScaleHttpServices, $rootScope, $stateParams, $timeout) {


        $scope.$on('access', (event, data) => {
            if (!data || !data.truckScale || !data.truckScale.tradePurchase || !data.truckScale.tradePurchase.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });



        $scope.imagePath = imageUrl;
        $scope.scaleId = $stateParams.scaleId;

        var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function inWords(num) {
            if ((num = num.toString()).length > 9) return 'overflow';
            n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return;
            var str = '';
            str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
            str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
            str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
            str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
            str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Kgs ' : '';
            return str;
        }

        $scope.token = JSON.parse(localStorage.getItem('token'));

        tradePurchaseScaleHttpServices.getTradeScalePdf($scope.scaleId, $scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.scaleTicketDetails = res.data.data;
                var net = (res.data.data.netWeight).toFixed(0);
                var unload = (res.data.data.unloadWeidht).toFixed(0);
                $scope.netWeightInWord = inWords(net);
                $scope.unloadWeidhtInWord = inWords(unload);
            }
        });

        $scope.print = function(printSectionId) {
            if ($scope.scaleTicketDetails.sizeKabuli.length == 0) {
                $("#sizekabuli").remove();
            }
            $timeout(function() {
                var innerContents = document.getElementById("printSectionId").innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=800,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();

            }, 1000);

        };
    });