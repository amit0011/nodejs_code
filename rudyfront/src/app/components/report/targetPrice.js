angular.module('myApp.targetPrice', [])
    .controller('targetPriceCtrl', function($scope,
        spinnerService,
        $rootScope,
        reportHttpServices,
        $timeout,
        apiUrl,
        commonService,
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
          page: 'targetPrice'
        };
        $scope.cropYears = commonService.cropYears();

        var prev_filter = localStorage.getItem('target_price_report_filter');

        $scope.page = localStorage.getItem('target_price_page') || 1;
        if (prev_filter) {
            $scope.myForm = JSON.parse(prev_filter);
        } else {
            $scope.myForm = {};
        }
        $scope.token = JSON.parse(localStorage.getItem('token'));

        httpService.getCommodity($scope.token).then(function(res) {
            $scope.commoditys = res.data.status == 200 ? res.data.data : [];
        });

        $scope.getGrade = function(commodityId) {
            console.log("call");
            if (commodityId) {
                httpService.getGrade('', commodityId, $scope.token).then(function(res) {
                    $scope.grades = res.data.status == 200 ? res.data.data : [];
                });
            } else $scope.grades = [];

        };

        $scope.getList = (page) => {
            spinnerService.show("html5spinner");
            $scope.page = page || $scope.page;
            localStorage.setItem('target_price_report_filter', JSON.stringify($scope.myForm));
            localStorage.setItem('target_price_page', $scope.page);
            $scope.myForm.page = $scope.page;
            reportHttpServices.targetPriceReport($scope.myForm, $scope.token).then((objS) => {
                if (objS.data.status == 200) {
                    $scope.list = objS.data.data.docs;
                    $scope.page = objS.data.data.page;
                    $scope.totalPage = objS.data.data.total;
                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.clear = () => {
            $scope.myForm = {};
            $scope.getList(1);
        };

        $scope.getList();

        $scope.exportSheet = (data) => {
            var newData = $scope.list.map((v) => {
                return {
                    'Grower Name': v.growerId.firstName + ' ' + v.growerId.lastName,
                    'Commodity': v.commodityId.commodityName,
                    'Grade': v.gradeId.gradeName,
                    'Crop Year': v.cropYear,
                    'Phone': (v.growerId.phone || v.growerId.phonenumber) || '',
                    'Target Price': v.targetCWT + '/CWT',
                    'Bid price (Aug/Sep)': v.bidPriceCWT + '/CWT'
                };
            });
            var obj = {
                'data': newData,
                'fileName': moment().format('MM/DD/YYYY') + '_targetPriceReport.xlsx'
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
    });
