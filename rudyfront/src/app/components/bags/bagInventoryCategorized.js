angular.module('myApp.bagInventoryCategorized', [])
    .controller('bagInventoryCategorizedCtrl', function($scope, spinnerService, bagsHttpService, $rootScope, $state, apiUrl) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.setting || !data.setting.baggings || !data.setting.baggings.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'bagCategory'
        };
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.rcolumns = Array(12).fill(['Orders', 'Shipped', 'Bal on hand']).flat();

        $scope.months = [];
        var startDate = moment();
        var endDate = moment().add(360, 'days');
        $scope.todaysDate = startDate.format('DD-MMMM');
        $scope.bagInventoryMonthly = [];
        $scope.refText = '';

        while(startDate.isBefore(endDate)) {
          $scope.months.push({month: startDate.format('MMMM'), year: startDate.format('YYYY')});
          startDate = startDate.add(1, 'month');
        }

        $scope.initInventories = function(page) {
            spinnerService.show("html5spinner");
            var date = moment();
            bagsHttpService.bagInventoryCategorizedData($scope.token).then(function(res) {
              console.log(res.data.data);
                if (res.data.status == 200) {
                  $scope.bagInventories = res.data.data.map(function(bi) {
                    bi.sortedInventories = [];
                    var bagCount = bi.bagCount;
                    $scope.months.forEach(function(monthObj)  {
                      var monthNumber = date.month(monthObj.month).format('M');
                      var monthInventory = bi.inventory.filter(function(inventory) { return inventory._id.month == monthNumber; });

                      var projectedData = monthInventory.find(function(mi) { return mi._id.type === 'projected'; });
                      var projectedTotal = projectedData ? projectedData.total : 0;
                      bi.sortedInventories.push({value: projectedTotal, month: monthNumber, year: monthObj.year, type: 'projected', haveLink: Boolean(projectedTotal)});

                      var actualData = monthInventory.find(function(mi) { return mi._id.type === 'actual'; });
                      var actualTotal = actualData ? actualData.total : 0;
                      bi.sortedInventories.push({value: actualTotal, month: monthNumber, year: monthObj.year, type: 'actual', haveLink: Boolean(actualTotal)});

                      bagCount += projectedTotal;
                      bi.sortedInventories.push({value: bagCount, month: monthNumber, year: monthObj.year});
                    });
                    return bi;
                  });
                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.showDetail = function (valueObj, bag) {
          var data = {bagId: bag._id, month: valueObj.month, year: valueObj.year, type: valueObj.type};
          bagsHttpService.bagInventoryCategorizedDetailMonthly(data, $scope.token).then(function(res) {
            if (res.data.status == 200) {
              var refField = '';
              $scope.refText = '';
              switch(valueObj.type) {
                case 'projected':
                  refField = 'contractNumber';
                  $scope.refText = 'Contract Number';
                  break;

                case 'actual':
                  refField = 'ticketNumber';
                  $scope.refText = 'Ticket Number';
                  break;
              }

              $scope.bagInventoryMonthly = res.data.data.map(function(bi) {
                return {
                  noOfBags: bi.noOfBags,
                  date: bi.date,
                  refNumber: bi.meta[refField],
                };
              });

              $(".add_coomm.bag-count").fadeIn();
              $(".popup_overlay").fadeIn();
            }
          });
        };

        $scope.initInventories();

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

        $scope.downloadInventoryExcel = function () {
          $scope.downloadExcel('bagInventory/excel/bag-inventory?type=categorized', '', 'bag-inventory-categorized-excel.xlsx');
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
