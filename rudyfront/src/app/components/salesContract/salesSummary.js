angular
    .module('myApp.salesSummary', [])
    .controller('salesSummaryCtrl',
        function(
            $scope,
            salesContractHttpServices,
            httpService,
            spinnerService,
            $timeout,
            apiUrl,
            $rootScope,
            $state,
            commonService,
            brokerHttpService,
        ) {

            $scope.$on('access', (event, data) => {
                if (!data || !data.reports || !data.reports.salesSummary || !data.reports.salesSummary.view) {
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                    $state.go('login');
                    swal("ERROR", "Access denied", "error");
                }
            });

            $scope.active = {
                page: 'salesSummary'
            };

            $scope.page = 1;
            $scope.userType = JSON.parse(localStorage.getItem('userType'));
            $scope.token = JSON.parse(localStorage.getItem('token'));
            $scope.myForm = {
                commodityId: '',
                limit: '10'
            };
            $scope.cropYears = commonService.cropYears();
            $scope.checkLists = commonService.salesCheckLists();
            $scope.clear = () => {
                $scope.myForm = {
                    commodityId: '',
                    fromDate: '',
                    toDate: '',
                    limit: '10'
                };
                $scope.inItList();
            };
            $scope.brokerList = [];

            brokerHttpService.getBroker('', $scope.token).then(function(res) {
                $scope.brokerList = res.data.status == 200 ? res.data.data : [];
            });

            httpService
                .getCommodity($scope.token)
                .then(function(res) {
                        $scope.commoditys = res.data.status == 200 ? res.data.data : [];
                    },
                    function(error) {
                        console.log(JSON.stringify(error));
                    });

            $scope.applyCheckListName = function (sales) {
              sales.checkLists = sales.checkLists ? sales.checkLists.map(clst => {
                var checkList = $scope.checkLists.find(cl => cl.code === clst.code);
                return checkList ? {...clst, name: checkList.name} : clst;
              }) : [];

              return sales;
            };

            $scope.inItList = (page,pendingTask=null) => {
                spinnerService.show("html5spinner");

                var searchParam = Object.assign({}, $scope.myForm);
                searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
                searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

                searchParam.page = page;
                salesContractHttpServices
                    .salesSummary(searchParam, $scope.token)
                    .then(function(res) {

                            if (res.data.status == 200) {
                                $scope.page = res.data.data.page;
                                $scope.totalPages = res.data.data.total;
                                $scope.summary = res.data.data;
                                $scope.newList = [];
                                for (var obj of $scope.summary.docs) {
                                    if (obj.shipmentScheldule.length) {
                                        for (var i = 0; i < obj.shipmentScheldule.length; i++) {
                                            if(!obj.shipmentScheldule[i]) {
                                                continue;
                                            }

                                            var new_obj = angular.copy(obj);
                                            new_obj.shipping_schedule = new_obj.shipmentScheldule[i];
                                            if (obj.shipmentScheldule.length == 1) {
                                                new_obj.contract_number = new_obj.contractNumber;
                                            } else {
                                                new_obj.contract_number = new_obj.contractNumber + ' - ' + (i + 1);

                                                new_obj.priceUSD = obj.shipmentScheldule[i].quantity * obj.priceUSD / obj.contractQuantity;
                                            }
                                            if (obj.units == "BU") {
                                                new_obj.quantity_lbs =  obj.shipmentScheldule[i].quantity * obj.commodityId.commodityWeight;
                                            } else if (obj.units == "LBS") {
                                                new_obj.quantity_lbs =  obj.shipmentScheldule[i].quantity ;
                                            } else if (obj.units == "CWT") {
                                                new_obj.quantity_lbs =   obj.shipmentScheldule[i].quantity * 100 ;
                                            } else if (obj.units == "MT") {
                                                new_obj.quantity_lbs =  obj.shipmentScheldule[i].quantity * 2204.62 ;
                                            } else {
                                                new_obj.quantity_lbs =  obj.shipmentScheldule[i].quantity ;
                                            }

                                            $scope.newList.push($scope.applyCheckListName(new_obj));
                                        }
                                    } else {
                                        obj.shipping_schedule = {};
                                        $scope.newList.push($scope.applyCheckListName(obj));
                                    }

                                }
                            } else {
                                $scope.newList = [];

                            }
                            spinnerService.hide("html5spinner");
                            if(pendingTask){
                                pendingTask();
                            }
                        },
                        function(error) {
                            spinnerService.hide("html5spinner");
                            console.log(JSON.stringify(error));
                        });
            };

            $scope.inItList($scope.page);

            $scope.formatBrokerCommission = function(sales) {
                switch (sales.commissionType) {
                    case '$pmt':
                        return '$'+sales.brokerCommision+'/MT';
                    case '$':
                        return '$'+sales.brokerCommision+'/CWT';
                    case '%':
                        return sales.brokerCommision+'%';
                    default:
                        return sales.brokerCommision;
                }
            };

            $scope.exportData = () => {
                var old_limit = $scope.myForm.limit;
                $scope.page=1;
                $scope.myForm.limit = 2000;
                $scope.inItList($scope.page, function(){

                var newData = $scope.newList.map((sales) => {

                    var broker = "";
                    var tags = "";
                    if (sales.brokerId && sales.brokerId.businessName) {
                        broker = sales.brokerId.businessName;
                    }
                    if (sales.tagType && sales.tagType.tags) {
                        tags = sales.tagType.tags;
                    }
                    var destination = sales.destination;
                    var loadingPortName = sales.loadingPortId ? sales.loadingPortId.loadingPortName : '';
                    // if ( ['Vancouver', 'Montreal'].indexOf(loadingPortName) != -1) {
                    //     destination = loadingPortName;
                    // }
                    if ( ['Out-Mtl', 'Montreal'].indexOf(loadingPortName) != -1) {
                        destination = 'Montreal';
                    }
                    if ( ['Vancouver', 'Out-VCR'].indexOf(loadingPortName) != -1) {
                        destination = 'Vancouver';
                    }

                    var address_2 = `${sales.buyerId.addresses[0].city} ${sales.buyerId.addresses[0].postal}`;


                    //console.log(sales.quantityLbs);
                    return {
                        'Contract Date': moment(sales.date).format('MM/DD/YYYY'),
                        'Signed Contract On File': sales.shippingOption ? sales.shippingOption : '--',
                        'Entered On Clean/Ship': '--',
                        'SHIPMENT PERIOD Start':sales.shipping_schedule ? moment(sales.shipping_schedule.startDate).format('MM/DD/YYYY') : '',
                        'SHIPMENT PERIOD End':sales.shipping_schedule ? moment(sales.shipping_schedule.endDate).format('MM/DD/YYYY') : '',
                        'MERCHANDISER': sales.createdBy ? sales.createdBy.fullName : '',
                        'CONTRACT #': sales.contract_number,
                        //'CONTRACT QTY(LBS)': sales.quantityLbs,
                        'Shipment Qty': sales.quantity_lbs,
                        'BUYER NAME': sales.buyerId.businessName,
                        'Address 1': sales.buyerId.addresses[0].street,
                        'Address 2': address_2,
                        'Address 3': sales.buyerId.addresses[0].province,
                        'Address 4': sales.buyerId.addresses[0].country,

                        'ON HOLD': sales.shipmentHold ? 'YES' : 'NO',
                        'CROP YEAR': sales.cropyear,
                        'COMMODITY': sales.commodityId.commodityName,
                        'INVENTORY GRADE': sales.inventoryGrade.gradeName,
                        'CONTRACT GRADE': sales.gradeId.gradeName,
                        'CALL AS': sales.callAsGrade ? sales.callAsGrade.gradeName : '--',
                        'CONTRACT # OF BAGS': sales.noOfBags,
                        'BAG SIZE OR BULK': sales.bagWeight,
                        'BAG TYPE': sales.packingUnit ? sales.packingUnit.name : '',
                        'PALLET TYPE': sales.palletUnit ? sales.palletUnit.name : '',
                        'LB/KG': sales.packingUnit ? sales.packingUnit.bagWeightUnit : '',
                        'TAGS': tags,
                        'INLAND DESTINATION': destination,
                        'EQUIPMENT TYPE': sales.equipmentType ? sales.equipmentType.equipmentName : '',
                        'PHYTO REQUIRED': '--',
                        'GRADE CERTIFICATE': sales.certificateAnalysis ? sales.certificateAnalysis.certificateName : '',
                        'BROKER': broker,
                        'BROKER CONTRACT #': sales.buyerReferenceNumber,
                        'BROKER COMMISSION': sales.brokerCommision,
                        'BUYER PO #': '--',
                        'ORIGIN': sales.countryId,
                        // 'Volume LBS': sales.quantity_lbs,
                        'Terms': sales.pricingTerms ? `${sales.pricingTerms.pricingTerms} ${sales.destination}` : '',
                        'Destination Country': sales.country,
                        'Destination Port': sales.destination,
                        'Ocean Frt On stamp': sales.oceanFreightCWT,
                        'ACTUAL OCEAN FRT': '--',
                        'OCEAN FRT VARIANCE': '--',
                        'SIGNATURE RECEIVED': '--',
                        'REASON BY': '--',
                        'REASON CANCELLED': '--',
                        'CONTRACT ISSUED BY': sales.createdBy ? sales.createdBy.fullName : '',
                        'AMENDED DATE': moment(sales.amendedDate).format('MM/DD/YYYY'),
                        'Special Plant Instructions': (sales.checkLists.filter(cl => cl.checked).map(cl => cl.name).join(', ') || ''),
                        'USD Amount': sales.priceUSD,
                        'NET FOB': sales.netFOBCAD,
                        'USD Rate': sales.exchangeRate,
                    };
                });
                var obj = {
                    'data': newData,
                    'fileName': moment().format('MM/DD/YYYY') + 'sales_summary.xlsx'
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
                $scope.myForm.limit = old_limit;
            });
        };

    });
