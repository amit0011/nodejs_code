angular.module('myApp.incoming', [])
    .controller('incomingCtrl',
        function(
            $scope,
            scaleTicketHttpServices,
            httpService,
            $state,
            $timeout,
            spinnerService,
            apiUrl,
            $rootScope,
            imageUrl,
            $window,
            commonService) {

            var prev_filter = localStorage.getItem('incoming_scale_filter');
            $scope.myForm = prev_filter ? JSON.parse(prev_filter) : {tGB: true};
            $scope.printTicket = false;

            $scope.active = {
                page: 'scaleTicketIncoming'
            };

            $scope.$on('access', (event, data) => {
                if (!data || !data.truckScale || !data.truckScale.incoming || !data.truckScale.incoming.viewMenu) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            $scope.token = JSON.parse(localStorage.getItem('token'));

            function secondsToHms(d) {
                d = Number(d);
                var h = Math.floor(d / 3600);
                var m = Math.floor(d % 3600 / 60);
                var s = Math.floor(d % 3600 % 60);

                var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
                var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes ") : "";
                return hDisplay + mDisplay;
            }

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

            httpService.getCommodity($scope.token).then(function(res) {
                $scope.commoditys = res.data.status == 200 ? res.data.data : [];
            });
            console.log($scope.commoditys);
            $scope.search = function(pageNo, pendingTask=null) {
                $scope.myForm.limit = $scope.myForm.limit ? $scope.myForm.limit : "10";
                localStorage.setItem('incoming_scale_filter', JSON.stringify($scope.myForm));

                spinnerService.show("html5spinner");

                $scope.myForm.ticketType = 'Incoming';
                var page = pageNo || 1;

                var searchParam = Object.assign({}, $scope.myForm);
                searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
                searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

                scaleTicketHttpServices.searchScaleTicket(searchParam, page, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.incomingList = res.data.data.docs;
                        // console.log($scope.incomingList);
                        $scope.page = res.data.data.page;
                        $scope.totalPages = res.data.data.total;
                        for (var i = 0; i < $scope.incomingList.length; i++) {
                            $scope.incomingList[i].status = $scope.incomingList[i].status.toString();
                            $scope.incomingList[i].startDate = new Date($scope.incomingList[i].inTime);
                            $scope.incomingList[i].endDate = new Date($scope.incomingList[i].exitTime);
                            $scope.incomingList[i].seconds = ($scope.incomingList[i].endDate.getTime() - $scope.incomingList[i].startDate.getTime()) / 1000;
                            $scope.incomingList[i].unloadTime = secondsToHms($scope.incomingList[i].seconds);
                            if ($scope.incomingList[i].displayOnTicket == 'Grower Name' && $scope.incomingList[i].growerId) {
                                $scope.incomingList[i].growerFullName = ($scope.incomingList[i].growerId.firstName + ' ' + $scope.incomingList[i].growerId.lastName) || $scope.incomingList[i].growerId.farmName;
                            } else if ($scope.incomingList[i].growerId) {
                                $scope.incomingList[i].growerFullName = $scope.incomingList[i].growerId.farmName || ($scope.incomingList[i].growerId.firstName + ' ' + $scope.incomingList[i].growerId.lastName);
                            } else {
                                $scope.incomingList[i].growerFullName = $scope.incomingList[i].buyerId && $scope.incomingList[i].growerOrBuyer === 'Buyer' ? $scope.incomingList[i].buyerId.businessName : '' ;
                            }

                            $scope.incomingList[i].generateIncomingScalePDF = true;
                            if ("updatePdf" in $scope.incomingList[i] && $scope.incomingList[i].updatePdf == false) {
                                $scope.incomingList[i].generateIncomingScalePDF = false;
                            }

                        }
                        if(pendingTask){
                            pendingTask();
                        }


                    }
                    spinnerService.hide("html5spinner");

                });
            };



            $scope.DoCtrlPagingAct = function(page) {
                localStorage.setItem('incoming_scale_filter', JSON.stringify($scope.myForm));
                if (page) localStorage.setItem('incoming_page', page);
                else page = localStorage.getItem('incoming_page') || 1;
                $scope.search(page);
            };

            $scope.clear = () => {
                $scope.myForm = {
                    limit: '10',
                    tGB: true,
                };
                localStorage.removeItem('incoming_scale_filter');
                localStorage.setItem('incoming_page', 1);
                $scope.search(1);
            };



            $scope.getMTValueOfAnalysis = (scaleTicket, analysisKey) => {
                var weight = 0;
                scaleTicket.analysis.filter((anal) => {
                    if (anal.analysisId.analysisName == analysisKey) {
                        weight = anal.weightMT ? anal.weightMT : 0;
                    }
                });
                return weight.toFixed(3);
            };

            $scope.getClass = (data) => {
                if (data.void) {
                    return 'clsRed';
                } else {
                    if (data.tareWeight != 0 && data.dockageCompleted == false) {
                        return 'clsBlue';
                    } else if (data.tareWeight == 0) {
                        return 'clsOrange';
                    }
                }
            };

            $scope.openPdf = (pdf) => {
                if (pdf) $window.open(pdf, '_blank');
            };

            $scope.exportSheet = () => {
                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'scale/incomingExcelDownload', true);
                request.responseType = "blob";
                request.setRequestHeader("Content-type", "application/json");
                request.setRequestHeader("authorization", "Bearer " + $scope.token);
                request.onload = function(e) {
                    if (this.status === 200) {
                        console.log(this.response);
                        var file = window.URL.createObjectURL(this.response);
                        var a = document.createElement("a");
                        a.href = file;
                        a.download = 'incoming _ticket.xlsx';
                        document.body.appendChild(a);
                        a.click();
                    }
                };
                request.send(JSON.stringify($scope.myForm));
            };

            $scope.exportCGCReport = () => {
              var request = new XMLHttpRequest();
              request.open("POST", apiUrl + 'scale/incomingExcelCGCDownload', true);
              request.responseType = "blob";
              request.setRequestHeader("Content-type", "application/json");
              request.setRequestHeader("authorization", "Bearer " + $scope.token);
              request.onload = function(e) {
                  if (this.status === 200) {
                      console.log(this.response);
                      var file = window.URL.createObjectURL(this.response);
                      var a = document.createElement("a");
                      a.href = file;
                      a.download = moment().format('MM/DD/YYYY') + '_incoming_cgc_tickets.xlsx';
                      document.body.appendChild(a);
                      a.click();
                  }
              };
              request.send(JSON.stringify($scope.myForm));
            };

            $scope.exportAllData = (filter) => {
                var obj = {
                    'filter': filter ? true : false,
                    'ticketType': 'Incoming',
                    'filterBy': $scope.myForm,
                    'fileName': moment().format('MM/DD/YYYY') + '_incoming_ticket.xlsx'
                };
                var request = new XMLHttpRequest();
                request.open("POST", apiUrl + 'scale/exportAll', true);
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
            // email Id fetch
                     $scope.email = (request) => {
                            // console.log(request.growerOrBuyer,  request.ticketType);
                            const checkBuyerCondition =  request.ticketType == 'Incoming' && request.growerOrBuyer === 'Buyer' 
                            // console.log(checkBuyerCondition);
                         if (request.buyerId && request.buyerId.email && checkBuyerCondition){
                                $scope.scaleBuyerTicketDetails = request;
                                console.log('hello',$scope.scaleBuyerTicketDetails);
                                if ($scope.scaleBuyerTicketDetails.commodityId.commodityName == 'Kabuli Chick Peas') {
                                    $scope.showKabuliSize = true;
                                } else {
                                    $scope.showKabuliSize = false;
                                }
                                var net = (request.netWeight).toFixed(3);
                                var unload = (request.unloadWeidht).toFixed(3);
                                $scope.netWeightInWord = inWords(net);
                                $scope.unloadWeidhtInWord = inWords(unload);
            
                                if ($scope.scaleBuyerTicketDetails.receiptType == "Special Bin Elevator Receipt") {
                                    $scope.specialImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                } else if ($scope.scaleBuyerTicketDetails.receiptType == "Interim Primary Elevator Receipt") {
                                    $scope.interimImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                } else if ($scope.scaleBuyerTicketDetails.receiptType == "Primary Elevator Receipt") {
                                    $scope.primaryImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                }else if ($scope.scaleBuyerTicketDetails.receiptType == "Non CGA Grain") {
                                    $scope.nonCgaImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                }else if ($scope.scaleBuyerTicketDetails.receiptType == "Non Producer Purchase") { 
                                    $scope.nonProducerImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                }
                                if (['Small Green Lentils (Eston)', 'Richlea Lentils', 'Large Green Lentils', 'Crimson Lentils', 'Large Green Lentils (Laird type)'].indexOf($scope.scaleBuyerTicketDetails.commodityId.commodityName) != -1) {
                                    $scope.showAllow = true;
                                } else {
                                    $scope.showAllow = false;
                                }
                                spinnerService.show("html5spinner");
                                $timeout(function() {
                                    var html = document.getElementById("printSectionId").innerHTML;
            
                                    var data = {
                                        html: html,
                                        subject: 'Rudy Agro Delivery Receipt #' + 'RI-' + $scope.scaleBuyerTicketDetails.ticketNumber,
                                        name: $scope.scaleBuyerTicketDetails.buyerId.firstName + '_' + $scope.scaleBuyerTicketDetails.buyerId.lastName,
                                        email: $scope.scaleBuyerTicketDetails.buyerId.email,
                                        pdfUrl: $scope.scaleBuyerTicketDetails.pdfUrl
                                    };
                                    httpService.sendContract(data, $scope.token).then(function(res) {
                                        if (res.data.status == 200) {
                                            $scope.mailData = res.data.data;
                                            var newObj = {
                                                _id: request._id,
                                                mailSent: 0,
                                                mailColor: 0
                                            };
                                            scaleTicketHttpServices.updateMailColor(newObj, $scope.token).then(function(res) {
                                                if (res.data.status == 200) {
                                                    spinnerService.hide("html5spinner");
                                                    $scope.search(1);
                                                } else {
                                                    swal("Error", res.data.userMessage, "error");
                                                }
                                            });
                                        } else {
                                            swal("Error", res.data.userMessage, "error");
                                        }
                                    });
                                }, 1000);
                            }else if (request && request.growerId && request.growerId.email ) {

                                    $scope.scaleTicketDetails = request;
                                    console.log($scope.scaleTicketDetails);
                                    if ($scope.scaleTicketDetails.commodityId.commodityName == 'Kabuli Chick Peas') {
                                        $scope.showKabuliSize = true;
                                    } else {
                                        $scope.showKabuliSize = false;
                                    }

                                    var net = (request.netWeight).toFixed(3);
                                    var unload = (request.unloadWeidht).toFixed(3);
                                    $scope.netWeightInWord = inWords(net);
                                    $scope.unloadWeidhtInWord = inWords(unload);

                                    if ($scope.scaleTicketDetails.receiptType == "Special Bin Elevator Receipt") {
                                        $scope.specialImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                    } else if ($scope.scaleTicketDetails.receiptType == "Interim Primary Elevator Receipt") {
                                        $scope.interimImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                    } else if ($scope.scaleTicketDetails.receiptType == "Primary Elevator Receipt") {
                                        $scope.primaryImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                    }else if ($scope.scaleBuyerTicketDetails.receiptType == "Non CGA Grain") {
                                        $scope.nonCgaImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                    }else if ($scope.scaleBuyerTicketDetails.receiptType == "Non Producer Purchase") { 
                                        $scope.nonProducerImg = "https://erp.rudyagro.ca/assets/images/cancel-music.png";
                                    }



                                    if (['Small Green Lentils (Eston)', 'Richlea Lentils', 'Large Green Lentils', 'Crimson Lentils', 'Large Green Lentils (Laird type)'].indexOf($scope.scaleTicketDetails.commodityId.commodityName) != -1) {
                                        $scope.showAllow = true;
                                    } else {
                                        $scope.showAllow = false;
                                    }
                                    spinnerService.show("html5spinner");

                                    $timeout(function() {
                                        var html = document.getElementById("printSectionId").innerHTML;

                                        var data = {
                                            html: html,
                                            subject: 'Rudy Agro Delivery Receipt #' + 'RI-' + $scope.scaleTicketDetails.ticketNumber,
                                            name: $scope.scaleTicketDetails.growerId.firstName + '_' + $scope.scaleTicketDetails.growerId.lastName,
                                            email: $scope.scaleTicketDetails.growerId.email,
                                            pdfUrl: $scope.scaleTicketDetails.pdfUrl
                                        };
                                        httpService.sendContract(data, $scope.token).then(function(res) {
                                            if (res.data.status == 200) {
                                                $scope.mailData = res.data.data;
                                                var newObj = {
                                                    _id: request._id,
                                                    mailSent: 0,
                                                    mailColor: 0
                                                };
                                                scaleTicketHttpServices.updateMailColor(newObj, $scope.token).then(function(res) {
                                                    if (res.data.status == 200) {
                                                        spinnerService.hide("html5spinner");
                                                        $scope.search(1);
                                                    } else {
                                                        swal("Error", res.data.userMessage, "error");
                                                    }
                                                });
                                            } else {
                                                swal("Error", res.data.userMessage, "error");
                                            }
                                        });
                                    }, 1000);
                                } else {
                                                swal('Error', 'Email not attched with this grower');
                                            }
                        };
            $scope.unlockScaleTicket = (result, key) => {
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
                            var obj = {
                                type: key
                            };
                            scaleTicketHttpServices.unlockTicket(result._id, obj, $scope.token).then(function(res) {
                                    spinnerService.hide("html5spinner");
                                    if (res.data.status == 200) {
                                        result[key] = false;
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



        });
