angular
  .module("myApp.commissionPayable", [])
  .controller("commissionPayableCtrl", function(
    $scope,
    apiUrl,
    $rootScope,
    httpService,
    spinnerService,
    reportHttpServices,
    $window,
    $state,
    brokerHttpService,
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
      page: "commission"
    };

    var pageNo = localStorage.getItem("commission_page_No") || 1;

    var prev_filter = localStorage.getItem("commission_report_filter");
    $scope.myForm = prev_filter ? JSON.parse(prev_filter) : {};
    $scope.token = JSON.parse(localStorage.getItem("token"));

    httpService.getCommodity($scope.token).then(function(res) {
      $scope.commoditys = res.data.status == 200 ? res.data.data : [];
    });

    $scope.brokerList = [];

    brokerHttpService.getBroker("", $scope.token).then(function(res) {
      $scope.brokerList = res.data.status == 200 ? res.data.data : [];
    });

    $scope.initList = (page, pendingTask = null) => {
      page = page || pageNo;
      localStorage.setItem(
        "commission_report_filter",
        JSON.stringify($scope.myForm)
      );
      localStorage.setItem("commission_page_No", page);
      spinnerService.show("html5spinner");
      $scope.myForm.page = page;

      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");
      reportHttpServices
        .commissionPayableReport(searchParam, $scope.token)
        .then(objS => {
          spinnerService.hide("html5spinner");
          if (objS.data.status == 200) {
            $scope.list = objS.data.data.docs;
            $scope.page = objS.data.data.page;
            $scope.totalPages = objS.data.data.total;
            $scope.list.forEach(function(record) {
              $scope.amountPerMT(record);
              $scope.caluculateCommission(record);
            });
            if (pendingTask) {
              pendingTask();
            }
          }
        });
    };

    $scope.amountPerMT = function(contract) {
      var amount = "";
      switch (contract.amountUnit) {
        case "LBS":
          amount = contract.amount * 2204.62;
          break;
        case "BU":
          amount =
            (contract.amount * 2204.62) / contract.commodity.commodityWeight;
          break;
        case "CWT":
          amount = contract.amount * 22.0462;
          break;
        default:
          amount = contract.amount - 0;
      }
      contract.amountPerMT = amount;
      return amount ? amount.toFixed(2) - 0 : amount;
    };

    $scope.commissionType = function(cType) {
      switch (cType) {
        case "$":
          return "$/CWT";
        case "%":
          return "%";
        case "$pmt":
          return "$/MT";
        default:
          return "";
      }
    };

    $scope.caluculateCommission = function(contract) {
      if (!contract.scales) {
        contract.commission = NaN;
        return NaN;
      }

      var amount = 0;
      switch (contract.commissionType) {
        case "%":
          amount =
            contract.amountPerMT *
            contract.exchangeRate *
            ((contract.scales.unloadWeidhtMT * contract.brokerCommision) / 100);
          break;
        case "$":
          amount =
            contract.brokerCommision *
            contract.scales.unloadWeidhtMT *
            contract.exchangeRate *
            22.0462;
          break;
        default:
          amount =
            contract.brokerCommision *
            contract.scales.unloadWeidhtMT *
            contract.exchangeRate;
      }
      contract.commission = amount ? amount.toFixed(2) - 0 : amount;
      return contract.commission;
    };

    $scope.buyerDetails = function(buyerId) {
      if ($rootScope.loginUserAccess.sales.buyers.view) {
        $state.go("buyerDetails", {
          buyerId: buyerId
        });
      }
    };

    $scope.brokerDetails = function(brokerId) {
      if ($rootScope.loginUserAccess.sales.brokers.view) {
        $state.go("brokerDetails", {
          brokerId: brokerId
        });
      }
    };

    $scope.editSalesCont = function(buyerId, contractNumber) {
      var url = `editSalesContract/${buyerId}/${contractNumber}/edit`;
      $window.open(url, "_blank");
    };

    $scope.goToScale = function(ticketId) {
      var url = `addoutgoingscale/${ticketId}`;
      $window.open(url, "_blank");
    };

    $scope.clear = () => {
      $scope.myForm = {};
      $scope.initList(1);
    };

    $scope.initList();

    $scope.exportData = () => {
      var old_limit = $scope.myForm.limit;
      $scope.page = 1;
      $scope.myForm.limit = 2000;
      $scope.initList($scope.page, function() {
        var newData = [];
        if ($scope.list && $scope.list.length) {
          newData = $scope.list.map(function(report) {
            return {
              Date: report.scales ? moment(report.scales.date).format("YYYY-MM-DD") : '',
              "Contract Number": report.contractNumber,
              "Ticket Number": report.scales ? "RO" + report.scales.ticketNumber : "",
              Commodity: report.commodity.commodityName,
              Buyer: report.buyer.businessName,
              Broker: report.broker.businessName,
              "Comm Type": report.commissionType ? $scope.commissionType(report.commissionType) : "",
              "Comm Amt": report.brokerCommision,
              "Net Wt(MT)": report.scales ? report.scales.unloadWeidhtMT : "",
              "Price on Contract($/MT)": report.amountPerMT,
              "FX Rate on Stamp": report.exchangeRate,
              "Contract Currency": report.contractCurrency,
              "Total CAD Owing": report.commission
            };
          });
        }

        if (newData && newData.length) {
          var obj = {
            data: newData,
            fileName:
              moment().format("MM/DD/YYYY") + "_commission_payable_report.xlsx"
          };
          $scope.exporting = true;
          var request = new XMLHttpRequest();
          request.open("POST", apiUrl + "export", true);
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
          $scope.myForm.limit = old_limit;
        }
      });
    };
  });
