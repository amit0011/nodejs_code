angular.module('myApp.confirmProductionContract', [])
    .controller('confirmProductionContractCtrl', function($scope,
        httpService,
        $state,
        $stateParams,
        $timeout,
        spinnerService,
        imageUrl) {
        $scope.active = {
            page: 'productionContract'
        };
        var doc = new jsPDF();
        var specialElementHandlers = {
            '#editor': function(element, renderer) {
                return true;
            }
        };
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.myForm = {};
        $scope.sampleArr = [];
        $scope.shipmentArr = [];
        $scope.deliveryArr = [];
        $scope.myForm.landLoaction = [{}];
        $scope.commodityTypePlus = true;
        $scope.commodityTypeInput = false;
        console.log($stateParams.growerId);
        $scope.imagePath = imageUrl;
        $scope.growerId = $stateParams.growerId;
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.getGrade = function(id) {
            httpService.getGrade('', id, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.grades = res.data.data;
                        console.log($scope.grades);
                    } else {
                        console.log('err', JSON.stringify(res.data));
                    }
                },
                function(error) {
                    console.log(JSON.stringify(error));
                });
            $timeout(function() {
                $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                    return hero._id == id;
                });
            }, 300);
            // $scope.grades = $scope.commodityGrades[0].commodityGrade;
        };
        $scope.productionContract = JSON.parse(localStorage.getItem('ProductionContract'));
        httpService.getProductionContractByContractNo($stateParams.contractNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.contractDetailsByNo = res.data.data;
                    $scope.myForm = $scope.contractDetailsByNo;
                    if ($scope.contractDetailsByNo.personFarmType == 'Person') {
                        $scope.myForm.growerFullName = $scope.contractDetailsByNo.growerId.firstName + ' ' + $scope.contractDetailsByNo.growerId.lastName;
                    } else {
                        $scope.myForm.growerFullName = $scope.contractDetailsByNo.growerId.farmName;
                    }
                    if (res.data.data.createdBy) {
                        $scope.myForm.signature = $scope.contractDetailsByNo.createdBy.signature;
                    }
                    if ($scope.myForm.priceOption == 'Fixed') {
                        $scope.myForm.showBox1 = 'fa fa-check';
                        $scope.myForm.showBox2 = 'fa fa-square boxCls';
                        $scope.myForm.showBox3 = 'fa fa-square boxCls';
                        if ($scope.myForm.fixedAdditionalProduction == 'Agreed') {
                            $scope.myForm.showBox11 = 'fa fa-check';
                            $scope.myForm.showBox12 = 'fa fa-square boxCls';
                        } else {
                            $scope.myForm.showBox12 = 'fa fa-check';
                            $scope.myForm.showBox11 = 'fa fa-square boxCls';
                        }
                    } else
                    if ($scope.myForm.priceOption == 'Agreed') {
                        $scope.myForm.showBox2 = 'fa fa-check';
                        $scope.myForm.showBox1 = 'fa fa-square boxCls';
                        $scope.myForm.showBox3 = 'fa fa-square boxCls';
                        $scope.myForm.showBox11 = 'fa fa-square boxCls';
                        $scope.myForm.showBox12 = 'fa fa-square boxCls';
                    } else
                    if ($scope.myForm.priceOption == 'Pooled') {
                        $scope.myForm.showBox3 = 'fa fa-check';
                        $scope.myForm.showBox1 = 'fa fa-square boxCls';
                        $scope.myForm.showBox2 = 'fa fa-square boxCls';
                        $scope.myForm.showBox11 = 'fa fa-square boxCls';
                        $scope.myForm.showBox12 = 'fa fa-square boxCls';
                    } else {
                        $scope.myForm.showBox3 = 'fa fa-square boxCls';
                        $scope.myForm.showBox1 = 'fa fa-square boxCls';
                        $scope.myForm.showBox2 = 'fa fa-square boxCls';
                        $scope.myForm.showBox11 = 'fa fa-square boxCls';
                        $scope.myForm.showBox12 = 'fa fa-square boxCls';
                    }
                    $scope.myForm.contractReturnDate = moment($scope.contractDetailsByNo.contractReturnDate).format('YYYY-MM-DD');
                    $scope.myForm.deliveryDateFrom = moment($scope.contractDetailsByNo.deliveryDateFrom).format('YYYY-MM-DD');
                    $scope.myForm.deliveryDateTo = moment($scope.contractDetailsByNo.deliveryDateTo).format('YYYY-MM-DD');
                    $scope.myForm.landLocation = $scope.contractDetailsByNo.landLocation;
                    $scope.landLoaction = $scope.contractDetailsByNo.landLocation;
                    $scope.myForm.commodityName = $scope.contractDetailsByNo.commodityId.commodityName;
                    $scope.myForm.commodityId = $scope.contractDetailsByNo.commodityId._id;
                    $scope.myForm.contractNumber = $scope.contractDetailsByNo.contractNumber;
                    console.log('contractDetailsByNo====', JSON.stringify($scope.myForm.contractNumber));
                    $scope.getGrade($scope.myForm.commodityId);
                    $scope.myForm.gradeName = $scope.contractDetailsByNo.gradeId.gradeName;
                    $scope.myForm.gradeId = $scope.contractDetailsByNo.gradeId._id;
                } else {
                    // swal("Error", res.data.userMessage, "error");
                    console.log('err', JSON.stringify(res.data));
                }
            },
            function(error) {
                console.log(JSON.stringify(error));
            });
        //$scope.myForm = $scope.productionContract;
        // $scope.myForm.landLoaction = JSON.parse(localStorage.getItem('landLoaction'));
        // $scope.landLoaction = JSON.parse(localStorage.getItem('landLoaction'));
        // console.log($scope.landLoaction);
        httpService.getGrowerDetails($scope.growerId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.growerDetails = res.data.data.grower;
                    // console.log('ok', JSON.stringify($scope.growerDetails));
                } else {
                    swal("Error", res.data.userMessage, "error");
                    console.log('err', JSON.stringify(res.data));
                }
            },
            function(error) {
                console.log(JSON.stringify(error));
            });
        $scope.print = function(printSectionId) {
            // var html = document.getElementById("printSectionId").innerHTML;
            // var data = {
            // 	html: html,
            // 	name: $scope.myForm.growerFullName,
            // 	email: $scope.contractDetailsByNo.growerId.email
            // };
            // spinnerService.show("html5spinner");
            // httpService.sendContract(data, $scope.token).then(function(res) {
            // 		if (res.data.status == 200) {
            // 			spinnerService.hide("html5spinner");
            // 			$scope.growerDetails = res.data.data.grower;
            // 			// console.log('ok', JSON.stringify($scope.growerDetails));
            // 		} else {
            // 			swal("Error", res.data.userMessage, "error");
            // 			console.log('err', JSON.stringify(res.data));
            // 		}
            // 	},
            // 	function(error) {
            // 		console.log(JSON.stringify(error)); 
            // 	});
            $timeout(function() {
                var innerContents = document.getElementById("printSectionId").innerHTML;
                // console.log(innerContents);
                var popupWinindow = window.open('', '_blank', 'width=1000,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /> <link rel="stylesheet" type="text/css" href="${$scope.url}/assets/font-awesome/css/font-awesome.css" /> <link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();
                $state.go('growerDetails', {
                    id: $scope.growerId || $scope.myForm.growerId._id
                });
            }, 1000);

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