angular.module('myApp.tradePurchaseScale', [])
    .controller('tradePurchaseScaleCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            tradePurchaseScaleHttpServices,
            httpService,
            $state,
            $stateParams,
            $timeout,
            spinnerService,
            $location,
            sudAdminHttpService,
            binHttpService,
            apiUrl,
            $rootScope,
            imageUrl,
            commonService) {


            $scope.$on('access', (event, data) => {
                if (!data || !data.truckScale || !data.truckScale.tradePurchase || (!data.truckScale.tradePurchase.viewMenu && !data.truckScale.tradePurchase.add && !data.truckScale.tradePurchase.edit)) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });


            var prev_filter = localStorage.getItem('trade_purchase_scale_filter');
            $scope.myForm = prev_filter ? JSON.parse(prev_filter) : {};

            $scope.active = {
                page: 'tradePurchaseScale'
            };


            var pageNo = localStorage.getItem('trade_purchase_scale_pageNo') || 1;
            $scope.token = JSON.parse(localStorage.getItem('token'));


            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            });


            $scope.getClass = (data) => {
                var Class = 'clsblue';
                if (data.void) {
                    Class = 'clsRed';
                } else if (data.tareWeight != 0 && data.analysisCompleted == false) {
                    Class = 'clsblue';
                } else if (data.tareWeight == 0 && data.analysisCompleted == false) {
                    Class = 'clsRed';
                } else if (data.analysisCompleted) {
                    Class = 'clsblack';
                }
                return Class;
            };


            function secondsToHms(d) {
                d = Number(d);
                var h = Math.floor(d / 3600);
                var m = Math.floor(d % 3600 / 60);
                var s = Math.floor(d % 3600 % 60);

                var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
                var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes ") : "";
                return hDisplay + mDisplay;
            }




            $scope.DoCtrlPagingAct = function(text, page) {

                if (page) localStorage.setItem("trade_purchase_scale_pageNo", page);
                else page = localStorage.getItem("trade_purchase_scale_pageNo") || 1;
                if (text == 'clear') {
                    localStorage.removeItem("trade_purchase_scale_filter");
                    $scope.myForm = {
                        limit: '10'
                    };
                }
                $scope.search(page);
            };
            $scope.search = function(page) {
                spinnerService.show("html5spinner");
                localStorage.setItem("trade_purchase_scale_filter", JSON.stringify($scope.myForm));

                var searchParam = Object.assign({}, $scope.myForm);
                searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
                searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

                tradePurchaseScaleHttpServices.searchTradePurchaseScale(searchParam, page, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.scaleTicketList = res.data.data.docs;
                        $scope.page = res.data.data.page;
                        $scope.totalPages = res.data.data.total;
                        for (var i = 0; i < $scope.scaleTicketList.length; i++) {
                            $scope.scaleTicketList[i].status = $scope.scaleTicketList[i].status.toString();
                            $scope.scaleTicketList[i].startDate = new Date($scope.scaleTicketList[i].inTime);
                            $scope.scaleTicketList[i].endDate = new Date($scope.scaleTicketList[i].exitTime);
                            $scope.scaleTicketList[i].seconds = ($scope.scaleTicketList[i].endDate.getTime() - $scope.scaleTicketList[i].startDate.getTime()) / 1000;
                            $scope.scaleTicketList[i].unloadTime = secondsToHms($scope.scaleTicketList[i].seconds);
                        }
                    }
                    spinnerService.hide("html5spinner");
                });
            };



            $scope.unlockScaleTicket = (result) => {
                swal({
                        title: "Are you sure?",
                        text: "You want to unlock this Scale Ticket!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, unlock it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            spinnerService.show("html5spinner");

                            tradePurchaseScaleHttpServices.unlockTicket(result._id, $scope.token).then(function(res) {
                                    spinnerService.hide("html5spinner");
                                    if (res.data.status == 200) {
                                        result.analysisCompleted = false;
                                        swal("Unlocked!", "Scale ticket is unlocked.", "success");
                                    }
                                },
                                function(error) {
                                    spinnerService.hide("html5spinner");
                                });
                        } else {
                            swal("Cancelled", "Your Scale Ticket is safe :)", "error");
                        }
                    });

            };



            $scope.exportSheet = () => {
                var newData = $scope.scaleTicketList.map((scale) => {

                    return {
                        'Date': moment(scale.date).format('MM/DD/YYYY'),
                        'Ticket Number': scale.ticketNumber,
                        'Bin': scale.binNumber,
                        'Trucking Company': scale.truckingCompany ? scale.truckingCompany.truckerName : '',
                        'Gross': scale.grossWeightMT || 0,
                        'Tare': scale.tareWeightMT || 0,
                        'Net': scale.unloadWeidhtMT,
                        'Contrat Number': scale.contractNumber || '',
                        'Buyer Name': scale.buyerId && scale.buyerId.businessName ? scale.buyerId.businessName : '',
                        'Commodity': scale.commodityId ? scale.commodityId.commodityName : '',
                        'Grade': scale.gradeId ? scale.gradeId.gradeName : '',
                        'Code': scale.commodityId ? scale.commodityId.commodityCode : '',
                        'Created At': moment(scale.createdAt).format('MM/DD/YYYY')
                    };


                });
                var obj = {
                    'data': newData,
                    'fileName': moment().format('MM/DD/YYYY') + 'TradePurchase' + ' ticket.xlsx'
                };
                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'export', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
                request.onload = function(e) {
                    if (this.status === 200) {
                        var file = window.URL.createObjectURL(this.response);
                        var a = document.createElement("a");
                        a.href = file;
                        a.download = obj.fileName;
                        document.body.appendChild(a);
                        a.click();
                    }
                };
                request.send(JSON.stringify(obj));
            };

            $scope.exportAllData = (filter) => {

                var obj = {
                    'filter': filter ? true : false,
                    'filterBy': $scope.myForm,
                    'fileName': moment().format('MM/DD/YYYY') + 'TradePurchase' + ' ticket.xlsx'
                };
                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'tradePurchaseScale/exportData', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
                request.onload = function(e) {
                    if (this.status === 200) {
                        var file = window.URL.createObjectURL(this.response);
                        var a = document.createElement("a");
                        a.href = file;
                        a.download = obj.fileName;
                        document.body.appendChild(a);
                        a.click();
                    }
                };
                request.send(JSON.stringify(obj));
            };

            $scope.selectedFile = (input) => {
                $scope.file = input.files[0];
                if ($scope.file.name.split('.').pop() !== 'pdf') {
                    $scope.errMsg = "Invalid pdf file";
                    $scope.file = '';
                }
            };

            $scope.uploadPdf = () => {
                if ($scope.file) {
                    spinnerService.show("html5spinner");
                    var data = {
                        file: $scope.file
                    };
                    tradePurchaseScaleHttpServices.uploadPdf(data, $scope.selectedScale._id, $scope.token).then(function(res) {
                            spinnerService.hide("html5spinner");
                            if (res.data.status == 200) {
                                $scope.selectedScale.contractIsSigned = true;
                                $scope.closepop();
                                swal("Success", "Pdf uploaded successfully.", "success");
                            } else {
                                $scope.errMsg = res.data.userMessage;
                            }
                        },
                        function(error) {
                            spinnerService.hide("html5spinner");
                        });
                } else {
                    $scope.errMsg = $scope.errMsg ? $scope.errMsg : "Please select file";
                }
            };

            $scope.deleteSignedContract = (data) => {
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this signed contract!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            spinnerService.show("html5spinner");
                            tradePurchaseScaleHttpServices.removeSignedContract(data._id, $scope.token).then(function(res) {
                                    spinnerService.hide("html5spinner");
                                    if (res.data.status == 200) {
                                        data.contractIsSigned = false;
                                        swal("Deleted!", "Signed contract deleted.", "success");
                                    }
                                },
                                function(error) {
                                    spinnerService.hide("html5spinner");
                                });
                        } else {
                            swal("Cancelled", "Your signed contract is safe :)", "error");
                        }
                    });
            };


            $scope.openPop = function(type, data) {
                $scope.selectedScale = data;
                $scope.file = '';
                $scope.errMsg = '';
                angular.element("input[type='file']").val(null);
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