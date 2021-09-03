angular.module('myApp.bidsheet', [])
    .controller('bidsheetCtrl', function($scope, httpService, $rootScope, $state, bidSheetHttpService, bidPeriodHttpService, spinnerService, apiUrl, $timeout) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.purchase || !data.purchase.bidSheet || !data.purchase.bidSheet.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'bidsheet'
        };
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        $scope.searchForm = {
            date: moment().format('YYYY-MM-DD'),
            reportName: 'BidsheetExcel',
            entityName: 'Bidsheet'
        };
        var pageNo = 1;
        $scope.editing = false;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.initBidSheet = function(pageNo) {
            $scope.initBidPeriod();
            spinnerService.show("html5spinner");
            bidSheetHttpService.getBidsheet('', $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    spinnerService.hide("html5spinner");
                    $scope.currentDate = new Date();
                    $scope.bidsheetList = res.data.data;
                    $scope.orderByField = 'commodityId.commodityName';
                    $scope.reverseSort = false;
                    if ($scope.bidsheetList.length != 0) {
                        $scope.myForm.bidPeriod1 = $scope.bidsheetList[0].bidPeriod1;
                        $scope.myForm.bidPeriod2 = $scope.bidsheetList[0].bidPeriod2;
                        $scope.myForm.bidPeriod3 = $scope.bidsheetList[0].bidPeriod3;
                        $scope.page = res.data.data.page;
                        $scope.totalPages = res.data.data.total;
                        $scope.Pdf = false;
                    }
                } else {
                    spinnerService.hide("html5spinner");
                }
            });
        };


        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            $scope.initBidSheet(page);
        };


        $scope.editAppKey = function(field) {
            $scope.getGrade(field.commodityId._id);
        };


        $scope.cancel = function(index) {
            if ($scope.editing != false) {
                $scope.editing = false;
            }
        };

        $scope.round_off = (quantity, unit) => {
            var value = quantity || 0;
            if (unit == 'Bu' || unit == 'CWT') return (Number(value)).toFixed(2);
            else if (unit == 'Lbs') return (Number(value)).toFixed(4);
            else return 0;
        };


        $scope.saveField = function(data) {
            $scope.myForm = data;
            $scope.myForm._id = data._id;
            $scope.myForm.commodityId = data.commodityId._id;
            $scope.myForm.gradeId = data.gradeId._id;
            bidSheetHttpService.updateBidsheet($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initBidSheet(pageNo);
                    $scope.closepop();
                } else {
                    swal("Error", res.data.userMessage, "error");
                }
            });
            if ($scope.editing != false) {
                $scope.editing = false;
            }
        };

        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });


        $scope.getGrade = function(id) {
            httpService.getGrade('', id, $scope.token).then(function(res) {
                $scope.grades = res.data.status == 200 ? res.data.data : [];
            });
            $scope.commodityGrades = $scope.commoditys.filter(function(hero) {
                return hero._id == id;
            });
            $scope.myForm.code = $scope.commodityGrades[0].commodityCode;
        };

        $scope.save = () => {
            var data = {
                bidPeriod: [{
                    // bidPeriodName: $scope.myForm.bidPeriod1 || '',
                    bidType: $scope.myForm.bidType1 || '',
                    bidHb: $scope.myForm.bidHb1 || '',
                    bidFob: $scope.myForm.bidFob1 || '',
                    bidDel: Number($scope.myForm.bidDel1) || 0,
                    bidFOBUnit: $scope.myForm.bidFOBUnit1 || '',
                    bidDelUnit: $scope.myForm.bidDelUnit1 || ''
                }, {
                    // bidPeriodName: $scope.myForm.bidPeriod2 || '',
                    bidType: $scope.myForm.bidType2 || '',
                    bidHb: $scope.myForm.bidHb2 || '',
                    bidFob: $scope.myForm.bidFob2 || '',
                    bidDel: Number($scope.myForm.bidDel2) || 0,
                    bidFOBUnit: $scope.myForm.bidFOBUnit2 || '',
                    bidDelUnit: $scope.myForm.bidDelUnit1 || ''
                }, {
                    // bidPeriodName: $scope.myForm.bidPeriod3 || '',
                    bidType: $scope.myForm.bidType3 || '',
                    bidHb: $scope.myForm.bidHb3 || '',
                    bidFob: $scope.myForm.bidFob3 || '',
                    bidDel: Number($scope.myForm.bidDel3) || 0,
                    bidFOBUnit: $scope.myForm.bidFOBUnit3 || '',
                    bidDelUnit: $scope.myForm.bidDelUnit1 || ''
                }],
                bidPeriod1: $scope.myForm.bidPeriod1,
                bidPeriod2: $scope.myForm.bidPeriod2,
                bidPeriod3: $scope.myForm.bidPeriod3,
                code: $scope.myForm.code,
                commodityId: $scope.myForm.commodityId,
                maxQuantity: $scope.myForm.maxQuantity,
                unit: $scope.myForm.unit,
                gradeId: $scope.myForm.gradeId,
                company: $scope.myForm.company
            };
            if ($scope.myForm._id) {
                data._id = $scope.myForm._id;
                bidSheetHttpService.updateBidsheet(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initBidSheet(pageNo);
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                bidSheetHttpService.addBidsheet(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initBidSheet(pageNo);
                        $scope.closepop();
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }

        };

        $scope.openPop = function(data, type) {
            if (type == 'view') {
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.commodityId = data.commodityId._id;
                $scope.myForm.gradeId = data.gradeId._id;
                $scope.getGrade(data.commodityId._id);
                $scope.myForm.bidPeriod1 = data.bidPeriod1;
                $scope.myForm.bidPeriod2 = data.bidPeriod2;
                $scope.myForm.bidPeriod3 = data.bidPeriod3;
                // $scope.myForm.bidPeriod1 = data.bidPeriod[0].bidPeriodName;
                $scope.myForm.bidType1 = data.bidPeriod[0].bidType;
                $scope.myForm.bidDel1 = data.bidPeriod[0].bidDel;
                $scope.myForm.bidFob1 = data.bidPeriod[0].bidFob;
                $scope.myForm.bidHb1 = data.bidPeriod[0].bidHb;
                // $scope.myForm.bidPeriod2 = data.bidPeriod[1].bidPeriodName;
                $scope.myForm.bidType2 = data.bidPeriod[1].bidType;
                $scope.myForm.bidDel2 = data.bidPeriod[1].bidDel;
                $scope.myForm.bidFob2 = data.bidPeriod[1].bidFob;
                $scope.myForm.bidHb2 = data.bidPeriod[1].bidHb;
                // $scope.myForm.bidPeriod3 = data.bidPeriod[2].bidPeriodName;
                $scope.myForm.bidType3 = data.bidPeriod[2].bidType;
                $scope.myForm.bidDel3 = data.bidPeriod[2].bidDel;
                $scope.myForm.bidFob3 = data.bidPeriod[2].bidFob;
                $scope.myForm.bidHb3 = data.bidPeriod[2].bidHb;
            } else if (type == 'edit') {
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.commodityId = data.commodityId._id;
                $scope.myForm.gradeId = data.gradeId._id;
                $scope.getGrade(data.commodityId._id);
                $scope.myForm.bidPeriod1 = data.bidPeriod1;
                $scope.myForm.bidPeriod2 = data.bidPeriod2;
                $scope.myForm.bidPeriod3 = data.bidPeriod3;
                // $scope.myForm.bidPeriod1 = data.bidPeriod[0].bidPeriodName;
                $scope.myForm.bidType1 = data.bidPeriod[0].bidType;
                $scope.myForm.bidDel1 = data.bidPeriod[0].bidDel;
                $scope.myForm.bidFob1 = data.bidPeriod[0].bidFob;
                $scope.myForm.bidHb1 = data.bidPeriod[0].bidHb;
                // $scope.myForm.bidPeriod2 = data.bidPeriod[1].bidPeriodName;
                $scope.myForm.bidType2 = data.bidPeriod[1].bidType;
                $scope.myForm.bidDel2 = data.bidPeriod[1].bidDel;
                $scope.myForm.bidFob2 = data.bidPeriod[1].bidFob;
                $scope.myForm.bidHb2 = data.bidPeriod[1].bidHb;
                // $scope.myForm.bidPeriod3 = data.bidPeriod[2].bidPeriodName;
                $scope.myForm.bidType3 = data.bidPeriod[2].bidType;
                $scope.myForm.bidDel3 = data.bidPeriod[2].bidDel;
                $scope.myForm.bidFob3 = data.bidPeriod[2].bidFob;
                $scope.myForm.bidHb3 = data.bidPeriod[2].bidHb;
            } else {
                $scope.inputField = 'add';
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };
        $scope.excelReport = function() {
            if ($scope.searchForm.date === moment().format("YYYY-MM-DD")) {
                $scope.exportSheet($scope.bidsheetList);
                return;
            }
            spinnerService.show("html5spinner");
            httpService.getArchiveExcel($scope.token, $scope.searchForm)
                .then(function(res) {
                    spinnerService.hide("html5spinner");
                    if (res.data.status === 200 && res.data.data) {
                        window.location.href = res.data.data.reportUrl;
                        return;
                    }
                    alert('Excel not present in archive.');
                });
        };

        $scope.exportSheet = function(data) {
            var newData = data.map(function(bidsheet) {
                return {
                    'Commodity': bidsheet.commodityId.commodityName || '',
                    'Grade': bidsheet.gradeId ? bidsheet.gradeId.gradeName || '' : '',
                    'Max Qty': bidsheet.maxQuantity || '',
                    'Unit': bidsheet.unit || '',
                    [`B/Q-${bidsheet.bidPeriod1}`]: bidsheet.bidPeriod[0].bidType,
                    [`Del-${bidsheet.bidPeriod1}`]: `${$scope.round_off(bidsheet.bidPeriod[0].bidDel,bidsheet.bidPeriod[0].bidDelUnit)} ${bidsheet.bidPeriod[0].bidDelUnit || ''}`,
                    [`Fob-${bidsheet.bidPeriod1}`]: `${$scope.round_off(bidsheet.bidPeriod[0].bidFob,bidsheet.bidPeriod[0].bidFOBUnit)} ${bidsheet.bidPeriod[0].bidFOBUnit || ''}`,
                    [`B/Q-${bidsheet.bidPeriod2}`]: bidsheet.bidPeriod[1].bidType,
                    [`Del-${bidsheet.bidPeriod2}`]: `${$scope.round_off(bidsheet.bidPeriod[1].bidDel,bidsheet.bidPeriod[1].bidDelUnit)} ${bidsheet.bidPeriod[1].bidDelUnit || ''}`,
                    [`Fob-${bidsheet.bidPeriod2}`]: `${$scope.round_off(bidsheet.bidPeriod[1].bidFob,bidsheet.bidPeriod[1].bidFOBUnit)} ${bidsheet.bidPeriod[1].bidFOBUnit || ''}`,
                    [`B/Q-${bidsheet.bidPeriod3}`]: bidsheet.bidPeriod[2].bidType,
                    [`Del-${bidsheet.bidPeriod3}`]: `${$scope.round_off(bidsheet.bidPeriod[2].bidDel,bidsheet.bidPeriod[2].bidDelUnit)} ${bidsheet.bidPeriod[2].bidDelUnit || ''}`,
                    [`Fob-${bidsheet.bidPeriod3}`]: `${$scope.round_off(bidsheet.bidPeriod[2].bidFob,bidsheet.bidPeriod[2].bidFOBUnit)} ${bidsheet.bidPeriod[2].bidFOBUnit || ''}`,
                    'createdAt': moment(bidsheet.createdAt).format('MM/DD/YYYY, h:mm:ss a')
                };
            });
            console.log('newData---', newData);
            var obj = {
                'data': newData,
                'fileName': 'bidsheet.xlsx'
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

        $scope.initBidPeriod = function() {
            bidPeriodHttpService.getbidPeriod($scope.token).then(function(res) {
                $scope.bidPeriodList = res.data.status == 200 ? res.data.data : [];
            });
        };

        $scope.saveBidPeriod = function() {
            if (!$scope.myForm.bidPeriodName) {
                swal("Here's a message!", 'Please fill bidPeriod Name first.', "error");
            } else {
                var data = {
                    'bidPeriodName': $scope.myForm.bidPeriodName
                };
                bidPeriodHttpService.addbidPeriod(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initBidPeriod();
                        $scope.closepop();
                        $scope.myForm = {};
                    } else {
                        swal("Here's a message!", res.data.userMessage, "error");
                    }
                });
            }
        };
        $scope.changeBidPeriod = () => {
            bidSheetHttpService.updateBidPeriod($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initBidSheet(pageNo);
                    swal("Alert", res.data.userMessage, "success");
                } else {
                    swal("Error", res.data.userMessage, "error");
                }
            });

        };
        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one Bidsheet.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this Bidsheet!",
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
                            bidSheetHttpService.removeBidsheet($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initBidSheet();
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal("Deleted!", "Your Bidsheet has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your Bidsheet file is safe :)", "error");
                        }
                    });
            }
        };
        $scope.print = function(printSectionId) {
            $timeout(function() {
                var innerContents = document.getElementById("printSectionId").innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=1000,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write(`<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` + innerContents + `</html>`);
                popupWinindow.document.close();
            }, 1000);

        };
        $scope.openPopBidPeriod = function(data, type) {
            $(".bidPeriod").fadeIn();
            $(".popup_overlay").fadeIn();
        };
        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
            $(".bidPeriod").fadeOut();
            $(".popup_overlay").fadeOut();
        };
        $(".popup_overlay , .close").click(function() {
            $(".add_coomm").fadeOut();
            $(".bidPeriod").fadeOut();
            $(".popup_overlay").fadeOut();
        });
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });