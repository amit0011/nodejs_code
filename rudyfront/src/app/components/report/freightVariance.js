angular
  .module("myApp.freightVariance", [])
  .controller("freightVarianceCtrl", function (
    apiUrl,
    $scope,
    $rootScope,
    spinnerService,
    reportHttpServices,
    $state,
    $window,
    commonService
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
      page: "freightVariance",
    };

    $scope.myForm = { ticketType: 'Outgoing', limit: '10' };
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.editMode = function (ticket) {
      $scope.selectedTicket = angular.copy(ticket);
      ticket.inEditMode = !ticket.inEditMode;
    };

    $scope.save = function (ticket) {
      if (!ticket.actual.miscFreightCharge && ticket.actual.miscFreightCharge !== 0) {
        swal("Error", "'Total Misc Freight Charges' is required field.", "error");
        return;
      }

      var data = {
        ticketId: ticket._id,
        actual: ticket.actual,
      };

      reportHttpServices.updateScaleActualData(data, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.initList($scope.page);
            swal("success", "Ticket updated successfully", "success");
          }
        },
        function (error) {
          swal("ERROR", "Something went wrong", "error");
        }
      );
    };

    $scope.cancel = function (ticket) {
      ticket.actual = $scope.selectedTicket.actual;
      ticket.inEditMode = !ticket.inEditMode;
    };

    $scope.initList = function (page) {
      spinnerService.show("html5spinner");

      var searchParam = Object.assign({}, $scope.myForm);
      if (page) {
        searchParam.page = page;
      }
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");

      reportHttpServices
        .freightVarianceReport(searchParam, $scope.token)
        .then((res) => {
          spinnerService.hide("html5spinner");

          if (res.data.status == 200) {
            $scope.freightVarianceTotal = 0;
            $scope.tickets = res.data.data.docs ? res.data.data.docs.map(ticket => {
              ticket.sales_contract = ticket.sales_contract || {};
              ticket.budgeted_inland = ticket.sales_contract.inlineFreightCWT * 22.0462 * ticket.unloadWeidhtMT;
              ticket.budgeted_inland_adj_cad = ticket.sales_contract.oceanFreightBL * ticket.sales_contract.exchangeRate;
              ticket.budgeted_inland_total_cad = ticket.budgeted_inland + ticket.budgeted_inland_adj_cad;

              ticket.actual = ticket.actual || {};
              ticket.actual.usd_cad_stamp_fx = ticket.actual.oceanUSD ? (ticket.actual.oceanUSD * ticket.sales_contract.exchangeRate) : '';
              ticket.actual.total_cad_actual = (+ticket.actual.inland + +ticket.actual.usd_cad_stamp_fx + +ticket.actual.miscFreightCharge) || '';
              ticket.freightVariance = (ticket.actual.inland && ticket.actual.oceanUSD && ticket.actual.miscFreightCharge) ? (ticket.actual.total_cad_actual - ticket.budgeted_inland_total_cad) : 0;
              $scope.freightVarianceTotal += ticket.freightVariance;

              return ticket;
            }) : [];
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.pages;
          }
        });
    };

    $scope.buyerDetails = function (buyerId) {
      if ($rootScope.loginUserAccess.sales.buyers.view) {
        $state.go("buyerDetails", {
          buyerId: buyerId,
        });
      }
    };

    $scope.openPdf = (pdf) => {
      if (pdf) $window.open(pdf, "_blank");
    };

    $scope.exportSheet = function() {
      var request = new XMLHttpRequest();
      request.open("POST", apiUrl + "scale/freight/varianceExcelDownload", true);
      request.responseType = "blob";
      request.setRequestHeader("Content-type", "application/json");
      request.setRequestHeader("authorization", "Bearer " + $scope.token);
      request.onload = function (e) {
        if (this.status === 200) {
          console.log(this.response);
          var file = window.URL.createObjectURL(this.response);
          var a = document.createElement("a");
          a.href = file;
          a.download = "freight-variance.xlsx";
          document.body.appendChild(a);
          a.click();
        }
      };

      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");
      request.send(JSON.stringify(searchParam));
    };

    $scope.clear = () => {
      $scope.myForm = { ticketType: 'Outgoing' };
      $scope.initList(1);
    };

    $scope.initList();
  });
