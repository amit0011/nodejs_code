angular.module('myApp.bagCategoryBalance', [])
    .controller('bagCategoryBalanceCtrl', function($scope, spinnerService, bagsHttpService, $rootScope, $state, apiUrl, $stateParams) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.baggings || !data.setting.baggings.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });


        $scope.bagCategoryId = $stateParams.bagCategoryId;
        $scope.active = {
            page: 'bagBalance'
        };
        $scope.addBagCount = {
            date: moment().format('YYYY-MM-DD'),
        };
        $scope.arr = [];
        $scope.bagsPlus = true;
        $scope.bagsInput = false;
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.initbagDetail = function() {
            spinnerService.show("html5spinner");
            bagsHttpService.bagCategoryBalanceData($scope.bagCategoryId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.bagCategory = res.data.bagCategory;
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

        $scope.saveBagCount = function() {
          $scope.addBagCount.noOfBags = +$scope.addBagCount.noOfBags;

          bagsHttpService.addBagInventory($scope.addBagCount, $scope.token).then(function(res) {
            if (res.data.status == 200) {
                $scope.initbagDetail();
                $scope.closepop();
                $scope.bagsPlus = false;
                $scope.bagsInput = true;
                $scope.addBagCount = {
                  date: moment().format('YYYY-MM-DD'),
                };
            } else {
                swal("Error", res.data.userMessage, "error");
            }
          });
        };

        $scope.updateBagCount = function() {
          $scope.addBagCount.bagCount = $scope.selectedBagCategory.bagCount + +$scope.addBagCount.noOfBags;
        };

        var startDate = moment().add(-1, "weeks");
        var endDate = moment();
        $scope.validateDate = function() {
            var matched = $scope.addBagCount.date && (date = moment($scope.addBagCount.date)) && date.isBetween(startDate, endDate, 'days', '[]');
            $scope.dateValidationMessage = '';
            if (!matched) {
                $scope.addBagCount.date = null;
            }
        };

        $scope.openBagCountPopup = function(bagCategory) {
            if (!$scope.selectedBagCategory || bagCategory._id !== $scope.selectedBagCategory._id) {
                $scope.addBagCount = {
                    date: moment().format('YYYY-MM-DD'),
                    bagCategoryId: bagCategory._id,
                    bagCount: bagCategory.bagCount,
                };
            }
            $scope.selectedBagCategory = bagCategory;
            $(".add_coomm.bag-count").fadeIn();
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
