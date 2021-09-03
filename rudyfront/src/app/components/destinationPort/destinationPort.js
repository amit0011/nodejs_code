angular.module('myApp.destinationPort', [])
    .controller('destinationPortCtrl', function($scope, httpService, $state) {
        $scope.active = {
            page: 'destinationPort'
        };
        $scope.myForm = {};
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.init = function() {
            httpService.getCommodityType($scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.commodityList = res.data.data;
                        console.log('ok', JSON.stringify(res.data.data.length));
                    } else {
                        console.log('err', JSON.stringify(res.data));
                    }
                },
                function(error) {
                    console.log(JSON.stringify(error));
                });
        };

        $scope.save = function() {
            console.log('$scope.myForm--', $scope.myForm);
            httpService.addCommodityType($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        console.log('ok', JSON.stringify($scope.commodityList));
                        $scope.init();
                        $scope.closepop();
                    } else {
                        console.log('err', JSON.stringify(res.data));
                    }
                },
                function(error) {
                    console.log(JSON.stringify(error));
                });
        };

        $scope.toggleAll = function() {
            console.log('toggleAll');
            var toggleStatus = !$scope.isAllSelected;
            angular.forEach($scope.options, function(itm) {
                itm.selected = toggleStatus;
            });
        };

        $scope.openPop = function(data) {
            console.log('caaaaaa');
            $(".add_coomm").fadeIn();
            $(".popup_overlay").fadeIn();
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