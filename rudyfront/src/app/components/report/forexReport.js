angular
  .module("myApp.forexReport", [])
  .controller("forexReportCtrl", function (
    $scope,
    $rootScope,
    salesContractHttpServices,
    reportHttpServices,
    spinnerService,
    commonService,
    apiUrl,
    $state
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.reports ||
        !data.reports.forex ||
        !data.reports.forex.view
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "forex",
    };

    //$scope.page = 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.myForm = {
      // commodityId: '',
      // limit: '10'
    };
    $scope.cropYears = commonService.cropYears();

    function init_total_count() {
      $scope.total = {
        total_usd_contract: 0,
        total_exchangeRate: 0,
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
        total_amount_allocated: 0,
        total_balance_outstanding: 0,
        septempber: 0,
        october: 0,
        november: 0,
        december: 0,
        january: 0,
        feburary: 0,
        march: 0,
        april: 0,
        May: 0,
        june: 0,
        july: 0,
        august: 0,
        o_s_total: 0,
        totalUSD: 0,
        averageFX: 0,
        total_net_usd: 0,
      };
    }

    init_total_count();

    $scope.clear = () => {
      $scope.myForm = {
        // commodityId: '',
        //limit: '10'
      };
      $scope.inItList();
    };

    $scope.checkPaymentPrice = (forex) => {
      var total = $scope.allocatedAmount(forex);
      if (total) total = Number(total).toFixed(2);
      if (Number(forex.paymentReceived) > total) {
        forex.paymentReceived = "";
      }
    };

    function getValue(value, rate) {
      if (!value || !rate) return 0;
      else {
        return (value / $scope.total.totalUSD) * rate;
      }
    }

    function monthDiff(d1, d2) {
      var months;
      months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth() + 1;
      months += d2.getMonth();
      return months <= 0 ? 0 : months;
    }

    $scope.calculateExchageRate = (d, idx) => {
      var totalMonthDiff =
        monthDiff(
          new Date(d.date),
          new Date(d.shipmentScheldule[idx].end_date)
        ) + 1;
      d.shipmentScheldule[idx].exchangeRate =
        Number(d.exchangeRate) - Number(d.exchangeDeduction) * totalMonthDiff;
      d.shipmentScheldule[idx].exchangeRate = d.shipmentScheldule[
        idx
      ].exchangeRate
        .toFixed(4)
        .toString();
    };

    // fxContract calculate total usd long short
    $scope.getTotalUSDLongShort = () => {
      function remaining(key) {
        if ($scope.fxContract && $scope.fxContract.usd)
          return $scope.sales[key] - $scope.fxContract.usd[key];
        else return 0;
      }
      $scope.totalUSDShortLongValue =
        remaining("sep") +
        remaining("oct") +
        remaining("nov") +
        remaining("dec") +
        remaining("jan") +
        remaining("feb") +
        remaining("mar") +
        remaining("apr") +
        remaining("may") +
        remaining("jun") +
        remaining("jul") +
        remaining("aug");
      if ($scope.totalUSDShortLongValue)
        $scope.totalUSDShortLongValue = $scope.totalUSDShortLongValue.toFixed(
          4
        );
    };

    // fxContract calculate total avg
    $scope.getTotalAvg = () => {
      function total(key) {
        if ($scope.fxContract && $scope.fxContract.usd)
          return $scope.fxContract.fxWeightedAverageRate[key];
        else return 0;
      }
      $scope.avgRate =
        total("sep") +
        total("oct") +
        total("nov") +
        total("dec") +
        total("jan") +
        total("feb") +
        total("mar") +
        total("apr") +
        total("may") +
        total("jun") +
        total("jul") +
        total("aug");
      if ($scope.avgRate) $scope.avgRate = $scope.avgRate.toFixed(4);
      return $scope.avgRate;
    };

    function loadFxHedgeReport() {
      reportHttpServices
        .fxHedgeReport($scope.myForm.cropYear, $scope.token)
        .then(function (ObjS) {
          if (ObjS.data.status == 200) {
            $scope.fxContract = ObjS.data.data.fxConctract[0];
            $scope.sales = ObjS.data.data.sales;
            $scope.getTotalUSDLongShort();
            $scope.getTotalAvg();
          }
          $scope.list = ObjS.data.status == 200 ? ObjS.data.data : [];
          $scope.showFxHedgeTotal = true;
          spinnerService.hide("html5spinner");
        });
    }

    function loadUsdPurchases() {
      $scope.purchasesInfo = null;
      reportHttpServices
        .loadUsdPurchases($scope.myForm.cropYear, $scope.token)
        .then(function(purchases) {
          if (purchases.data.status == 200) {
            $scope.purchasesInfo = purchases.data.data;
          }
        });
    }

    $scope.convertedQuantity = (value, fromUnit, toUnit) => {
      if (!(value && fromUnit && toUnit)) return 0;
      if (fromUnit === toUnit) return value;

      let convertedValue = value;
      // Step 1: convert fromUnit to MT
      switch(fromUnit.toUpperCase()) {
        case "KG":
          convertedValue /= 1000;
          break;

        case "LBS":
          convertedValue /= 2204.62;
          break;

        case "CWT":
          convertedValue /= 22.0462;
          break;
      }

      // Step 2: convert MT to toUnit
      switch(toUnit.toUpperCase()) {
        case "KG":
          convertedValue *= 1000;
          break;

        case "LBS":
          convertedValue *= 2204.62;
          break;

        case "CWT":
          convertedValue *= 22.0462;
          break;
      }

      return convertedValue;
    };

    $scope.getClass = function(forex) {
      return forex.accountingCompleted ? "active" : "";
    };

    $scope.inItList = () => {
      if (!$scope.myForm.cropYear) {
        $scope.forexList = [];
        return;
      }
      $scope.showFxHedgeTotal = false;
      spinnerService.show("html5spinner");
      init_total_count();
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
        "dec",
      ];
      salesContractHttpServices
        .forexReport(
          $scope.myForm.contractNumber,
          $scope.myForm.cropYear,
          $scope.myForm.accountingCompleted,
          $scope.token
        )
        .then(
          function (res) {
            if (res.data.status == 200) {
              $scope.forexList = [];
              for (var obj of res.data.data) {
                if (obj.shipmentScheldule.length) {
                  for (var i = 0; i < obj.shipmentScheldule.length; i++) {
                    if (!obj.shipmentScheldule[i]) {
                      continue;
                    }
                    obj.shipmentScheldule[i].ship = (
                      (obj.shipmentScheldule[i].quantity * 100) /
                      Number(obj.contractQuantity)
                    ).toFixed(2);
                    obj.shipmentScheldule[i].end_date = moment(
                      obj.shipmentScheldule[i].endDate
                    )
                      .add(1, "M")
                      .format("YYYY-MM");
                    $scope.calculateExchageRate(obj, i);

                    var new_obj = angular.copy(obj);
                    new_obj.shipping_schedule = new_obj.shipmentScheldule[i];

                    if (obj.shipmentScheldule.length == 1) {
                      new_obj.contract_number = new_obj.contractNumber;
                    } else {
                      new_obj.contract_number =
                        new_obj.contractNumber + " - " + (i + 1);
                    }
                    if (new_obj.shipping_schedule.payments && new_obj.shipping_schedule.payments.length > 0) {
                      new_obj.paymentReceived = new_obj.shipping_schedule.payments.reduce((acc, payment) => (acc + payment.amount), 0);
                      new_obj.paymentReceivedOn = new_obj.shipping_schedule.payments[new_obj.shipping_schedule.payments.length-1].date;
                    }

                    new_obj.index = i;
                    new_obj.quantity_lbs =
                      new_obj.quantityLbs / obj.shipmentScheldule.length;
                    if (obj.shipmentScheldule[i].exchangeRate) {
                      new_obj.exchangeRate =
                        obj.shipmentScheldule[i].exchangeRate;
                    }

                    new_obj.usd_amount =
                      (
                        (new_obj.priceCAD *
                          obj.shipmentScheldule[i].ship) /
                        (100 * new_obj.shipmentScheldule[i].exchangeRate)
                      ).toFixed(2) - 0;

                    if (obj.shipmentScheldule[i].endDate) {
                      if (
                        new_obj.priceUSD &&
                        new_obj.shipmentScheldule[i].ship
                      ) {
                        var mon =
                          (new Date(
                            obj.shipmentScheldule[i].endDate
                          ).getMonth() +
                            1) %
                          12;
                        new_obj[month[mon]] = new_obj.usd_amount;
                      }
                    }

                    new_obj.total_usd_amount_sales = $scope.convertedQuantity(obj.shipmentScheldule[i].quantity, obj.units, obj.amountUnit) * new_obj.amount;
                    new_obj.hedge_percentage = new_obj.usd_amount * 100 / new_obj.total_usd_amount_sales;

                    if (
                      new_obj.priceUSD &&
                      obj.shipmentScheldule[i] &&
                      obj.shipmentScheldule[i].ship
                    ) {
                      new_obj.total_usd_contract = new_obj.total_usd_amount_sales - new_obj.paymentReceived;
                    }

                    $scope.forexList.push(new_obj);
                  }
                } else {
                  obj.shipping_schedule = {};
                  obj.total_usd_amount_sales = $scope.convertedQuantity(obj.contractQuantity, obj.units, obj.amountUnit) * obj.amount;
                  $scope.forexList.push(obj);
                }
              }
              $scope.total.paymentReceived = 0;
              for (var data of $scope.forexList) {
                $scope.total.paymentReceived += (data.paymentReceived || 0);
                $scope.total.total_usd_contract += (data.total_usd_contract || 0);
                $scope.total.total_exchangeRate += data.exchangeRate
                  ? Number(data.exchangeRate)
                  : 0;
                $scope.total.total_sep += data.sep ? data.sep : 0;
                $scope.total.total_oct += data.oct ? data.oct : 0;
                $scope.total.total_nov += data.nov ? data.nov : 0;
                $scope.total.total_dec += data.dec ? data.dec : 0;
                $scope.total.total_jan += data.jan ? data.jan : 0;
                $scope.total.total_feb += data.feb ? data.feb : 0;
                $scope.total.total_mar += data.mar ? data.mar : 0;
                $scope.total.total_apr += data.apr ? data.apr : 0;
                $scope.total.total_may += data.may ? data.may : 0;
                $scope.total.total_jun += data.jun ? data.jun : 0;
                $scope.total.total_jul += data.jul ? data.jul : 0;
                $scope.total.total_aug += data.aug ? data.aug : 0;
                $scope.total.total_amount_allocated =
                  $scope.total.total_amount_allocated +
                  $scope.allocatedAmount(data);
                $scope.total.total_balance_outstanding += $scope.outstandingBalance(
                  data
                );
                $scope.total.total_net_usd += (data.usd_amount || 0);
              }

              $scope.total.totalUSD =
                $scope.total.total_sep +
                $scope.total.total_oct +
                $scope.total.total_nov +
                $scope.total.total_dec +
                $scope.total.total_jan +
                $scope.total.total_feb +
                $scope.total.total_mar +
                $scope.total.total_apr +
                $scope.total.total_may +
                $scope.total.total_jun +
                $scope.total.total_jul +
                $scope.total.total_aug;

              for (var data1 of $scope.forexList) {
                $scope.total.septempber += $scope.calculatePrice(
                  $scope.total.total_sep,
                  data1.sep,
                  data1.exchangeRate
                );
                $scope.total.october += $scope.calculatePrice(
                  $scope.total.total_oct,
                  data1.oct,
                  data1.exchangeRate
                );
                $scope.total.november += $scope.calculatePrice(
                  $scope.total.total_nov,
                  data1.nov,
                  data1.exchangeRate
                );
                $scope.total.december += $scope.calculatePrice(
                  $scope.total.total_dec,
                  data1.dec,
                  data1.exchangeRate
                );
                $scope.total.january += $scope.calculatePrice(
                  $scope.total.total_jan,
                  data1.jan,
                  data1.exchangeRate
                );
                $scope.total.feburary += $scope.calculatePrice(
                  $scope.total.total_feb,
                  data1.feb,
                  data1.exchangeRate
                );
                $scope.total.march += $scope.calculatePrice(
                  $scope.total.total_mar,
                  data1.mar,
                  data1.exchangeRate
                );
                $scope.total.april += $scope.calculatePrice(
                  $scope.total.total_apr,
                  data1.apr,
                  data1.exchangeRate
                );
                $scope.total.May += $scope.calculatePrice(
                  $scope.total.total_may,
                  data1.may,
                  data1.exchangeRate
                );
                $scope.total.june += $scope.calculatePrice(
                  $scope.total.total_jun,
                  data1.jun,
                  data1.exchangeRate
                );
                $scope.total.july += $scope.calculatePrice(
                  $scope.total.total_jul,
                  data1.jul,
                  data1.exchangeRate
                );
                $scope.total.august += $scope.calculatePrice(
                  $scope.total.total_aug,
                  data1.aug,
                  data1.exchangeRate
                );
                $scope.total.o_s_total += $scope.outStandingBalanceTotal(data1);
              }

              //$scope.totalValue = $scope.total.septempber + $scope.total.october + $scope.total.november + $scope.total.december + $scope.total.january + $scope.total.feburary + $scope.total.march + $scope.total.april + $scope.total.May + $scope.total.june + $scope.total.july + $scope.total.august;

              $scope.total.averageFX = getValue(
                $scope.total.total_sep,
                $scope.total.septempber
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_oct,
                $scope.total.october
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_nov,
                $scope.total.november
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_dec,
                $scope.total.december
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_jan,
                $scope.total.january
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_feb,
                $scope.total.feburary
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_mar,
                $scope.total.march
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_apr,
                $scope.total.april
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_may,
                $scope.total.May
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_jun,
                $scope.total.june
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_jul,
                $scope.total.july
              );
              $scope.total.averageFX += getValue(
                $scope.total.total_aug,
                $scope.total.august
              );
            } else {
              $scope.forexList = [];
            }
            loadFxHedgeReport();
            loadUsdPurchases();
          },
          function (error) {
            spinnerService.hide("html5spinner");
          }
        );
    };

    $scope.inItList();

    $scope.usdPurchasesContractsList = [];
    $scope.openContractPopup = function () {
      $(".add_coomm.new_add").fadeIn();
      $(".popup_overlay").fadeIn();
    };
    $scope.showContractPopup = function () {
      let cropYear = $scope.myForm.cropYear;
      if (!cropYear) return;

      if ($scope.cachedCropYear === cropYear)
        return $scope.openContractPopup();

      $scope.cachedCropYear = cropYear;

      spinnerService.show("html5spinner");
      reportHttpServices.usdPurchasesContracts(cropYear, $scope.token).then(function(res) {
        if (res.data.status == 200) {
          $scope.usdPurchasesContractsList = res.data.data;
          $scope.openContractPopup();
        }
        spinnerService.hide("html5spinner");
      });
    };

    $scope.allocatedAmount = (forex) => {
      var total =
        forex.sep ||
        forex.oct ||
        forex.nov ||
        forex.dec ||
        forex.jan ||
        forex.feb ||
        forex.mar ||
        forex.apr ||
        forex.may ||
        forex.jun ||
        forex.jul ||
        forex.aug;
      total = total > 0 ? Number(total).toFixed(2) : 0;
      return Number(total);
    };

    $scope.outstandingBalance = (forex) => {
      var total =
        forex.sep ||
        forex.oct ||
        forex.nov ||
        forex.dec ||
        forex.jan ||
        forex.feb ||
        forex.mar ||
        forex.apr ||
        forex.may ||
        forex.jun ||
        forex.jul ||
        forex.aug;
      total = total ? Number(total) : 0;
      if (total > 0 && forex.paymentReceived) {
        var rem = total - (forex.paymentReceived * forex.hedge_percentage / 100);
        return rem > 0 ? Number(rem) : 0;
      } else if (total > 0) {
        var _rem = total;
        return Number(_rem);
      } else return 0;
    };

    $scope.outStandingBalanceTotal = (forex) => {
      var os_balance = $scope.outstandingBalance(forex);
      if ($scope.total.total_balance_outstanding > 0 && os_balance) {
        var total =
          (os_balance / $scope.total.total_balance_outstanding) *
          forex.exchangeRate;
        if (total > 0) {
          return Number(total);
        } else return 0;
      } else return 0;
    };

    $scope.calculatePrice = (total_sep_amount, sep_amount, exchangeRate) => {
      if (total_sep_amount > 0 && sep_amount && exchangeRate) {
        var total = (sep_amount / total_sep_amount) * exchangeRate;
        total = total ? Number(total).toFixed(9) : 0;
        return Number(total);
      } else return 0;
    };

    $scope.exportData = () => {
      var newData = $scope.forexList.map((forex) => {
        var est_margin_cad_cwt = forex.netFOBCAD - forex.targetFOBCAD;
        if (est_margin_cad_cwt) {
          est_margin_cad_cwt = est_margin_cad_cwt.toFixed(2);
        }

        return {
          "CONTRACT Date": moment(forex.date).format("MM/DD/YYYY"),
          "CONTRACT#": forex.contract_number,
          "CONTRACT QTY. (LBS)": forex.quantity_lbs,
          "BUYER NAME": forex.buyerId.businessName,
          "Net USD From Stamp": forex.usd_amount,
          "TOTAL USD AMOUNT": forex.total_usd_amount_sales ? +forex.total_usd_amount_sales.toFixed(2) : "",
          "HEDGE %": forex.hedge_percentage ? +forex.hedge_percentage.toFixed(2) : "",
          "Payment received": forex.paymentReceived,
          "Last Payment received on": forex.paymentReceivedOn ? moment(forex.paymentReceivedOn).format(
            "MM/DD/YYYY"
          ) : '',
          "BALANCE Net USD From Stamp": +$scope.outstandingBalance(forex).toFixed(2),
          "TOTAL USD CONTRACT o/s": forex.total_usd_contract,
          "TOTAL FOB CAD $/CWT": forex.netFOBCAD,
          "Cost. FOB CAD $/CWT": forex.targetFOBCAD,
          "EST. MARGIN CAD $/CWT": est_margin_cad_cwt,
          "EST. MARGIN CAD": forex.totalFOB,
          "CONTRACT FX RATE": +forex.exchangeRate,
          SEPT: forex.sep ? +forex.sep.toFixed(2) : "",
          OCT: forex.oct ? +forex.oct.toFixed(2) : "",
          NOV: forex.nov ? +forex.nov.toFixed(2) : "",
          DEC: forex.dec ? +forex.dec.toFixed(2) : "",
          JAN: forex.jan ? +forex.jan.toFixed(2) : "",
          FEB: forex.feb ? +forex.feb.toFixed(2) : "",
          MARCH: forex.mar ? +forex.mar.toFixed(2) : "",
          APRIL: forex.apr ? +forex.apr.toFixed(2) : "",
          MAY: forex.may ? +forex.may.toFixed(2) : "",
          JUNE: forex.jun ? +forex.jun.toFixed(2) : "",
          JULY: forex.jul ? +forex.jul.toFixed(2) : "",
          AUGUST: forex.aug ? +forex.aug.toFixed(2) : "",
          "AMOUNT ALLOCATED": $scope.allocatedAmount(forex),
          "FX CONT #": "",
          "HEDGE RATE#": "",
          "HEDGE GAIN/LOSS": "",
          Sept: +$scope.calculatePrice(
            $scope.total.total_sep,
            forex.sep,
            forex.exchangeRate
          ),
          Oct: +$scope.calculatePrice(
            $scope.total.total_oct,
            forex.oct,
            forex.exchangeRate
          ),
          Nov: +$scope.calculatePrice(
            $scope.total.total_nov,
            forex.nov,
            forex.exchangeRate
          ),
          Dec: +$scope.calculatePrice(
            $scope.total.total_dec,
            forex.dec,
            forex.exchangeRate
          ),
          Jan: +$scope.calculatePrice(
            $scope.total.total_jan,
            forex.jan,
            forex.exchangeRate
          ),
          Feb: +$scope.calculatePrice(
            $scope.total.total_feb,
            forex.feb,
            forex.exchangeRate
          ),
          Mar: +$scope.calculatePrice(
            $scope.total.total_mar,
            forex.mar,
            forex.exchangeRate
          ),
          Apr: +$scope.calculatePrice(
            $scope.total.total_apr,
            forex.apr,
            forex.exchangeRate
          ),
          May: +$scope.calculatePrice(
            $scope.total.total_may,
            forex.may,
            forex.exchangeRate
          ),
          Jun: +$scope.calculatePrice(
            $scope.total.total_jun,
            forex.jun,
            forex.exchangeRate
          ),
          July: +$scope.calculatePrice(
            $scope.total.total_jul,
            forex.jul,
            forex.exchangeRate
          ),
          Aaugust: +$scope.calculatePrice(
            $scope.total.total_aug,
            forex.aug,
            forex.exchangeRate
          ),
          "o/s": +$scope.outStandingBalanceTotal(forex).toFixed(2),
        };
      });

      newData.push({
        "CONTRACT Date": "",
        "CONTRACT#": "",
        "CONTRACT QTY. (LBS)": "",
        "BUYER NAME": "",
        "Net USD From Stamp": +$scope.total.total_net_usd.toFixed(2),
        "TOTAL USD AMOUNT": "",
        "HEDGE %": "",
        "Payment received": +$scope.total.paymentReceived.toFixed(2),
        "Last Payment received on": "",
        "BALANCE Net USD From Stamp": +$scope.total.total_balance_outstanding.toFixed(2),
        "TOTAL USD CONTRACT o/s": +$scope.total.total_usd_contract.toFixed(2),
        "TOTAL FOB CAD $/CWT": "",
        "Cost. FOB CAD $/CWT": "",
        "EST. MARGIN CAD $/CWT": "",
        "EST. MARGIN CAD": "",
        "CONTRACT FX RATE": +$scope.total.averageFX.toFixed(4),
        SEPT: $scope.total.total_sep ? +$scope.total.total_sep.toFixed(2) : "",
        OCT: $scope.total.total_oct ? +$scope.total.total_oct.toFixed(2) : "",
        NOV: $scope.total.total_nov ? +$scope.total.total_nov.toFixed(2) : "",
        DEC: $scope.total.total_dec ? +$scope.total.total_dec.toFixed(2) : "",
        JAN: $scope.total.total_jan ? +$scope.total.total_jan.toFixed(2) : "",
        FEB: $scope.total.total_feb ? +$scope.total.total_feb.toFixed(2) : "",
        MARCH: $scope.total.total_mar ? +$scope.total.total_mar.toFixed(2) : "",
        APRIL: $scope.total.total_apr ? +$scope.total.total_apr.toFixed(2) : "",
        MAY: $scope.total.total_may ? +$scope.total.total_may.toFixed(2) : "",
        JUNE: $scope.total.total_jun ? +$scope.total.total_jun.toFixed(2) : "",
        JULY: $scope.total.total_jul ? +$scope.total.total_jul.toFixed(2) : "",
        AUGUST: $scope.total.total_aug ? +$scope.total.total_aug.toFixed(2) : "",
        "AMOUNT ALLOCATED": $scope.total.total_amount_allocated
          ? +$scope.total.total_amount_allocated.toFixed(2)
          : "",
        "FX CONT #": "",
        "HEDGE RATE#": "",
        "HEDGE GAIN/LOSS": "",
        Sept: $scope.total.septempber ? +$scope.total.septempber.toFixed(9) : 0,
        Oct: $scope.total.october ? +$scope.total.october.toFixed(9) : 0,
        Nov: $scope.total.november ? +$scope.total.november.toFixed(9) : 0,
        Dec: $scope.total.december ? +$scope.total.december.toFixed(9) : 0,
        Jan: $scope.total.january ? +$scope.total.january.toFixed(9) : 0,
        Feb: $scope.total.feburary ? +$scope.total.feburary.toFixed(9) : 0,
        Mar: $scope.total.march ? +$scope.total.march.toFixed(9) : 0,
        Apr: $scope.total.april ? +$scope.total.april.toFixed(9) : 0,
        May: $scope.total.May ? +$scope.total.May.toFixed(9) : 0,
        Jun: $scope.total.june ? +$scope.total.june.toFixed(9) : 0,
        July: $scope.total.july ? +$scope.total.july.toFixed(9) : 0,
        Aaugust: $scope.total.august ? +$scope.total.august.toFixed(9) : 0,
        "o/s": $scope.total.o_s_total ? +$scope.total.o_s_total.toFixed(9) : 0,
      });
      var obj = {
        data: newData,
        fileName: moment().format("MM/DD/YYYY") + "sales_summary.xlsx",
      };

      var request = new XMLHttpRequest();
      request.open("POST", apiUrl + "export", true);
      request.responseType = "blob";
      request.setRequestHeader("Content-type", "application/json");
      request.onload = function (e) {
        if (this.status === 200) {
          var file = window.URL.createObjectURL(this.response);
          var a = document.createElement("a");
          a.href = file;
          a.download = obj.fileName;
          document.body.appendChild(a);
          a.click();
        }
      };
      request.send(JSON.stringify(obj));
    };

    $scope.save = function() {
      var data = {
        _id: $scope.selectedForex._id,
        shipmentScheldule: $scope.selectedForex.shipmentScheldule,
        accountingCompleted: $scope.selectedForex.accountingCompleted,
      };

      var total_amount = $scope.selectedForex.shipmentScheldule[$scope.selectedForex.index].payments.reduce((acc, payment) => (+acc + +payment.amount), 0);
      if (total_amount > $scope.selectedForex.total_usd_amount_sales) {
        swal('Warning', `Total Received Amount(${total_amount}) should not be greater than Total USD Amount(${$scope.selectedForex.total_usd_amount_sales})`, 'warning');
        return;
      }

      salesContractHttpServices.updateForexPayment(data, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.inItList();
            swal("success", "Payment updated", "success");
            $scope.closepop();
          }
        },
        function (error) {
          swal("ERROR", "Something went wrong", "error");
        }
      );
    };

    $scope.add = function() {
      if ($scope.paymentForm.amount && $scope.paymentForm.date) {
        $scope.selectedForex.shipmentScheldule[$scope.selectedForex.index].payments.push({
          amount: $scope.paymentForm.amount,
          date: commonService.getDateToCurrentTime($scope.paymentForm.date),
          comment: $scope.paymentForm.comment
        });
        $scope.paymentForm = {amount: '', date: '', comment: ''};
        return;
      }
      swal("Warning", "Amount and date fields are required", "warning");
    };

    $scope.delete = function(index) {
      $scope.selectedForex.shipmentScheldule[$scope.selectedForex.index].payments.splice(index, 1);
    };

    $scope.edit = function(index, payment) {
      $scope.editIndex = index;
      $scope.editMode = true;
      $scope.paymentForm = Object.assign({}, payment);
    };

    $scope.cancel = function() {
      $scope.editIndex = null;
      $scope.editMode = false;
      $scope.paymentForm = {amount: '', date: '', comment: ''};
    };

    $scope.update = function() {
      if (typeof $scope.paymentForm.date === 'string' && !$scope.paymentForm.date.includes('T')) {
        $scope.paymentForm.date = commonService.getDateToCurrentTime($scope.paymentForm.date);
      }
      $scope.selectedForex.shipmentScheldule[$scope.selectedForex.index].payments[$scope.editIndex] = $scope.paymentForm;
      $scope.cancel();
    };

    $scope.openPop = function(forex) {
      $scope.selectedForex = forex;
      $scope.editMode = false;
      var index = $scope.selectedForex.index;
      console.log($scope.selectedForex.shipmentScheldule[index]);
      if (!$scope.selectedForex.shipmentScheldule[index].payments) {
        $scope.selectedForex.shipmentScheldule[index].payments = [];
        if (typeof index !== 'undefined' && $scope.selectedForex.shipmentScheldule[index].paymentReceived) {
          console.log('set payment');
          $scope.selectedForex.shipmentScheldule[index].payments.push({
            amount: $scope.selectedForex.shipmentScheldule[index].paymentReceived,
            date: $scope.selectedForex.shipmentScheldule[index].paymentReceivedOn,
            comment: '',
          });
        }
      }
      $(".add_coomm.country").fadeIn();
      $(".popup_overlay").fadeIn();
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
