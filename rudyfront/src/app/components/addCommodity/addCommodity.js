angular
    .module('myApp.addCommodity', [])
    .controller('addCommodityCtrl', function($scope, httpService, $state, $stateParams) {
        $scope.active = {
            page: 'commodity'
        };
        $scope.myForm = {};
        $scope.sampleArr = [];
        $scope.shipmentArr = [];
        $scope.deliveryArr = [];
        $scope.commodityTypePlus = true;
        $scope.commodityTypeInput = false;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.getCommodityType = function() {
            httpService.getCommodityType($scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.commodityList = res.data.data;
                    $scope.initAnalysis();
                }
            });
        };

        $scope.initAnalysis = function() {
            httpService.getAnalysis($scope.token).then(function(res) {
                $scope.analysisList = res.data.status == 20 ? res.data.data : [];
            });
        };

        $scope.plusCommodityType = function() {
            $scope.commodityTypePlus = false;
            $scope.commodityTypeInput = true;
        };
        $scope.saveCommodityType = function() {
            if (!$scope.myForm.commodityTypeName) {
                swal("Here's a message!", 'Please fill commodity type name first.', "error");
            } else {
                var data = {
                    'commodityTypeName': $scope.myForm.commodityTypeName
                };
                httpService.addCommodityType(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.getCommodityType();
                        $scope.commodityTypePlus = true;
                        $scope.commodityTypeInput = false;
                    }
                });
            }
        };


        $scope.saveGrade = function() {
            $scope.closepop();
        };

        $scope.sampleCheckBox = function(id) {
            if ($scope.sampleArr.indexOf(id) > -1) {
                $scope.sampleArr.splice(id, 1);
            } else {
                $scope.sampleArr.push(id);
            }
        };
        $scope.deliveryCheckBox = function(id) {
            if ($scope.deliveryArr.indexOf(id) > -1) {
                $scope.deliveryArr.splice(id, 1);
            } else {
                $scope.deliveryArr.push(id);
            }
        };
        $scope.shipmentCheckBox = function(id) {
            if ($scope.shipmentArr.indexOf(id) > -1) {
                $scope.shipmentArr.splice(id, 1);
            } else {
                $scope.shipmentArr.push(id);
            }
        };

        $scope.save = function() {
            $scope.myForm.commodityWeightType = 'Bushels';
            $scope.myForm.commoditySampleAnalysis = $scope.sampleArr;
            $scope.myForm.commodityShipmentAnalysis = $scope.shipmentArr;
            $scope.myForm.commodityDeliveryAnalysis = $scope.deliveryArr;
            httpService.addCommodity($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $state.go('commodity');
                } else {
                    swal("Here's a message!", res.data.userMessage, "error");
                }
            });

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