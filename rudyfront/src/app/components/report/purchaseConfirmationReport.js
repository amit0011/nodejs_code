angular
  .module("myApp.purchaseConfirmationReport", [])
  .controller("purchaseConfirmationReportCtrl", function (
    $scope,
    httpService,
    commonService,
    spinnerService,
    reportHttpServices,
    $timeout,
    apiUrl,
    $rootScope,
    $state
  ) {
    $scope.active = {
      page: "purchaseConfirmation",
    };

    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.reports ||
        !data.reports.purchaseConfirmation ||
        !data.reports.purchaseConfirmation.view
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });
    $scope.cropYears = commonService.cropYears();
    $scope.myForm = { groupBy: true };
    var pageNo = 1;
    $scope.pdfHide = false;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.selectedRow = null; // initialize our variable to null
    $scope.setClickedRow = function (index) {
      //function that sets the value of selectedRow to current index
      $scope.selectedRow = index;
    };
    $scope.clear = function () {
      $scope.myForm = { groupBy: true };
      $scope.initPurchase();
    };

    $scope.initPurchase = () => {
      var data = $scope.myForm;
      localStorage.setItem(
        "purchaseConfirmationReportFilters",
        JSON.stringify(data)
      );

      spinnerService.show("html5spinner");
      reportHttpServices.getPurchaseReport(data, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.purchaseReport = res.data.data;
            for (var i = 0; i < $scope.purchaseReport.length; i++) {
              if ($scope.purchaseReport[i].list) {
                for (var j = 0; j < $scope.purchaseReport[i].list.length; j++) {
                  if (
                    $scope.purchaseReport[i].list[j].personFarmType == "Person"
                  ) {
                    $scope.purchaseReport[i].list[j].nameOfContracts =
                      $scope.purchaseReport[i].list[j].growerId.firstName +
                      " " +
                      $scope.purchaseReport[i].list[j].growerId.lastName;
                  } else {
                    $scope.purchaseReport[i].list[j].nameOfContracts =
                      $scope.purchaseReport[i].list[j].growerId.farmName;
                  }
                }
              }
            }
          }
          spinnerService.hide("html5spinner");
        },
        function (error) {
          spinnerService.hide("html5spinner");
          console.log(JSON.stringify(error));
        }
      );
    };
    $scope.myForm =
      JSON.parse(localStorage.getItem("purchaseConfirmationReportFilters")) ||
      {};
    $scope.myForm.groupBy = true;
    httpService.getCommodity($scope.token).then(
      function (res) {
        if (res.data.status == 200) {
          $scope.commoditys = res.data.data;
        }

        if ($scope.myForm.commodityId) {
          $scope.getGrade($scope.myForm.commodityId);
        }
      },
      function (error) {
        console.log(JSON.stringify(error));
      }
    );
    $scope.getGrade = function (id) {
      $scope.initPurchase();
      httpService.getGrade("", id, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.grades = res.data.data;
          }
        },
        function (error) {
          console.log(JSON.stringify(error));
        }
      );
      $timeout(function () {
        $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
          return hero._id == id;
        });
      }, 1000);
    };

    $scope.gradeFilter = (gradeId) => {
      $scope.initPurchase();
    };
    $scope.totalWeightedAvg = (contract) => {
      var total = 0;
      contract.list.forEach((val) => {
        total += (val.contractQuantity / contract.totalQtyLb) * val.CWTDel;
      });
      return total.toFixed(4);
    };
    $scope.cropYearFilter = (cropYear) => {
      $scope.initPurchase();
    };
    $scope.statusFilter = (status) => {
      $scope.initPurchase();
    };
    $scope.print = function (printSectionId) {
      $timeout(function () {
        var innerContents = document.getElementById("printSectionId").innerHTML;
        var popupWinindow = window.open(
          "",
          "_blank",
          "width=800,height=900,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no"
        );
        popupWinindow.document.open();
        popupWinindow.document.write(
          `<html><head><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/css/bootstrap.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/custom.css" /><link rel="stylesheet" type="text/css" href="${$scope.url}/assets/stylesheets/style.css" /></head><body onload="window.print()">` +
            innerContents +
            `</html>`
        );
        popupWinindow.document.close();
      }, 1000);
    };

    $scope.exportToXL = () => {
      var newData = [];
      $scope.purchaseReport.map((purchase) => {
        newData.push({
          "Contract Number": purchase._id.commodityName,
          Date: "",
          "Name of Customer": "",
          Town: "",
          "Postal Code": "",
          "Phone Number": "",
          "Qty/LB": "",
          Unit: "",
          "Del To": "",
          "Price/Unit": "",
          Shipment: "",
          "CWT Del Price": "",
          "Weighted Avg": "",
          Status: "",
        });
        purchase.list.forEach((result) => {
          newData.push({
            "Contract Number": result.contractNumber,
            Date: moment(result.createdAt).format("MM/DD/YYYY"),
            "Name of Customer": result.nameOfContracts,
            Town: result.growerId.addresses[0].town,
            "Postal Code": result.growerId.addresses[0].postal || "NA",
            "Phone Number":
              result.growerId.phone2 ||
              result.growerId.phone ||
              result.growerId.cellNumber,
            "Qty/LB": result.contractQuantity,
            Unit: result.priceUnit,
            "Del To": result.deliveryPoint,
            "Price/Unit": `${result.price}/${result.priceUnit}`,
            Shipment: `${moment(result.shipmentPeriodFrom).format(
              "MMM/DD/YYYY"
            )} - ${moment(result.shipmentPeriodTo).format("MMM/DD/YYYY")}`,
            "CWT Del Price": result.CWTDel
              ? Number(result.CWTDel).toFixed(4)
              : "",
            "Weighted Avg": (
              (result.contractQuantity / purchase.totalQtyLb) *
              result.CWTDel
            ).toFixed(4),
            Status:
              result.status == 0
                ? "Active"
                : result.status == 1
                ? "Complete"
                : result.status == 2
                ? "Void"
                : "",
          });
        });

        newData.push({
          "Contract Number": "",
          Date: "",
          "Name of Customer": "",
          Town: "",
          "Postal Code": "",
          "Phone Number": "Total for " + purchase._id.commodityName,
          "Qty/LB": purchase.totalQtyLb,
          Unit: "",
          "Del To": "",
          "Price/Unit": purchase.priceLb,
          Shipment: "",
          "CWT Del Price": purchase.cwtDelPrice,
          "Weighted Avg": $scope.totalWeightedAvg(purchase),
          Status: "",
        });
      });

      var obj = {
        data: newData,
        fileName: moment().format("MM/DD/YYYY") + "purchase_confirmation.xlsx",
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
  });
