angular
  .module("myApp.failedQuotes", [])
  .controller("failedQuotesCtrl", function(
    $scope,
    $rootScope,
    spinnerService,
    reportHttpServices,
    $state,
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.reports ||
        !data.reports.commission ||
        !data.reports.commission.view
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "failedQuotes"
    };

    $scope.myForm = {date: moment().format('YYYY-MM-DD')};
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.initList = function() {
      spinnerService.show("html5spinner");

      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.date = moment(searchParam.date).utc().startOf('day').toISOString();
      reportHttpServices
        .failedQuotesReport(searchParam, $scope.token)
        .then(objS => {
          spinnerService.hide("html5spinner");

          if (objS.data.status == 200) {
            $scope.list = objS.data.data;
          }
        });
    };

    $scope.buyerDetails = function(buyerId) {
      if ($rootScope.loginUserAccess.sales.buyers.view) {
        $state.go("buyerDetails", {
          buyerId: buyerId
        });
      }
    };

    $scope.clear = () => {
      $scope.myForm = {};
      $scope.initList(1);
    };

    $scope.initList();
  });
