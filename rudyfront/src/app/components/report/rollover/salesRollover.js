angular.module('myApp.salesRollover', [])
    .controller('salesRolloverCtrl', function($scope,
        spinnerService,
        $rootScope,
        rolloverHttpServices,
        $timeout,
        apiUrl,
        $stateParams,
        httpService,
        $state
    ) {
        $scope.$on('access', (event, data) => {
            if (!data || !data.reports || !data.reports.targetPrice || !data.reports.targetPrice.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'rollover'
        };
        $scope.qtyLimit = 1;

        $scope.page = 1;
        $scope.myForm = {};
        $scope.token = JSON.parse(localStorage.getItem('token'));

        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });

        $scope.getRolloverList = (page) => {
            spinnerService.show("html5spinner");
            $scope.page = page || $scope.page;
            
            rolloverHttpServices.getSalesRolloverList($scope.myForm, $scope.token).then((objS) => {
                if (objS.data.status == 200) {
                    $scope.list = objS.data.data;
                }
                spinnerService.hide("html5spinner");
            });
        };
        
        $scope.inventoryGrades = {};
        $scope.loadInventoryGrade = function (id) {
            httpService.getInventoryGrade('', id, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.inventoryGrade = $scope.inventoryGrades[id] = res.data.data;                    
                }
            });
        };

        $scope.showRolloverPopup = (contract) => { 
            var commodityId = contract.commodityId._id;

            if (!$scope.inventoryGrades[commodityId]) {
                $scope.loadInventoryGrade(commodityId);
            } else {
                $scope.inventoryGrade = $scope.inventoryGrades[commodityId];
            }

            $(".rollover_popup").fadeIn();
            $(".popup_overlay").fadeIn();
            
            $scope.rolloverForm.contract_id = contract._id;
            $scope.rolloverContract = contract;
            $scope.rolloverForm.quantityLbs = Math.floor(contract.quantityLbs - contract.delQty);
        };

        $scope.createRollover = (valid) => {
            $scope.submitted = true;
            if (valid) {
                
                httpService.createSalesContractRollover($scope.rolloverForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.getRolloverList();
                        swal("Successful!", "Rollover for sales contract created.", "success");
                    } else {
                        swal("Unsuccessful", res.data.userMessage, "error");    
                    }
                },
                function(error) {
                    swal("Unsuccessful", "Was unable to create rollover sales contract", "error");
                });

                $(".rollover_popup").fadeOut();
                $(".popup_overlay").fadeOut();
            }
        };
        
        $scope.closepop = function() {
            $(".popup_overlay").fadeOut();
            $(".rollover_popup").fadeOut();
        };

        $(".popup_overlay , .close").click(function() {
            $(".popup_overlay").fadeOut();
            $(".rollover_popup").fadeOut();
        });

        $scope.clear = () => {
            $scope.myForm = {};
            $scope.getRolloverList(1);
        };

        $scope.getRolloverList();
    });