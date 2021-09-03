angular.module('myApp.bags', [])
    .controller('bagsCtrl', function($scope, spinnerService, bagsHttpService, $rootScope, $state, apiUrl) {

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
            page: 'bags'
        };
        $scope.myForm = {
          alertCount: 0,
        };
        $scope.arr = [];
        $scope.bagsPlus = true;
        $scope.bagsInput = false;
        var i, item;
        var pageNo = 1;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));
        $scope.initbags = function(page) {
            spinnerService.show("html5spinner");
            bagsHttpService.getbags((page || pageNo), $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.bagsList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.initBagCategory = function () {
          spinnerService.show("html5spinner");
          bagsHttpService
            .getBagCategories($scope.token)
            .then(function (res) {
              if (res.data.status == 200) {
                spinnerService.hide("html5spinner");
                $scope.bagCategories = res.data.data;
                console.log($scope.bagCategories);
              } else {
                spinnerService.hide("html5spinner");
              }
            });
        };

        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
          pageNo = page;
          $scope.initbags(page);
        };

        $scope.plusbags = function(type) {
            if (type == 'close') {
                $scope.bagsPlus = true;
                $scope.bagsInput = false;
            } else {
                $scope.bagsPlus = false;
                $scope.bagsInput = true;
            }
        };
        $scope.save = function(type) {
            $scope.myForm.bagWeight = +$scope.myForm.bagWeight;
            $scope.myForm.bagCount = +$scope.myForm.bagCount;
            $scope.myForm.alertCount = +$scope.myForm.alertCount;

            if (type == 'Submit') {
                bagsHttpService.addbags($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initbags();
                        $scope.closepop();
                        $scope.bagsPlus = false;
                        $scope.bagsInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                bagsHttpService.updatebags($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initbags();
                        $scope.closepop();
                        $scope.bagsPlus = false;
                        $scope.bagsInput = true;
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            }
        };

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
          $scope.downloadExcel('bagInventory/excel/bag-inventory', '', 'bag-inventory-excel.xlsx');
        };

        $scope.searchCity = () => {
            bagsHttpService.searchbags(pageNo, $scope.cityName, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.bagsList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    spinnerService.hide("html5spinner");
                }
            });
        };

        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one bags.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this bags!",
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
                            bagsHttpService.removebags($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initbags(pageNo);
                                    $scope.arr = [];
                                    swal("Deleted!", "Your bags has been deleted.", "success");
                                }
                            });
                        } else {
                            swal("Cancelled", "Your bags file is safe :)", "error");
                        }
                    });
            }
        };

        $scope.gotoInventory = function() {
          $state.go('bagInventory');
        };

        $scope.update = function(what) {
          var url = null;
          switch (what) {
            case 'BagCount':
              url = 'bag/updateBagCount';
              break;

            case 'OpeningInventory':
              url = 'bag/updateOpeningInventory';
              break;
          }
          if (url) {
            spinnerService.show("html5spinner");
            bagsHttpService.udpateBagData(url, $scope.token).then(function(res) {
              spinnerService.hide("html5spinner");
              if (res.data.status === 200) {
                swal("Information!", res.data.userMessage, "success");
              } else {
                swal("Error!", 'Something went wrong', "error");
              }
            });
          }
        };

        $scope.openPop = function(type, data) {
            if (!$scope.bagCategories) {
              $scope.initBagCategory();
            }
            if (type == 'edit') {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.alertCount = +$scope.myForm.alertCount || 0;
                $scope.myForm.category = $scope.myForm.category ? $scope.myForm.category._id : null;
                $(".add_coomm.country").fadeIn();
                $(".popup_overlay").fadeIn();
            } else if (type == 'add') {
                $scope.myForm = {
                  alertCount: 0,
                };
                $scope.inputField = type;
                $(".add_coomm.country").fadeIn();
                $(".popup_overlay").fadeIn();
            } else {
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $(".add_coomm.country").fadeIn();
                $(".popup_overlay").fadeIn();
            }
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
