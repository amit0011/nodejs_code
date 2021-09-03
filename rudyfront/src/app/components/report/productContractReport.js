angular
  .module("myApp.productContractReport", [])
  .controller("productContractReportCtrl", function (
    $scope,
    httpService,
    $rootScope,
    $state,
    spinnerService,
    reportHttpServices,
    $timeout,
    apiUrl,
    commonService
  ) {
    $scope.active = {
      page: "report",
    };

    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.reports ||
        !data.reports.productionContract ||
        !data.reports.productionContract.view
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "productionContract",
    };

    $scope.myForm = {groupBy: true};
    var pageNo = 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.cropYears = commonService.cropYears();
    $scope.clear = function () {
      $scope.myForm = {groupBy: true};
      $scope.initProduct();
    };

    $scope.initProduct = () => {
      var data = $scope.myForm;

      localStorage.setItem('productContractReportFilters', JSON.stringify(data));

      spinnerService.show("html5spinner");
      reportHttpServices.getProductReport(data, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.productReport = res.data.data;
          }
          spinnerService.hide("html5spinner");
        },
        function (error) {
          spinnerService.hide("html5spinner");
        }
      );
    };

    $scope.myForm = JSON.parse(localStorage.getItem('productContractReportFilters')) || {};
    httpService.getCommodity($scope.token).then(function (res) {
      $scope.commoditys = res.data.status == 200 ? res.data.data : [];
      $scope.initProduct();

      if ($scope.myForm.commodityId) {
        $scope.getGrade($scope.myForm.commodityId);
      }
    });

    $scope.getGrade = function (id) {
      $scope.initProduct();

      httpService.getGrade("", id, $scope.token).then(function (res) {
        $scope.grades = res.data.status == 200 ? res.data.data : [];
      });

      $timeout(function () {
        $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
          return hero._id == id;
        });
      }, 1000);
    };

    $scope.getWeightedAVG = (contract, result) => {
      var total = 0;
      total = (result.quantityLbs / contract.totalQuantityLbs) * result.CWTDel;
      return total ? total.toFixed(2) : 0;
    };
    $scope.getPriceCWT = (data) => {
      $scope.CWTDel = 0;
      if (data.fixedPriceUnit == "Lbs") {
        $scope.CWTDel =
          (data.fixedPrice || 0) * 100 + (data.freightRate || 0) / 22.0462;
      } else if (data.fixedPriceUnit == "CWT") {
        $scope.CWTDel =
          (data.fixedPrice || 0) + (data.freightRate || 0) / 22.0462;
      } else if (data.fixedPriceUnit == "BU" || data.fixedPriceUnit == "Bu") {
        $scope.getBushelweight = $scope.commoditys.filter(function (hero) {
          return hero._id == data.commodityId._id;
        });
        $scope.CWTDel =
          ((data.fixedPrice || 0) * 100) /
            Number($scope.getBushelweight[0].commodityWeight) +
          Number(data.freightRate || 0) / 22.0462;
      }

      if ($scope.CWTDel) $scope.CWTDel = $scope.CWTDel.toFixed(2);
      data.priceCWT = $scope.CWTDel;
      return $scope.CWTDel || 0;
    };

    $scope.totalPriceCWT = (list) => {
      var total = 0;
      list.forEach((val) => {
        total += Number(val.priceCWT);
      });
      return total.toFixed(2);
    };

    $scope.totalAvgCWT = (contract) => {
      var total = 0;
      contract.list && contract.list.forEach((val) => {
        total += Number($scope.getWeightedAVG(contract, val));
      });
      return total ? Number(total).toFixed(2) : total;
    };

    $scope.gradeFilter = (gradeId) => {
      $scope.initProduct();
    };
    $scope.cropYearFilter = (cropYear) => {
      $scope.initProduct();
    };
    $scope.statusFilter = (status) => {
      $scope.initProduct();
    };
    $scope.priceOptionFilter = (priceOption) => {
      $scope.initProduct();
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

    $scope.exportToXl = () => {
      var newData = [];
      $scope.productReport.map((report) => {
        newData.push({
          "Contract Number": report._id.commodityName,
          Date: "",
          "Seller Name": "",
          "Farm Name": "",
          "Cell Number": "",
          City: "",
          Acres: "",
          "Fixed Qty": "",
          "Total Qty": "",
          Price: "",
          Unit: "",
          "Price/CWT": "",
          "CWT Del": "",
          "Weighted AVG(CWT)": "",
          Status: "",
        });

        report.list.forEach((val) => {
          newData.push({
            "Contract Number": val.contractNumber,
            Date: moment(val.createdAt).format("MM/DD/YYYY"),
            "Seller Name": val.growerId.firstName + ' ' + val.growerId.lastName,
            "Farm Name": val.growerId.farmName,
            "Cell Number": val.growerId.cellNumber,
            City: val.growerId.addresses ? val.growerId.addresses[0].town : "",
            Acres: val.acres,
            "Fixed Qty": val.fixedOnFirst,
            "Total Qty": val.quantityLbs,
            Price: val.fixedPrice,
            Unit: val.fixedPriceUnit,
            "Price/CWT": $scope.getPriceCWT(val),
            "CWT Del": val.CWTDel ? val.CWTDel.toFixed(4) : 0,
            "Weighted AVG(CWT)": $scope.getWeightedAVG(report, val),
            Status:
              val.status == 0
                ? "Active"
                : val.status == 1
                ? "Complete"
                : val.status == 2
                ? "Void"
                : "",
          });
        });

        newData.push({
          "Contract Number": "",
          Date: "",
          "Seller Name": "Total for " + report._id.commodityName,
          Acres: report.totalAcres,
          "Fixed Qty": report.totalFixedOnFirst,
          "Total Qty": report.totalQuantityLbs,
          Price: "", //report.totalFixedPrice ? (report.totalFixedPrice / report.list.length).toFixed(2) : 0,
          Unit: "",
          "Price/CWT": "", //$scope.totalPriceCWT(report.list),
          "CWT Del": "", //report.cwtDelPrice / report.list.length,
          "Weighted AVG(CWT)": $scope.totalAvgCWT(report),
          Status: "",
        });
      });

      var obj = {
        data: newData,
        fileName:
          moment().format("MM/DD/YYYY") + "production_contract_report.xlsx",
      };

      var request = new XMLHttpRequest();
      request.open("POST", apiUrl + "export", true);
      request.responseType = "blob";
      request.setRequestHeader("Content-type", "application/json");
      request.onload = function (e) {
        if (this.status === 200) {
          var a = document.createElement("a");
          a.href = window.URL.createObjectURL(this.response);
          a.download = obj.fileName;
          document.body.appendChild(a);
          a.click();
        }
      };
      request.send(JSON.stringify(obj));
    };
  });
