angular.module('myApp.salesContractPDF', [])
    .controller('salesContractPDFCtrl', function($scope, salesContractHttpServices, httpService, $state, $stateParams, $timeout, spinnerService, imageUrl) {
        $scope.active = {
            page: 'salesContract'
        };
        $scope.myForm = {};
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.contractNumber = $stateParams.contractNumber;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.userProfile = JSON.parse(localStorage.getItem('userProfile'));
        $scope.imagePath = imageUrl;
        spinnerService.show("html5spinner");
        salesContractHttpServices.getsalesContractDetails($stateParams.contractNumber, $scope.token, '').then(function(res) {
                if (res.data.status == 200) {
                    $scope.salesContractDetails = res.data.data;
                } else {
                    console.log('err', JSON.stringify(res.data));
                }
                spinnerService.hide("html5spinner");
            },
            function(error) {
                console.log(JSON.stringify(error));
            });
        $scope.print = function(printSectionId) {
            $timeout(function() {
                var innerContents = document.getElementById("printSectionId").innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=800,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();

            }, 1000);

        };
    });