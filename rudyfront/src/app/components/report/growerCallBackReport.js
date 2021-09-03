angular
  .module("myApp.growerCallBackReport", [])
  .controller("growerCallBackReportCtrl", function(
    $scope,
    spinnerService,
    reportHttpServices,
    sudAdminHttpService
  ) {
    // $scope.$on('access', (event, data) => {
    //     if (!data || !data.reports || !data.reports.callback || !data.reports.callback.view) {
    //         $rootScope.isLogin = false;
    //         localStorage.removeItem('token');
    //         localStorage.removeItem('loginUserInfo');
    //         $state.go('login');
    //         swal("ERROR", "Access denied", "error");
    //     }
    // });

    $scope.active = {
      page: "growerCallBackReport"
    };

    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.initGrower = function(pageNo) {
      spinnerService.show("html5spinner");
      reportHttpServices
        .getGrowerCallBack($scope.token, pageNo)
        .then(function(res) {
          if (res.data.status == 200) {
            $scope.growerCallBackList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            spinnerService.hide("html5spinner");
          }
        });
    };

    $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
      $scope.searchModel = JSON.parse(localStorage.getItem("growerSearch"));
      localStorage.setItem("grower_page", page);
      if (text == "clear") {
        localStorage.removeItem("growerSearch");
        $scope.initGrower(page);
        $scope.searchModel = {
          deleteStatus: 0
        };
      } else {
        $scope.initGrower(page);
        $scope.myForm = {};
      }
    };

    var pageNo = localStorage.getItem("buyer_page_No") || 1;
    sudAdminHttpService.getadmin(pageNo, $scope.token, "All").then(
      function(res) {
        if (res.data.status == 200) {
          spinnerService.hide("html5spinner");
          //console.log("hiii", res.data.data);
          $scope.adminsList = res.data.data;
        }
      },
      function(error) {
        console.log(JSON.stringify(error));
      }
    );

    $scope.search = function() {
      spinnerService.show("html5spinner");
      reportHttpServices
        .getGrowerCallBackSearch(
          pageNo,
          $scope.token,
          $scope.result.assignedUserId || ""
        )
        .then(
          function(res) {
            if (res.data.status == 200) {
              $scope.growerCallBackList = res.data.data.docs;
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
  });
