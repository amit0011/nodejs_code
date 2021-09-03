angular.module('myApp.packagingReport', [])
    .controller('packagingReportCtrl', function($scope, apiUrl, $rootScope, httpService, spinnerService, reportHttpServices, $timeout, $state) {


        $scope.$on('access', (event, data) => {
            if (!data || !data.reports || !data.reports.packaging || !data.reports.packaging.view) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'packagingReport'
        };

        var pageNo = localStorage.getItem('packaging_page_No') || 1;

        var prev_filter = localStorage.getItem('packaging_report_filter');
        $scope.myForm = prev_filter ? JSON.parse(prev_filter) : {};
        $scope.token = JSON.parse(localStorage.getItem('token'));


        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });
        

        $scope.initList = (page,pendingTask=null) => {
            page = page || pageNo;
            localStorage.setItem('packaging_report_filter', JSON.stringify($scope.myForm));
            localStorage.setItem('packaging_page_No', page);
            spinnerService.show('html5spinner');
            $scope.myForm.page = page;
            reportHttpServices.packagingReport($scope.myForm,$scope.token).then((objS) => {
                    spinnerService.hide('html5spinner');
                    if (objS.data.status == 200) {
                        $scope.list = objS.data.data.docs;
                        $scope.page = objS.data.data.page;
                        $scope.totalPages = objS.data.data.total;
                        if(pendingTask){
                            pendingTask();
                        }
                    }
                });
        };

        $scope.clear = () =>{
            $scope.myForm = {};
            $scope.initList(1);
        };

        $scope.initList();

        $scope.exportData = () => {

            var old_limit = $scope.myForm.limit;
            $scope.page=1;
            $scope.myForm.limit = 2000;
            $scope.initList($scope.page, function(){

            var newData = [];
                if ($scope.list && $scope.list.length) {
                    newData = $scope.list.map((report) => {
                        return {
                            'Date': moment(report.date).format('YYYY-MM-DD'),
                            'Ticket Number': report.ticketNumber,
                            'Commodity': report.commodityId.commodityName, 
                            'Target Weight': report.targetWeight ? report.targetWeight : '' ,
                            'Net Weight': report.netWeightPerBag ? report.netWeightPerBag : '',
                            'Over/Under': report.overUnderTarget ? report.overUnderTarget : ''
                        };
                    });
                }

            if (newData && newData.length) {
                var obj = {
                    'data': newData,
                    'fileName': moment().format('MM/DD/YYYY')+ '_packaging_report.xlsx'
                };
                $scope.exporting = true;
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
                        $scope.$apply(function() {
                                $scope.exporting = false;
                            });
                    }
                };

                request.send(JSON.stringify(obj));
                $scope.myForm.limit = old_limit;
            }

        });

        };

    });