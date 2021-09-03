angular.module('myApp.bagBalance', [])
    .controller('bagBalanceCtrl', function($scope, spinnerService, bagsHttpService, $rootScope, $state, apiUrl, $stateParams) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.baggings || !data.setting.baggings.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });


        $scope.bagId = $stateParams.bagId;
        $scope.active = {
            page: 'bagBalance'
        };
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initbagDetail = function() {
            spinnerService.show("html5spinner");
            bagsHttpService.bagBalanceData($scope.bagId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.bag = res.data.bag;
                    $scope.biList = res.data.bagInventories;
                }
                spinnerService.hide("html5spinner");
            });
        };
        $scope.initbagDetail();

        $scope.downloadExcel = function (url, data, file_name) {
          var request = new XMLHttpRequest();
          request.open("POST", apiUrl + url, true);
          request.responseType = "blob";
          request.setRequestHeader("Content-type", "application/json");
          request.setRequestHeader('authorization', 'Bearer ' + $scope.token);
          request.onload = function(e) {
              if (this.status === 200) {
                  var file = window.URL.createObjectURL(this.response);
                  var a = document.createElement("a");
                  a.href = file;
                  a.download = file_name;
                  document.body.appendChild(a);
                  a.click();
              }
          };
          request.send(data);
        };

        $scope.downloadBBExcel = function (bag) {
          $scope.downloadExcel('bagInventory/excel/bag-balance', JSON.stringify({bagId: bag._id}), 'bag-balance-excel.xlsx');
        };
    });
