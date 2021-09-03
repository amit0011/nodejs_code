angular.module('myApp.performanceDetails', [])
    .controller('performanceDetailsCtrl', function($scope,
        $state,
        spinnerService,
        $rootScope,
        reportHttpServices,
        $timeout,
        apiUrl,
        $stateParams,
        sudAdminHttpService) {

        $scope.active = {
            page: 'performance'
        };

        var prev_filter = localStorage.getItem('pfmnce_page_filter');
        if (prev_filter) {
            $scope.myForm = JSON.parse(prev_filter);
        } else {
            $scope.myForm = {};
        }
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.adminId = $stateParams.adminId;


        sudAdminHttpService
            .getAccess($scope.adminId, $scope.token)
            .then((objS) => {
                if (objS.data.status == 200) {
                    $scope.fullName = objS.data.data.fullName;
                }
            });


        $scope.getSample = (page) => {
            spinnerService.show("html5spinner");
            reportHttpServices
                .getProductionRecord($scope.adminId, page, $scope.token, $scope.myForm)
                .then(function(ObjS) {
                    if (ObjS.data.status == 200) {
                        $scope.sampleList = ObjS.data.data.docs;
                        $scope.samplePage = ObjS.data.data.page;
                        $scope.totalPages = ObjS.data.data.total;
                    }
                    spinnerService.hide("html5spinner");
                });
        };

        $scope.getProductionContract = (page) => {
            spinnerService.show("html5spinner");
            reportHttpServices
                .getProductionContract($scope.adminId, page, $scope.token, $scope.myForm)
                .then(function(ObjS) {
                    if (ObjS.data.status == 200) {
                        $scope.productionContractList = ObjS.data.data.docs;
                        $scope.p_contract = ObjS.data.data.page;
                        $scope.p_totalPages = ObjS.data.data.total;
                    }
                    spinnerService.hide("html5spinner");
                });
        };

        $scope.getPurchaseConfirmation = (page) => {
            spinnerService.show("html5spinner");
            reportHttpServices
                .getPurchaseConfirmation($scope.adminId, page, $scope.token, $scope.myForm)
                .then(function(ObjS) {
                    if (ObjS.data.status == 200) {
                        $scope.purchaseConfirmationList = ObjS.data.data.docs;
                        $scope.p_confirmation = ObjS.data.data.page;
                        $scope.pc_totalPagesPages = ObjS.data.data.total;
                    }
                    spinnerService.hide("html5spinner");
                });
        };

        $scope.getSalesContractList = (page) => {
            spinnerService.show("html5spinner");
            reportHttpServices
                .salesContractListByUser($scope.adminId, page, $scope.token, $scope.myForm)
                .then(function(ObjS) {
                    if (ObjS.data.status == 200) {
                        $scope.salesContractList = ObjS.data.data.docs;
                        $scope.s_contract = ObjS.data.data.page;
                        $scope.s_totalPages = ObjS.data.data.total;
                    }
                    spinnerService.hide("html5spinner");
                });
        };


        $scope.getPhoneNoteList = (page) => {
            spinnerService.show("html5spinner");
            reportHttpServices
                .phoneListByUser($scope.adminId, page, $scope.token, $scope.myForm)
                .then(function(ObjS) {
                    if (ObjS.data.status == 200) {
                        $scope.phoneNoteList = ObjS.data.data.docs;
                        $scope.p_note = ObjS.data.data.page;
                        $scope.pn_totalPages = ObjS.data.data.total;
                    }
                    spinnerService.hide("html5spinner");
                });
        };

        $scope.getGrowerNameOfFarmName = (p) => {
            if (p.personFarmType == 'Farm') {
                if (p.growerId && p.growerId.farmName) return p.growerId.farmName;
                else if (p.growerId && (p.growerId.firstName || p.growerId.lastName)) return `${p.growerId.firstName} ${p.growerId.lastName}`;
                else return '';
            } else {
                if (p.growerId && (p.growerId.firstName || p.growerId.lastName)) return `${p.growerId.firstName} ${p.growerId.lastName}`;
                else if (p.growerId && p.growerId.farmName) return p.growerId.farmName;
                else return '';
            }
        };

        $scope.getPhoneNoteList(1);
        $scope.getSalesContractList(1);
        $scope.getPurchaseConfirmation(1);
        $scope.getProductionContract(1);
        $scope.getSample(1);

        $scope.exportXl = (type) => {
            var obj = {
                'type': type,
                'createdBy': $scope.adminId,
                'fileName': moment().format('MM/DD/YYYY') + '_' + type + '_.xlsx'
            };
            var request = new XMLHttpRequest();
            request.open("POST", apiUrl + 'admin/exportListByUser', true);
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
    });