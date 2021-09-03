angular
  .module("myApp.growers", [])
  .controller("growersCtrl", function(
    $scope,
    $http,
    spinnerService,
    httpService,
    countryHttpService,
    $log,
    $rootScope,
    $state,
    jsonService,
    apiUrl
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.purchase ||
        !data.purchase.growers ||
        !data.purchase.growers.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "growers"
    };
    $scope.searchModel = {
      deleteStatus: "0"
    };
    $scope.arr = [];
    $scope.allChecked = true;
    var i, item;
    var pageNo = localStorage.getItem("grower_page") || 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.resetFarm = () => {
      $scope.myForm = {
        farmNames: [],
      };
    };
    $scope.resetFarm();
    $scope.initGrower = function(pageNo) {
      spinnerService.show("html5spinner");
      httpService.getGrower(pageNo, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.growerList = res.data.data.docs;
          $scope.page = res.data.data.page;
          $scope.totalPages = res.data.data.total;
          spinnerService.hide("html5spinner");
        }
      });
    };

    $scope.townList = [];

    jsonService.getTownList($scope.token).then(function(res) {
      $scope.townList =
        res.data.status == 200
          ? res.data.data.docs.map(function(town) {
              return town.name;
            })
          : [];
    });

    // code for country list
    countryHttpService.getCountryList($scope.token).then(function(res) {
      if (res.data.status == 200) {
        $scope.countryList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {

      page = page || pageNo;
      localStorage.setItem("grower_page", page);
      if (text == "clear") {
        localStorage.removeItem("growerSearch");
      }
      $scope.searchModel = JSON.parse(localStorage.getItem("growerSearch")) || {};
      $scope.searchModel.deleteStatus = $scope.searchModel.deleteStatus || "0";

      if ($scope.searchModel) {
        if (
          $scope.searchModel.firstName ||
          $scope.searchModel.lastName ||
          $scope.searchModel.phone ||
          $scope.searchModel.town ||
          $scope.searchModel.farmName ||
          $scope.searchModel.postalCode ||
          $scope.searchModel.deleteStatus ||
          $scope.searchModel.type
        ) {
          $scope.search($scope.myForm, page);
        } else {
          $scope.initGrower(page);
          $scope.resetFarm();
        }
      } else {
        $scope.initGrower(page);
        $scope.resetFarm();
      }
    };

    $scope.removeFarm = function(index) {
      $scope.myForm.farmNames.splice(index, 1);
    };

    $scope.manageFarms = (evnt) => {
      if ($scope.myForm.farmName) {
        (
          $scope.myForm.farmName !== $scope.myForm.farmNames[0] &&
          !$scope.myForm.farmNames.includes($scope.myForm.farmName)
        ) && $scope.myForm.farmNames.unshift($scope.myForm.farmName);

        if (evnt === 'enter') return ($scope.myForm.farmName = '');
      }

      if (evnt === 'blur') {
        if ($scope.myForm.farmNames[0]) {
          $scope.myForm.farmName = $scope.myForm.farmNames[0];
        }
      }
    };
    $scope.uploadGrower = function(input) {
      var file = input.files[0];
      $scope.myForm.filePath = file;
      var data = {
        filePath: $scope.myForm.filePath
      };
      if (data) {
        spinnerService.show("html5spinner");
        httpService.uploadGrower(data, $scope.token).then(function(res) {
          if (res.data.status == 200) {
            $scope.initGrower($scope.page);
          } else {
            swal("Error", res.data.userMessage, "error");
          }
          spinnerService.hide("html5spinner");
        });
      } else {
        console.log("select file");
      }
    };
    $scope.selected = {};
    $scope.selectAll = function() {
      $scope.arr = [];
      if ($scope.allChecked) {
        for (i = 0; i < $scope.growerList.length; i++) {
          item = $scope.growerList[i];
          $scope.selected[item._id] = true;
          $scope.arr.push($scope.growerList[i]._id);
          $scope.allChecked = false;
        }
      } else {
        for (i = 0; i < $scope.growerList.length; i++) {
          item = $scope.growerList[i];
          $scope.selected[item._id] = false;
          $scope.arr.pop($scope.growerList[i]._id);
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

    $scope.save = function() {
      $scope.manageFarms('blur');
      $scope.myForm.addresses = [
        {
          street: $scope.myForm.street,
          town: $scope.myForm.town,
          province: $scope.myForm.province,
          postal: $scope.myForm.postal,
          rm: $scope.myForm.rm,
          country: $scope.myForm.country
        }
      ];
      $scope.myForm.fullAddress = $scope.myForm.street;
      httpService.addGrower($scope.myForm, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.initGrower(1);
          $scope.closepop();
          $("#analysisFrom").trigger("reset");
        } else {
          swal("ERROR", res.data.userMessage, "error");
        }
      });
    };

    $scope.saveChanges = function() {
      $scope.myForm.addresses = [
        {
          street: $scope.myForm.street,
          town: $scope.myForm.town,
          province: $scope.myForm.province,
          postal: $scope.myForm.postal,
          rm: $scope.myForm.rm,
          country: $scope.myForm.country
        }
      ];
      $scope.myForm.fullAddress = $scope.myForm.street;
      httpService.updateGrower($scope.myForm, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.DoCtrlPagingAct("", $scope.page);
          $scope.closepop();
        } else {
          swal("ERROR", res.data.userMessage, "error");
        }
      });
    };

    $scope.search = function(growerSearch, pageNo) {
      spinnerService.show("html5spinner");
      localStorage.setItem("growerSearch", JSON.stringify($scope.searchModel));
      httpService
        .getGrowerSearch(pageNo, $scope.searchModel, $scope.token)
        .then(function(res) {
          if (res.data.status == 200) {
            $scope.growerList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            spinnerService.hide("html5spinner");
          }
        });
    };

    $scope.delete = function(id, status) {
      var newStatus = status == 0 ? 1 : 0;
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one grower.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
          status: newStatus
        };
        swal(
          {
            title: "Are you sure?",
            text: `Your want be ${
              status == 0 ? "deactivate" : "activate"
            } this grower!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: `Yes, ${
              status == 0 ? "deactivate" : "activate"
            } it!`,
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false
          },
          function(isConfirm) {
            if (isConfirm) {
              httpService
                .removeGrower($scope.data, $scope.token)
                .then(function(res) {
                  if (res.data.status == 200) {
                    $scope.initGrower(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal({
                      title: "Deleted!",
                      text: `Your grower has been ${
                        status == 0 ? "deactivated" : "activated"
                      }.`,
                      type: "success",
                      timer: 2000
                    });
                  }
                });
            } else {
              swal({
                title: "Cancelled!",
                text: "Your grower file is safe :)",
                type: "error",
                timer: 1000
              });
            }
          }
        );
      }
    };

    $scope.exportSheet = () => {
      var obj = {
        fileName: "grower_list.xlsx",
        filter: $scope.searchModel
      };
      $scope.exporting = true;
      var request = new XMLHttpRequest();
      request.open("POST", apiUrl + "grower/exportAll", true);
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
    };

    $scope.openPop = function(data, type) {
      if (type == "view") {
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = angular.copy(data);
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.town = data.addresses[0].town;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.rm = data.addresses[0].rm;
        $scope.myForm.country = data.addresses[0].country;
      } else if (type == "edit") {
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = angular.copy(data);
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.town = data.addresses[0].town;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.rm = data.addresses[0].rm;
        $scope.myForm.country = data.addresses[0].country;
      } else {
        $scope.resetFarm();
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      }

      if (!($scope.myForm.farmNames && Array.isArray($scope.myForm.farmNames))) {
        $scope.myForm.farmNames = [];
      }

      if ($scope.myForm.farmName && $scope.myForm.farmNames.length === 0) {
        $scope.myForm.farmNames.unshift($scope.myForm.farmName);
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
