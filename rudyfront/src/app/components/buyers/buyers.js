angular
  .module("myApp.buyers", [])
  .controller("buyersCtrl", function(
    $scope,
    buyerHttpServices,
    $rootScope,
    spinnerService,
    $state,
    $stateParams,
    countryHttpService,
    sudAdminHttpService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.sales ||
        !data.sales.buyers ||
        !data.sales.buyers.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.buyerDetails = buyerId => {
      if ($rootScope.loginUserAccess.sales.buyers.view) {
        $state.go("buyerDetails", {
          buyerId: buyerId
        });
      }
    };

    $scope.token = JSON.parse(localStorage.getItem("token"));
    // code for country list
    countryHttpService.getCountryList($scope.token).then(function(res) {
      if (res.data.status == 200) {
        $scope.countryList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    $scope.checkValueLength = key => {
      if ($scope.myForm[key]) {
        var copy_value = angular.copy($scope.myForm[key]).toString();
        if (copy_value.length > 17) {
          var new_value = copy_value.substring(0, 17);
          $scope.myForm[key] = Number(new_value);
        }
      }
    };

    $scope.active = {
      page: "buyers"
    };
    $scope.myForm = {
      limit: 10,
    };
    $scope.arr = [];
    $scope.allChecked = true;
    var i, item;
    var pageNo = localStorage.getItem("buyer_page_No") || 1;
    $scope.buyerId = $stateParams.buyerId;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    sudAdminHttpService.getadmin(pageNo, $scope.token, "All").then(
      function(res) {
        if (res.data.status == 200) {
          spinnerService.hide("html5spinner");
          $scope.adminsList = res.data.data;
        } else {
          spinnerService.hide("html5spinner");
        }
      },
      function(error) {
        // console.log(JSON.stringify(error));
      }
    );
    $scope.search = function(page) {
      localStorage.setItem("buyer_page_filter", JSON.stringify($scope.myForm));
      localStorage.setItem("buyer_page_No", page);
      spinnerService.show("html5spinner");
      buyerHttpServices.getBuyerSearch(page, $scope.myForm, $scope.token).then(
        function(res) {
          if (res.data.status == 200) {
            $scope.buyerList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.pageLimit = res.data.data.limit;
            $scope.totalPages = res.data.data.total;
            spinnerService.hide("html5spinner");
          } else {
            swal("Error", res.data.userMessage, "error");
            spinnerService.hide("html5spinner");
          }
        },
        function(error) {
          //console.log(JSON.stringify(error));
        }
      );
    };

    $scope.clear = () => {
      localStorage.removeItem("buyer_page_filter");
      localStorage.setItem("buyer_page_No", 1);
      $scope.myForm = {};
      $scope.initBuyer(1);
    };
    $scope.initBuyer = function(pageNo) {
      spinnerService.show("html5spinner");
      buyerHttpServices.getBuyer(pageNo, $scope.token).then(
        function(res) {
          if (res.data.status == 200) {
            $scope.buyerList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            spinnerService.hide("html5spinner");
          }
        },
        function(error) {
          //console.log(JSON.stringify(error));
        }
      );
    };
    $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
      page = page || pageNo;
      localStorage.setItem("buyer_page_No", page);
      var prev_filter = localStorage.getItem("buyer_page_filter");
      if (prev_filter) {
        $scope.myForm = JSON.parse(prev_filter);
      } else {
        $scope.myForm = {};
      }

      var keys = Object.keys($scope.myForm);

      if (keys.length) {
        $scope.search(page);
      } else {
        $scope.initBuyer(page);
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
        buyerHttpServices.uploadBuyer(data, $scope.token).then(
          function(res) {
            if (res.data.status == 200) {
              $scope.initBuyer(pageNo);
              spinnerService.hide("html5spinner");
            } else {
              spinnerService.hide("html5spinner");
              swal("Error", res.data.userMessage, "error");
            }
          },
          function(error) {
            //console.log(JSON.stringify(error));
          }
        );
      } else {
        console.log("select file");
      }
    };
    $scope.selected = {};
    $scope.selectAll = function() {
      $scope.arr = [];
      if ($scope.allChecked) {
        for (i = 0; i < $scope.buyerList.length; i++) {
          item = $scope.buyerList[i];
          $scope.selected[item._id] = true;
          $scope.arr.push($scope.buyerList[i]._id);
          $scope.allChecked = false;
        }
      } else {
        for (i = 0; i < $scope.buyerList.length; i++) {
          item = $scope.buyerList[i];
          $scope.selected[item._id] = false;
          $scope.arr.pop($scope.buyerList[i]._id);
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
      $scope.myForm.addresses = [
        {
          street: $scope.myForm.street,
          line2: $scope.myForm.line2,
          line3: $scope.myForm.line3,
          city: $scope.myForm.city,
          province: $scope.myForm.province,
          postal: $scope.myForm.postal,
          country: $scope.myForm.country
        }
      ];
      $scope.myForm.fullAddress = $scope.myForm.street;
      buyerHttpServices.addBuyer($scope.myForm, $scope.token).then(
        function(res) {
          if (res.data.status == 200) {
            $scope.initBuyer(1);
            $scope.myForm = "";
            $scope.closepop();
            $("#analysisFrom").trigger("reset");
          } else {
            swal("Message", res.data.userMessage, "success");
          }
        },
        function(error) {
          //console.log(JSON.stringify(error));
        }
      );
    };

    $scope.assignUserFunction = data => {
      var req = {
        _id: data._id,
        assignedUserId: data.assignedUserId
      };

      buyerHttpServices.assignUser(req, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          swal("SUCCESS", res.data.userMessage, "success");
        } else {
          swal("ERROR", res.data.userMessage, "error");
        }
      });
    };

    $scope.saveChanges = function(type) {
      if (type != "assign") {
        $scope.myForm.addresses = [
          {
            street: $scope.myForm.street,
            line2: $scope.myForm.line2,
            line3: $scope.myForm.line3,
            city: $scope.myForm.city,
            province: $scope.myForm.province,
            postal: $scope.myForm.postal,
            country: $scope.myForm.country
          }
        ];
        $scope.myForm.fullAddress = $scope.myForm.street;
      }
      buyerHttpServices.updateBuyer($scope.myForm, $scope.token).then(
        function(res) {
          if (res.data.status == 200) {
            $scope.closepop();
          } else {
            swal("ERROR", res.data.userMessage, "error");
          }
        },
        function(error) {
          // console.log(JSON.stringify(error));
        }
      );
    };

    $scope.delete = function(id) {
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one buyer.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your will not be able to recover this buyer!",
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
              buyerHttpServices.removeBuyer($scope.data, $scope.token).then(
                function(res) {
                  if (res.data.status == 200) {
                    $scope.initBuyer(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal({
                      title: "Deleted!",
                      text: "Your buyer has been deleted.",
                      type: "success",
                      timer: 2000
                    });
                  }
                },
                function(error) {
                  //console.log(JSON.stringify(error));
                }
              );
            } else {
              swal({
                title: "Cancelled!",
                text: "Your buyer info is safe :)",
                type: "error",
                timer: 1000
              });
            }
          }
        );
      }
    };
    $scope.openPop = function(data, type) {
      if (type == "view") {
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.myForm.phone = data.phone ? Number(data.phone) : "";
        $scope.myForm.cellNumber = data.cellNumber
          ? Number(data.cellNumber)
          : "";
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.line2 = data.addresses[0].line2;
        $scope.myForm.line3 = data.addresses[0].line3;
        $scope.myForm.city = data.addresses[0].city;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.country = data.addresses[0].country;
      } else if (type == "edit") {
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = data;
        $scope.myForm.phone = data.phone ? Number(data.phone) : "";
        $scope.myForm.cellNumber = data.cellNumber
          ? Number(data.cellNumber)
          : "";
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.line2 = data.addresses[0].line2;
        $scope.myForm.line3 = data.addresses[0].line3;
        $scope.myForm.city = data.addresses[0].city;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.country = data.addresses[0].country;
      } else {
        $scope.myForm = {};
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
