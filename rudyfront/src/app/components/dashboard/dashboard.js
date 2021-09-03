angular
  .module("myApp.dashboard", [])
  .controller("dashboardCtrl", function(
    $scope,
    httpService,
    $rootScope,
    $state,
    salesContractHttpServices,
    scaleTicketHttpServices,
    reportHttpServices,
    currencyHttpService,
    weatherHttpService
  ) {
    $scope.active = {
      page: "dashboard"
    };

    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.userInfo = JSON.parse(localStorage.getItem("loginUserInfo"));

    $scope.loader = {
      purchaseConfirmation: false,
      salesContract: false,
      amendedSalesContract: false,
      productionContract: false,
      tradePurchase: false,
      incomingTicket: false,
      outgoingTicket: false,
      currency: false,
      weather: false
    };
    $scope.amendedPage = 1;
    $scope.amendedContractPages = [];

    function init_total_count() {
      $scope.total = {
        total_sep: 0,
        total_oct: 0,
        total_nov: 0,
        total_dec: 0,
        total_jan: 0,
        total_feb: 0,
        total_mar: 0,
        total_apr: 0,
        total_may: 0,
        total_jun: 0,
        total_jul: 0,
        total_aug: 0,
        total_balance_outstanding: 0,
        september: 0,
        october: 0,
        november: 0,
        december: 0,
        january: 0,
        february: 0,
        march: 0,
        april: 0,
        May: 0,
        june: 0,
        july: 0,
        august: 0
      };
    }

    var month = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec"
    ];

    //grower call back report
    reportHttpServices
      .getGrowerLatestCallBack($scope.token, $scope.userInfo.userId)
      .then(function(res) {
        if (res.data.status == 200) {
          $scope.growerCallBackList = res.data.data;
        }
      });

    $scope.getLatestPurchaseConfirmationContract = function() {
      $scope.loader.purchaseConfirmation = true;
      httpService.getLatestPurchaseConfirmationContract($scope.token).then(
        function(objS) {
          $scope.p_confirmation_list =
            objS.data.status == 200 ? objS.data.data : [];
          $scope.loader.purchaseConfirmation = false;
        },
        function(objE) {
          $scope.loader.purchaseConfirmation = false;
        }
      );
    };

    $scope.getLatestTradePurchaseContract = function() {
      $scope.loader.tradePurchase = true;
      httpService.getLatestTradePurchaseContract($scope.token).then(
        function(objS) {
          $scope.trade_purchase_list =
            objS.data.status == 200 ? objS.data.data : [];
          $scope.loader.tradePurchase = false;
        },
        function(objE) {
          $scope.loader.tradePurchase = false;
        }
      );
    };

    $scope.buyerName = function(contract) {
      contract.buyerName = contract.buyerId ? (contract.buyerId.businessName || `${contract.buyerId.firstName} ${contract.buyerId.lastName}` ) : 'NA';
      return contract.buyerName;
    };

    $scope.getLatestProductionContract = function() {
      $scope.loader.productionContract = true;
      httpService.getLatestProductionContract($scope.token).then(
        function(objS) {
          $scope.p_contract_list =
            objS.data.status == 200 ? objS.data.data : [];
          $scope.loader.productionContract = false;
        },
        function(objE) {
          $scope.loader.productionContract = false;
        }
      );
    };

    $scope.getLatestSalesContract = function() {
      $scope.loader.salesContract = true;
      salesContractHttpServices.getLatestSalesContract($scope.token).then(
        function(objS) {
          $scope.s_contract_list =
            objS.data.status == 200 ? objS.data.data : [];
          $scope.loader.salesContract = false;
        },
        function(objE) {
          $scope.loader.salesContract = false;
        }
      );
    };

    $scope.getAmendedSalesContract = function() {
      $scope.loader.amendedSalesContract = true;
      salesContractHttpServices.getAmendedSalesContract($scope.token, $scope.amendedPage).then(
        function(objS) {
          $scope.as_contracts =
            objS.data.status == 200 ? objS.data.data.docs : [];
          $scope.loader.amendedSalesContract = false;
          if ($scope.amendedContractPages.length === 0) {
            for (var i = 1; i <= objS.data.data.pages; i++)
              $scope.amendedContractPages.push(i);
          }
        },
        function(objE) {
          $scope.loader.amendedSalesContract = false;
        }
      );
    };

    $scope.getLatestIncomingTicket = function() {
      $scope.loader.incomingTicket = true;
      scaleTicketHttpServices.getLatestIncomingTicket($scope.token).then(
        function(objS) {
          $scope.i_ticket_list = objS.data.status == 200 ? objS.data.data : [];
          $scope.loader.incomingTicket = false;
        },
        function(objE) {
          $scope.loader.incomingTicket = false;
        }
      );
    };

    $scope.getLatestOutgoingTicket = function() {
      $scope.loader.outgoingTicket = true;
      scaleTicketHttpServices.getLatestOutgoingTicket($scope.token).then(
        function(objS) {
          $scope.o_ticket_list = objS.data.status == 200 ? objS.data.data : [];
          $scope.loader.outgoingTicket = false;
        },
        function(objE) {
          $scope.loader.outgoingTicket = false;
        }
      );
    };

    $scope.getQuantityLbs = function(contract) {
      var contractQuantity = 0;
      if (contract.contractQuantity) {
        if (contract.quantityUnit == "Lbs") {
          contractQuantity = Number(contract.contractQuantity);
        } else if (contract.quantityUnit == "CWT") {
          contractQuantity = Number(contract.contractQuantity) * 100;
        } else if (contract.quantityUnit == "MT") {
          var total_cwt = 22.0462 * Number(contract.contractQuantity);
          contractQuantity = total_cwt * 100;
        } else if (contract.quantityUnit == "BU") {
          contractQuantity = Number(contract.contractQuantity) * 60;
        }
      }
      return contractQuantity;
    };
    $scope.calculatePrice = function(total_sep_amount, sep_amount, exchangeRate) {
      if (total_sep_amount > 0 && sep_amount && exchangeRate) {
        var total = (sep_amount / total_sep_amount) * exchangeRate;
        total = total ? Number(total).toFixed(9) : 0;
        return Number(total);
      } else return 0;
    };

    $scope.buyerDetails = function(buyerId) {
      if ($rootScope.loginUserAccess.sales.buyers.view) {
        $state.go("buyerDetails", {
          buyerId: buyerId
        });
      }
    };

    $scope.growerDetails = function(growerId) {
      if ($rootScope.loginUserAccess.purchase.growers.view) {
        $state.go("growerDetails", {
          id: growerId
        });
      }
    };

    $scope.viewIncomingTicket = function(_id) {
      if ($rootScope.loginUserAccess.truckScale.incoming.view) {
        $state.go("scaleTicketPDF", {
          tickertNo: _id
        });
      }
    };
    $scope.viewOutgoingTicket = function(_id) {
      if ($rootScope.loginUserAccess.truckScale.outgoing.view) {
        $state.go("outgoingScaleTicketPDF", {
          tickertNo: _id
        });
      }
    };

    $scope.weatherDetails = function() {
      $scope.loader.weather = true;
      weatherHttpService.getWeatherDetails($scope.token).then(function(res) {
        $scope.weather = res.data.status == 200 ? res.data.data : [];
        if (res.data.data && res.data.data[0]) {
          $scope.forecast = res.data.data[0].forecast;
          $scope.todayWeather = res.data.data[0].forecast.filter(function(val) {
            return val.date == res.data.data[0].current.date;
          });
        }
        $scope.loader.weather = false;
      });
    };

    $scope.currencyDetails = function() {
      $scope.loader.currency = true;
      currencyHttpService.getcurrency($scope.token).then(function(res) {
        $scope.currency = res.data.status == 200 ? res.data.data[0] : {};
        $scope.loader.currency = false;
      });
    };

    $scope.currencyDetails();
    $scope.weatherDetails();
    $scope.getLatestPurchaseConfirmationContract();
    $scope.getLatestProductionContract();
    $scope.getLatestSalesContract();
    $scope.getAmendedSalesContract();
    $scope.getLatestIncomingTicket();
    $scope.getLatestOutgoingTicket();
    $scope.getLatestTradePurchaseContract();
  });
