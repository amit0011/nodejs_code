angular
  .module("myApp.container", [])
  .controller("containerCtrl", function(
    $scope,
    spinnerService,
    containerHttpServices,
    loadingPortHttpService,
    $rootScope,
    $state,
    commonService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.setting ||
        !data.setting.container ||
        !data.setting.container.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "container"
    };
    $scope.myForm = {
      incomingDate: new Date(),
      released: false,
    };
    $scope.arr = [];
    $scope.allChecked = true;
    $scope.countryPlus = true;
    $scope.containerInput = false;
    var pageNo = 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.releaseOptions = [
      {value: false, text: 'No'},
      {value: true, text: 'Yes'},
    ];

    $scope.initContainer = function(pageNo, filterData = {released: ''}) {
      spinnerService.show("html5spinner");
      containerHttpServices.searchContainer(Object.assign({page: pageNo}, filterData), $scope.token).then(function(res) {
        if (res.data.status == 200) {
          var c = null;
          var odate = null;
          $scope.containerList = res.data.data.docs.map(function(doc) {
            c = _.clone(doc);
            odate = c.outgoingDate ? c.outgoingDate : Date.now();
            c.noOfDays = commonService.getDuration(c.incomingDate, odate);
            return c;
          });
          $scope.page = res.data.data.page;
          $scope.totalPages = res.data.data.total;
        }
        spinnerService.hide("html5spinner");
      });
    };

    loadingPortHttpService.getLoadingPort('', $scope.token).then(function(res) {
      $scope.loadingPortList = res.data.status == 200 ? res.data.data : [];
    });

    $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
      $scope.searchContainer(page);
    };

    $scope.save = function(type) {
      var formData = Object.assign({}, $scope.myForm);
      var ctime = (new Date()).toISOString().split('T')[1];
      formData.incomingDate = formData.incomingDate + 'T' + ctime;

      if (type == "Submit") {
        containerHttpServices
          .addContainer(formData, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initContainer();
              $scope.closepop();
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      } else {
        containerHttpServices
          .updateContainer(formData, $scope.token)
          .then(function(res) {
            if (res.data.status == 200) {
              $scope.initContainer();
              $scope.closepop();
              $scope.countryPlus = false;
              $scope.containerInput = true;
            } else {
              swal("Error", res.data.userMessage, "error");
            }
          });
      }
    };

    $scope.searchContainer = function(page) {
      $scope.initContainer((page || 1), {search: $scope.containerNumber, released: $scope.containerReleased ? 1 : ''});
    };

    $scope.delete = function(id, status) {
      var newStatus = status == 0 ? 1 : 0;
      var msg = status == 0 ? "Deactivate" : "Recover";
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one container.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
          status: newStatus
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your want to " + msg + " this container!",
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
              containerHttpServices
                .removeContainer($scope.data, $scope.token)
                .then(function(res) {
                  if (res.data.status == 200) {
                    $scope.initContainer(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal(
                      msg + "!",
                      "Your container has been deactivate.",
                      "success"
                    );
                  }
                });
            } else {
              swal("Cancelled", "Your container file is safe :)", "error");
            }
          }
        );
      }
    };

    $scope.openPop = function(type, data) {
      $scope.selectedContainer = null;
      if (type == "edit") {
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.myForm.incomingDate = moment(data.incomingDate).format('YYYY-MM-DD');
        $scope.myForm.loadingPortId = data.loadingPortId ? data.loadingPortId._id : null;

        $(".add_coomm.country").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "add") {
        $scope.myForm = {
          incomingDate: moment().format("YYYY-MM-DD"),
          released: false,
        };
        $scope.inputField = type;
        $(".add_coomm.country").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == 'view-comment') {
        $scope.selectedContainer = data;
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
    $("body").on("click", ".popup_overlay", function() {
      $scope.closepop();
    });
  });
