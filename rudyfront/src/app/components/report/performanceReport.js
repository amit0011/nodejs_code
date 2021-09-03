angular.module('myApp.performanceReport', [])
    .controller('performanceReportCtrl', function($scope,
        spinnerService,
        $rootScope,
        reportHttpServices,
        $timeout,
        apiUrl,
        $state,
        commonService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.reports || !data.reports.groupEmail || !data.reports.groupEmail.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });


        var prev_filter = localStorage.getItem('pfmnce_page_filter');
        if (prev_filter) {
            $scope.myForm = JSON.parse(prev_filter);
        } else {
            $scope.myForm = {};
        }
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.p_record = 0;
        $scope.p_contract = 0;
        $scope.p_confirmation = 0;
        $scope.s_contract = 0;
        $scope.p_note = 0;


        function initList() {
            localStorage.setItem('pfmnce_page_filter', JSON.stringify($scope.myForm));
            spinnerService.show("html5spinner");
            $scope.p_record = 0;
            $scope.p_contract = 0;
            $scope.p_confirmation = 0;
            $scope.s_contract = 0;
            $scope.p_note = 0;
            
            var searchParam = Object.assign({}, $scope.myForm);
            searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
            searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

            reportHttpServices
                .performanceReport(searchParam.fromDate, searchParam.toDate, $scope.token)
                .then(function(ObjS) {
                    $scope.list = ObjS.data.status == 200 ? ObjS.data.data : [];
                    $scope.list.forEach((val) => {
                        $scope.p_record += val.sample;
                        $scope.p_contract += val.productionContract;
                        $scope.p_confirmation += val.puchaseConfirmationContract;
                        $scope.s_contract += val.salesContract;
                        $scope.p_note += val.phoneNote;
                    });
                    spinnerService.hide("html5spinner");
                });
        }

        $scope.search = () => {
            initList();
        };

        initList();
        $scope.clear = () => {
            $scope.myForm = {};
            initList();
        };
        $scope.exportToXl = () => {
            var newData = [];

            $scope.list.map((val) => {
                newData.push({
                    'Name': val.fullName,
                    // 'Email': val.email,
                    // 'Phone Number': val.mobileNumber,
                    'Production Record': val.sample,
                    'Production Contract': val.productionContract,
                    'Purchase Confirmation': val.puchaseConfirmationContract,
                    'Sales Contract': val.salesContract,
                    'Phone Note': val.phoneNote
                });
            });

            newData.push({
                'Name': 'Total',
                //'Email': '',
                //'Phone Number': 'Total',
                'Production Record': $scope.p_record,
                'Production Contract': $scope.p_contract,
                'Purchase Confirmation': $scope.p_confirmation,
                'Sales Contract': $scope.s_contract,
                'Phone Note': $scope.p_note
            });

            var obj = {
                'data': newData,
                'fileName': moment().format('DD/MM/YYYY') + '_performance_report.xlsx'
            };

            var request = new XMLHttpRequest();
            request.open("POST", apiUrl + 'export', true);
            request.responseType = "blob";
            request.setRequestHeader("Content-type", "application/json");
            request.onload = function(e) {
                if (this.status === 200) {
                    var a = document.createElement("a");
                    a.href = window.URL.createObjectURL(this.response);
                    a.download = obj.fileName;
                    document.body.appendChild(a);
                    a.click();
                }
            };
            request.send(JSON.stringify(obj));
        };

    });