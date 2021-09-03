angular
    .module('myApp.quotePdfCtrl', [])
    .controller('quotePdfCtrl', function($scope,
        spinnerService,
        quoteHttpService,
        $stateParams,
        httpService,
        $timeout,
        $state,
        imageUrl
    ) {
        $scope.quoteId = $stateParams.quoteId;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.imagePath = imageUrl;

        spinnerService.show("html5spinner");
        quoteHttpService
            .quoteDetail($scope.quoteId, $scope.token)
            .then((objS) => {
                spinnerService.hide("html5spinner");
                if (objS.data.status == 200) {
                    $scope.quote = objS.data.data;
                }
            }, (objE) => {
                spinnerService.hide("html5spinner");
                console.log(objE);
            });

        $scope.print = function(printSectionId) {
            $timeout(function() {
                var innerContents = document.getElementById(printSectionId).innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=800,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();

            }, 1000);

        };

    });