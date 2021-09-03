angular.module('myApp.scaleTicketPDF', [])
    .controller('scaleTicketPDFCtrl', function($scope, wordService, scaleTicketHttpServices, imageUrl, $rootScope, httpService, $state, $stateParams, $timeout, spinnerService) {


        $scope.$on('access', (event, data) => {
            if (!data.truckScale.incoming.view && !data.truckScale.outgoing.view && !data.truckScale.incomingInventory.view && !data.truckScale.outgoingInventory.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'scaleTicket'
        };
        $scope.imagePath = imageUrl;
        $scope.myForm = {};
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.ticketNumber = $stateParams.tickertNo;
        $scope.showKabuliSize = false;
        var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function inWords(num) {
            if ((num = num.toString()).length > 9) return 'overflow';
            n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
            if (!n) return;
            var str = '';
            str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
            str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Hundred ' : '';
            str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
            str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
            str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Kgs ' : '';
            return str;
        }
        $scope.token = JSON.parse(localStorage.getItem('token'));
        scaleTicketHttpServices.getScaleTicketDetails($scope.ticketNumber, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.scaleTicketDetails = res.data.data;
                    if ($scope.scaleTicketDetails.commodityId.commodityName == 'Kabuli Chick Peas') {
                        $scope.showKabuliSize = true;
                    } else {
                        $scope.showKabuliSize = false;
                    }


                    if ($scope.scaleTicketDetails.buyerId) {
                        $scope.scaleTicketDetails.growerFullName = $scope.scaleTicketDetails.buyerId.businessName;
                    }
                    if ($scope.scaleTicketDetails.displayOnTicket) {
                        if ($scope.scaleTicketDetails.displayOnTicket == 'Grower Name') {
                            $scope.scaleTicketDetails.growerFullName = $scope.scaleTicketDetails.growerId.firstName + ' ' + $scope.scaleTicketDetails.growerId.lastName;
                        } else {
                            $scope.scaleTicketDetails.growerFullName = $scope.scaleTicketDetails.growerId.farmName;
                        }
                    }

                    // if ($scope.scaleTicketDetails.contractType == 'Production Contract') {
                    //     $scope.scaleTicketDetails.growerFullName = $scope.scaleTicketDetails.growerId.farmName || $scope.scaleTicketDetails.growerId.firstName + ' ' + $scope.scaleTicketDetails.growerId.lastName;
                    // }
                    if ($scope.scaleTicketDetails.contractExtra && $scope.scaleTicketDetails.ticketType == 'Outgoing') {
                        $scope.scaleTicketDetails.contractValue = $scope.scaleTicketDetails.contractExtra;
                    }

                    var net = (res.data.data.netWeight).toFixed(0);
                    var unload = (res.data.data.unloadWeidht).toFixed(0);



                    $scope.netWeightInWord = inWords(net); //wordService.convert(net, 'kg');
                    $scope.unloadWeidhtInWord = inWords(unload); //wordService.convert(unload, 'kg');
                    if ($scope.scaleTicketDetails.receiptType == "Special Bin Elevator Receipt") {
                        $scope.specialImg = "/assets/images/cancel-music.png";
                    } else if ($scope.scaleTicketDetails.receiptType == "Interim Primary Elevator Receipt") {
                        $scope.interimImg = "/assets/images/cancel-music.png";
                    } else if ($scope.scaleTicketDetails.receiptType == "Primary Elevator Receipt") {
                        $scope.primaryImg = "/assets/images/cancel-music.png";
                    }else if ($scope.scaleTicketDetails.receiptType == "Non CGA Grain") {
                        $scope.nonCgaImg = "/assets/images/cancel-music.png";
                    }else if ($scope.scaleTicketDetails.receiptType == "Non Producer Purchase") {
                        $scope.nonProducerImg = "/assets/images/cancel-music.png"; 
                    }
                    if ($scope.scaleTicketDetails.commodityId.commodityName == 'Small Green Lentils (Eston)' || $scope.scaleTicketDetails.commodityId.commodityName == 'Richlea Lentils' || $scope.scaleTicketDetails.commodityId.commodityName == 'Large Green Lentils' || $scope.scaleTicketDetails.commodityId.commodityName == 'Large Green Lentils (Laird type)' || $scope.scaleTicketDetails.commodityId.commodityName == 'Crimson Lentils') {
                        $scope.showAllow = true;
                    } else {
                        $scope.showAllow = false;
                    }
                }
            },
            function(error) {
                //console.log(JSON.stringify(error));
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

        $scope.roundOff = (value) => {
            if (value) {
                return value.toFixed(3);
            } else return 0.000;
        };
    });