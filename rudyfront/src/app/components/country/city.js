angular
  .module("myApp.city", [])
  .controller("cityCtrl", function(
    $scope,
    spinnerService,
    cityHttpServices,
    countryHttpService,
    $rootScope,
    $state
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.setting ||
        !data.setting.city ||
        !data.setting.city.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "city"
    };
    $scope.myForm = {};
    $scope.arr = [];
    $scope.allChecked = true;
    $scope.countryPlus = true;
    $scope.cityInput = false;
    var i, item;
    var pageNo = 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.initCity = function(pageNo) {
      spinnerService.show("html5spinner");
      cityHttpServices.getCity(pageNo, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.cityList = res.data.data.docs;
          $scope.page = res.data.data.page;
          $scope.totalPages = res.data.data.total;
        }
        spinnerService.hide("html5spinner");
      });
    };

    countryHttpService.getCountryList($scope.token).then(function(res) {
      if (res.data.status == 200) {
        $scope.countryList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
      $scope.initCity(page);
      cityHttpServices.getCity(pageNo, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.updatedList = {};
          res.data.data.docs.forEach(val => {
            if ($scope.updatedList[val.country]) {
              $scope.updatedList[val.country].push({
                model: val.city
              });
            } else {
              $scope.updatedList[val.country] = [
                {
                  model: val.city
                }
              ];
            }
          });
          var arrayObjectData = [];
          angular.forEach($scope.updatedList, (value, key) => {
            arrayObjectData.push({
              country: key
            });
          });
          $scope.countries = arrayObjectData;
        }
        spinnerService.hide("html5spinner");
      });
    };

    $scope.save = function(type) {
      if (type == "Submit") {
        cityHttpServices
          .addCity($scope.myForm, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initCity();
              $scope.closepop();
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      } else {
        cityHttpServices
          .updateCity($scope.myForm, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initCity();
              $scope.closepop();
              $scope.countryPlus = false;
              $scope.cityInput = true;
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      }
    };

    $scope.searchCity = () => {
      cityHttpServices
        .searchCity(pageNo, $scope.cityName, $scope.token)
        .then(function(res) {
          if (res.data.status == 200) {
            $scope.cityList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            spinnerService.hide("html5spinner");
          }
        });
    };

    $scope.delete = function(id, status) {
      var newStatus = status == 0 ? 1 : 0;
      var msg = status == 0 ? "Deactivate" : "Recover";
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one country.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
          status: newStatus
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your want to " + msg + " this country!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, " + msg + " it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false
          },
          function(isConfirm) {
            if (isConfirm) {
              cityHttpServices
                .removeCity($scope.data, $scope.token)
                .then(function(res) {
                  if (res.data.status == 200) {
                    $scope.initCity(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal(
                      msg + "!",
                      "Your city has been deactivate.",
                      "success"
                    );
                  }
                });
            } else {
              swal("Cancelled", "Your country file is safe :)", "error");
            }
          }
        );
      }
    };

    $scope.openPop = function(type, data) {
      if (type == "edit") {
        $scope.inputField = type;
        $scope.myForm = data;
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "add") {
        $scope.myForm = {};
        $scope.inputField = type;
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        $scope.inputField = type;
        $scope.myForm = data;
        $(".add_coomm").fadeIn();
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
    $("body").on("click", ".popup_overlay", function() {
      $scope.closepop();
    });
  });
