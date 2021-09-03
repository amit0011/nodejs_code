angular
  .module("myApp.country", [])
  .controller("countryCtrl", function(
    $scope,
    spinnerService,
    countryHttpService,
    $rootScope,
    $state,
    documentsHttpService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.setting ||
        !data.setting.country ||
        !data.setting.country.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "country"
    };
    $scope.myForm = {};
    $scope.arr = [];
    $scope.allChecked = true;
    $scope.countryPlus = true;
    $scope.countryInput = false;
    $scope.newForm = {
      selectedDocuments: [],
    };
    var i, item;
    var pageNo = 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.initCountry = function(pageNo) {
      spinnerService.show("html5spinner");
      countryHttpService.getCountry(pageNo, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.countryList = res.data.data.docs;
          $scope.page = res.data.data.page;
          $scope.totalPages = res.data.data.total;
        }
        spinnerService.hide("html5spinner");
      });
    };


    $scope.initdocuments = () => {
      $scope.documentsList = [];
      documentsHttpService.getdocuments($scope.token).then(function (res) {
        $scope.documentsList = res.data.status == 200 ? res.data.data : [];
      });
    };

    $scope.initdocuments();
    $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
      $scope.initCountry(page);
      countryHttpService.getCountryList($scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.updatedList = {};
          res.data.data.forEach(val => {
            if ($scope.updatedList[val.country]) {
              $scope.updatedList[val.country].push({
                model: val.name + " - " + val.city
              });
            } else {
              $scope.updatedList[val.country] = [
                {
                  model: val.name + " - " + val.city
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
    $scope.plusCountry = function(type) {
      if (type == "close") {
        $scope.countryPlus = true;
        $scope.countryInput = false;
      } else {
        $scope.countryPlus = false;
        $scope.countryInput = true;
      }
    };
    $scope.changethumbnail = function(input) {
      var file = input.files[0];
      $scope.myForm.filePath = file;
      var data = {
        filePath: $scope.myForm.filePath
      };
      if (data) {
        spinnerService.show("html5spinner");
        countryHttpService
          .uploadCountry(data, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initCountry(pageNo);
            } else {
              swal("Error", res.data.userMessage, "error");
            }
            spinnerService.hide("html5spinner");
          });
      } else {
        console.log("select file");
      }
    };
    $scope.save = function(type) {
      $scope.myForm.documents = $scope.newForm.selectedDocuments.map(
        (val) => val._id
      );
      if (type == "Submit") {
        countryHttpService
          .addCountry($scope.myForm, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initCountry();
              $scope.closepop();
              $scope.countryPlus = false;
              $scope.countryInput = true;
              $scope.newForm.selectedDocuments = [];
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      } else {
        countryHttpService
          .updateCountry($scope.myForm, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initCountry();
              $scope.closepop();
              $scope.countryPlus = false;
              $scope.countryInput = true;
              $scope.newForm.selectedDocuments = [];
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      }
    };

    $scope.selected = {};
    $scope.selectAll = function() {
      $scope.arr = [];
      if ($scope.allChecked) {
        for (i = 0; i < $scope.countryList.length; i++) {
          item = $scope.countryList[i];
          $scope.selected[item._id] = true;
          $scope.arr.push($scope.countryList[i]._id);
          $scope.allChecked = false;
        }
      } else {
        for (i = 0; i < $scope.countryList.length; i++) {
          item = $scope.countryList[i];
          $scope.selected[item._id] = false;
          $scope.arr.pop($scope.countryList[i]._id);
          $scope.allChecked = true;
        }
      }
    };
    $scope.checkBox = function(id) {
      if ($scope.arr.indexOf(id) > -1) {
        $scope.arr.splice(id, 1);
      } else {
        $scope.arr.push(id);
      }
    };

    $scope.searchCity = () => {
      countryHttpService
        .searchCountry(pageNo, $scope.cityName, $scope.token)
        .then(function(res) {
          if (res.data.status == 200) {
            $scope.countryList = res.data.data.docs;
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
              countryHttpService
                .removeCountry($scope.data, $scope.token)
                .then(function(res) {
                  if (res.data.status == 200) {
                    $scope.initCountry(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal(
                      msg + "!",
                      "Your country has been deactivate.",
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
        $scope.newForm.selectedDocuments = [];
        $scope.documentsList.forEach((val) => {
          val.ticked = false;
          $scope.myForm.documents && $scope.myForm.documents.forEach((val1) => {
            if (val._id == val1) {
              val.ticked = true;
              $scope.newForm.selectedDocuments.push(val1);
            }
          });
        });

        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "add") {
        $scope.myForm = {};
        $scope.newForm.selectedDocuments = [];
        $scope.documentsList.forEach((val) => {
          val.ticked = false;
        });
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
