angular
  .module("myApp.bagCategory", [])
  .controller("bagCategoryCtrl", function (
    $scope,
    spinnerService,
    bagsHttpService,
    $state
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.setting ||
        !data.setting.bagCategory ||
        !data.setting.bagCategory.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "bagCategory",
    };
    $scope.addBagCount = {
      date: moment().format("YYYY-MM-DD"),
    };
    $scope.myForm = {};
    $scope.arr = [];
    $scope.allChecked = true;
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.initBagCategory = function (pageNo) {
      spinnerService.show("html5spinner");
      bagsHttpService
        .getBagCategories($scope.token, pageNo || $scope.page, $scope.term)
        .then(function (res) {
          if (res.data.status == 200) {
            spinnerService.hide("html5spinner");
            $scope.bagCategories = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
          } else {
            spinnerService.hide("html5spinner");
          }
        });
    };

    $scope.gotoInventoryCategorized = function () {
      $state.go("bagInventoryCategorized");
    };
    $scope.DoCtrlPagingAct = function (text, page, pageSize, total) {
      $scope.initBagCategory(page);
    };
    $scope.save = function (type) {
      if (type == "Submit") {
        bagsHttpService
          .addBagCategory($scope.myForm, $scope.token)
          .then(function (res) {
            if (res.data.status == 200) {
              $scope.initBagCategory();
              $scope.closepop();
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      } else {
        bagsHttpService
          .updateBagCategory($scope.myForm, $scope.token)
          .then(function (res) {
            if (res.data.status == 200) {
              $scope.initBagCategory();
              $scope.closepop();
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      }
    };

    var startDate = moment().add(-1, "weeks");
    var endDate = moment();
    $scope.validateDate = function () {
      var matched =
        $scope.addBagCount.date &&
        (date = moment($scope.addBagCount.date)) &&
        date.isBetween(startDate, endDate, "days", "[]");
      $scope.dateValidationMessage = "";
      if (!matched) {
        $scope.addBagCount.date = null;
      }
    };
    $scope.updateBagCount = function () {
      $scope.addBagCount.bagCount =
        $scope.selectedBagCategory.bagCount + +$scope.addBagCount.noOfBags;
    };
    $scope.saveBagCount = function () {
      $scope.addBagCount.noOfBags = +$scope.addBagCount.noOfBags;

      bagsHttpService
        .addBagInventory($scope.addBagCount, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.initBagCategory();
            $scope.closepop();
            $scope.bagsPlus = false;
            $scope.bagsInput = true;
            $scope.addBagCount = {
              date: moment().format("YYYY-MM-DD"),
            };
          } else {
            swal("Error", res.data.userMessage, "error");
          }
        });
    };
    $scope.delete = function (id) {
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one bag category.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your will not be able to recover this bag category!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              bagsHttpService
                .removeBagCategory($scope.data, $scope.token)
                .then(function (res) {
                  if (res.data.status == 200) {
                    $scope.initBagCategory();
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal(
                      "Deleted!",
                      "Your bag category has been deleted.",
                      "success"
                    );
                  }
                });
            } else {
              swal("Cancelled", "Your bag category file is safe :)", "error");
            }
          }
        );
      }
    };

    $scope.openBagCountPopup = function (bagCategory) {
      if (!$scope.selectedBagCategory || bagCategory._id !== $scope.selectedBagCategory._id) {
        $scope.addBagCount = {
          date: moment().format("YYYY-MM-DD"),
          bagCategoryId: bagCategory._id,
          // bagCategoryName: bagCategory.name,
          bagCount: bagCategory.bagCount,
        };
      }
      $scope.selectedBagCategory = bagCategory;
      $(".add_coomm.bag-count").fadeIn();
      $(".popup_overlay").fadeIn();
    };
    $scope.openPop = function (type, data) {
      $scope.hideBagCount = false;
      if (type == "edit") {
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.hideBagCount = true;
        $(".add_coomm.analysis").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "add") {
        $scope.myForm = {};
        $scope.inputField = type;
        $(".add_coomm.analysis").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $(".add_coomm.analysis").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };
    $scope.closepop = function () {
      $(".add_coomm").fadeOut();
      $(".popup_overlay").fadeOut();
    };
    $(".popup_overlay , .close").click(function () {
      $(".add_coomm").fadeOut();
      $(".popup_overlay").fadeOut();
    });
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });
  });
