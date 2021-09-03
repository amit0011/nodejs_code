angular
    .module('myApp.loadSheetList', [])
    .controller('loadSheetListCtrl', function($scope, $stateParams, spinnerService, tradePurchaseScaleHttpServices) {

        $scope.contractNumber = $stateParams.contractNumber;
        $scope.seqNo = $stateParams.seqNo;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.loadSheets = [];
        $scope.preFix = "TP-";

        spinnerService.show("html5spinner");
        tradePurchaseScaleHttpServices.loadSheetsByContract($stateParams, $scope.token).then(function(res) {
            $scope.loadSheets = [];
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
                $scope.loadSheets = res.data.data;
            }
        });

        $scope.getValue = (list, type) => {
            $scope.value = list.filter((val) => {
                return val.analysisId.analysisName == type;
            });
            if ($scope.value && $scope.value.length && $scope.value[0].weight ){
                return $scope.value[0].weight.toFixed(3); 
            } 
            else return '--';
        };

        $scope.getClass = (data) => {
            if (data.void) return "clsRed";
            else return "";
        };

    });