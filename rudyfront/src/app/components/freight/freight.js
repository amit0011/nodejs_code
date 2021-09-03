const moment = require("moment");

angular
  .module("myApp.freight", [])
  .controller("freightCtrl", function (
    $scope,
    countryHttpService,
    spinnerService,
    freightHttpServices,
    freightCompanyHttpServices,
    freightSettingHttpService,
    currencyHttpService,
    shiplineHttpServices,
    $rootScope,
    $state,
    commonService,
    apiUrl
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.setting ||
        !data.setting.freight ||
        !data.setting.freight.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "freight",
    };
    var prev_filter = localStorage.getItem("freight_filter");
    $scope.searchForm = prev_filter ? JSON.parse(prev_filter) : {};

    var pageNo = localStorage.getItem("freight_page");
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.rateFactor = 1.0;

    $scope.revertRateFactor = function () {
      spinnerService.show("html5spinner");
      freightHttpServices.revertRateFactor($scope.token)
        .then(function(res) {
          spinnerService.hide("html5spinner");
          $scope.filterData($scope.page);
        });
    };

    $scope.applyRateFactor = function() {
      if(!$scope.rateFactor || $scope.rateFactor < 0.01) {
        swal("Invalid", "Please provide valid value of rate factor", "error");
        return;
      }
      if ($scope.rateFactor == 1) return;
      spinnerService.show("html5spinner");
      freightHttpServices.applyRateFactor($scope.token, $scope.rateFactor)
        .then(function(res) {
          spinnerService.hide("html5spinner");
          $scope.filterData($scope.page);
        });
    }

    $scope.initFreight = (pageNo, port, city, country, freightCompany, validity, onlyInvalid, limit, cb) => {
      if (!port) {
        port = "";
      }
      if (!city) {
        city = "";
      }
      if (!country) {
        country = "";
      }
      if (!freightCompany) {
        freightCompany = "";
      }
      localStorage.setItem("freight_filter", JSON.stringify($scope.searchForm));
      spinnerService.show("html5spinner");
      currencyHttpService.getcurrency($scope.token).then(function (res) {
        if (res.data.status == 200) {
          spinnerService.hide("html5spinner");
          $scope.currencyList = res.data.data;
          $scope.exchangeRate = $scope.currencyList[0].currencyCADUSD;
        }
        spinnerService.hide("html5spinner");
      });
      freightHttpServices
        .getFreight(pageNo, $scope.token, port, city, country, freightCompany, validity, onlyInvalid, limit)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.freightList = res.data.data.docs;
            $scope.hasBkp = $scope.freightList && $scope.freightList.length ? $scope.freightList[0].hasBkp : false;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
          }
          cb && cb($scope.freightList);
        });
    };
    $scope.todayDate = moment().toISOString();
    $scope.DoCtrlPagingAct = function (text, page, pageSize, total) {
      if (text == "showAll") {
        $scope.page = page || pageNo;
        localStorage.setItem("freight_page", $scope.page);
        $scope.initFreight($scope.page);
        $scope.searchForm = {};
      } else {
        $scope.filterData(page);
      }
    };
    $scope.filterData = (page, limit, cb) => {
      $scope.page = page || 1;
      localStorage.setItem("freight_page", $scope.page);

      $scope.searchForm.validityWithTime = null;
      if ($scope.searchForm.validity) {
        $scope.searchForm.validityWithTime = commonService.adjustDate($scope.searchForm.validity, '[');
      }

      $scope.initFreight(
        $scope.page,
        $scope.searchForm.loadingPort,
        $scope.searchForm.city,
        $scope.searchForm.country,
        $scope.searchForm.freightCompany,
        ($scope.searchForm.validityWithTime || $scope.todayDate),
        (+$scope.searchForm.onlyInvalid || 0),
        limit,
        cb
      );
    };
    $scope.getShpline = (freightCompanyId) => {
      shiplineHttpServices
        .getshipline("", freightCompanyId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.shiplineList = res.data.data;
          }
        });
    };

    countryHttpService.getCountryList($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.countryList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    freightHttpServices.getLoadingPort($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.loadingPortList = res.data.data.sort(function (a, b) {
          var akey = a.loadingPortName.toLowerCase();
          var bkey = b.loadingPortName.toLowerCase();
          return akey > bkey ? 1 : akey < bkey ? -1 : 0;
        });
      }
    });

    freightCompanyHttpServices
      .getFreightCompany("", $scope.token)
      .then(function (res) {
        if (res.data.status == 200) {
          $scope.freightCompanyList = res.data.data.sort(function (a, b) {
            var akey = a.freightCompanyName.toLowerCase();
            var bkey = b.freightCompanyName.toLowerCase();
            return akey > bkey ? 1 : akey < bkey ? -1 : 0;
          });
        }
      });

    $scope.getCity = (country, dontRunFilter = false) => {
      freightHttpServices.getCity(country, $scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.cityList = res.data.data.sort(function (a, b) {
            var akey = a.city.toLowerCase();
            var bkey = b.city.toLowerCase();
            return akey > bkey ? 1 : akey < bkey ? -1 : 0;
          });
          dontRunFilter && $scope.filterData();
        }
      });
    };

    if ($scope.searchForm.country) {
      $scope.getCity($scope.searchForm.country);
    }

    $scope.getEquipment = (port) => {
      freightHttpServices.getEquipment(port, $scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.equipmentList = res.data.data;
        }
      });
    };

    freightSettingHttpService
      .getfreightSetting("", $scope.token)
      .then(function (res) {
        if (res.data.status == 200) {
          $scope.freightSettingList = res.data.data;
        }
      });

    function getBagToBagPrice(data, key, freight_Setting_price) {
      return data[key] ? ((+data[key] || 0) + (+freight_Setting_price || 0)) : 0;
    }

    $scope.convertAmount = (value, fromCurrency, toCurrency) => {
      if (!(fromCurrency && toCurrency)) {
        return 0;
      }

      if (fromCurrency == toCurrency) {
        return value;
      }

      return toCurrency == "USD"
        ? value / $scope.exchangeRate
        : value * $scope.exchangeRate;
    };

    $scope.calculateValue = (context) => {
      const { currencyType, oceanFreight } = $scope.myForm;

      if (!(currencyType && oceanFreight)) return;

      const oceanKey = `${context}Ocean`;
      const ocean = $scope.convertAmount(
        oceanFreight[oceanKey] - 0,
        oceanFreight[`${oceanKey}Currency`],
        currencyType
      );

      const stuffingKey = `${context}Stuffing`;
      const stuffing = $scope.convertAmount(
        oceanFreight[stuffingKey] - 0,
        oceanFreight[`${stuffingKey}Currency`],
        currencyType
      );

      $scope.myForm.oceanFreight[context] = (ocean + stuffing).toFixed(3) - 0;
    };

    $scope.calculateAllValue = () => {
      $scope.calculateValue("bagToBag");
      $scope.calculateValue("bulkToBulk");
      $scope.calculateValue("bulkToBag");
    };

    $scope.setActive = function (freight) {
      $scope.activeFreightId = freight._id;
    };

    $scope.getClass = function (freight) {
      var className = '';
      if (moment().isAfter(freight.validity)) {
        className = 'expired';
      }
      return className + ' ' + (freight._id == $scope.activeFreightId ? "active" : "");
    };

    $scope.save = function () {
      $scope.myForm.freightCWT = {
        bagToBag: 0,
        bulkToBulk: 0,
        bulkToBag: 0,
      };
      $scope.myForm.freightMT = {
        bagToBag: 0,
        bulkToBulk: 0,
        bulkToBag: 0,
      };
      let oceanBagToBag = (+$scope.myForm.oceanFreight.bagToBag || 0);
      let oceanBulkToBulk = (+$scope.myForm.oceanFreight.bulkToBulk || 0);
      let oceanBulkToBag = (+$scope.myForm.oceanFreight.bulkToBag || 0);
      if ($scope.myForm.currencyType == "CAD") {
        $scope.myForm.freightWithBlFee = {
          bagToBag: (oceanBagToBag +
              (oceanBagToBag ? (+$scope.myForm.blFee || 0) : 0)
            ) / $scope.exchangeRate,
          bulkToBulk: (oceanBulkToBulk +
              (oceanBulkToBulk ? ($scope.myForm.blFee || 0) : 0)
            ) / $scope.exchangeRate,
          bulkToBag: (oceanBulkToBag +
              (oceanBulkToBag ? ($scope.myForm.blFee || 0) : 0)
            ) / $scope.exchangeRate,
        };
        if (+$scope.myForm.unit) {
          $scope.myForm.freightCWT = {
            bagToBag:
              $scope.myForm.freightWithBlFee.bagToBag /
              $scope.myForm.unit,
            bulkToBulk:
              $scope.myForm.freightWithBlFee.bulkToBulk /
              $scope.myForm.unit,
            bulkToBag:
              $scope.myForm.freightWithBlFee.bulkToBag /
              $scope.myForm.unit,
          };
          $scope.myForm.freightMT = {
            bagToBag: $scope.myForm.freightCWT.bagToBag * 22.046,
            bulkToBulk: $scope.myForm.freightCWT.bulkToBulk * 22.046,
            bulkToBag: $scope.myForm.freightCWT.bulkToBag * 22.046,
          };
        }
      } else {
        $scope.myForm.freightWithBlFee = {
          bagToBag: (oceanBagToBag +
            (oceanBagToBag ? (+$scope.myForm.blFee || 0) : 0)),
          bulkToBulk: (oceanBulkToBulk +
            (oceanBulkToBulk ? ($scope.myForm.blFee || 0) : 0)),
          bulkToBag: (oceanBulkToBag +
            (oceanBulkToBag ? ($scope.myForm.blFee || 0) : 0)),
        };

        if (+$scope.myForm.unit) {
          $scope.myForm.freightCWT = {
            bagToBag:
              $scope.myForm.freightWithBlFee.bagToBag /
              $scope.myForm.unit,
            bulkToBulk:
              $scope.myForm.freightWithBlFee.bulkToBulk /
              $scope.myForm.unit,
            bulkToBag:
              $scope.myForm.freightWithBlFee.bulkToBag /
              $scope.myForm.unit,
          };
          $scope.myForm.freightMT = {
            bagToBag: $scope.myForm.freightCWT.bagToBag * 22.046,
            bulkToBulk: $scope.myForm.freightCWT.bulkToBulk * 22.046,
            bulkToBag: $scope.myForm.freightCWT.bulkToBag * 22.046,
          };
        }
      }
      $scope.loadingPortList.forEach((val) => {
        if (val._id == $scope.myForm.loadingPortId) {
          $scope.loadingPortName = val.loadingPortName;
        }
      });
      if ($scope.loadingPortName == "Montreal") {
        $scope.bagToBag = getBagToBagPrice(
          $scope.myForm.freightMT,
          "bagToBag",
          $scope.freightSettingList[0].intermodalMTLUSD
        );
        $scope.bulkToBulk = getBagToBagPrice(
          $scope.myForm.freightMT,
          "bulkToBulk",
          $scope.freightSettingList[0].intermodalMTLUSD
        );
        $scope.bulkToBag = getBagToBagPrice(
          $scope.myForm.freightMT,
          "bulkToBag",
          $scope.freightSettingList[0].intermodalMTLUSD
        );
      } else if ($scope.loadingPortName == "Vancouver") {
        $scope.bagToBag = getBagToBagPrice(
          $scope.myForm.freightMT,
          "bagToBag",
          $scope.freightSettingList[0].intermodalVCRUSD
        );
        $scope.bulkToBulk = getBagToBagPrice(
          $scope.myForm.freightMT,
          "bulkToBulk",
          $scope.freightSettingList[0].intermodalVCRUSD
        );
        $scope.bulkToBag = getBagToBagPrice(
          $scope.myForm.freightMT,
          "bulkToBag",
          $scope.freightSettingList[0].intermodalVCRUSD
        );
      } else {
        $scope.bagToBag = 0;
        $scope.bulkToBulk = 0;
        $scope.bulkToBag = 0;
      }
      $scope.myForm.freightUSDMTFOB = {
        bagToBag: $scope.bagToBag,
        bulkToBulk: $scope.bulkToBulk,
        bulkToBag: $scope.bulkToBag,
      };
      $scope.myForm.validity = moment($scope.myForm.validity);
      if ($scope.myForm._id) {
        freightHttpServices
          .updateFreight($scope.myForm, $scope.token)
          .then(function (res) {
            if (res.data.status == 200) {
              $scope.filterData($scope.page);
              $scope.closepop();
            }
          });
      } else {
        freightHttpServices
          .addFreight($scope.myForm, $scope.token)
          .then(function (res) {
            if (res.data.status == 200) {
              $scope.filterData($scope.page);
              $scope.closepop();
            }
          });
      }
    };

    $scope.toggleAll = function () {
      var toggleStatus = !$scope.isAllSelected;
      angular.forEach($scope.options, function (itm) {
        itm.selected = toggleStatus;
      });
    };

    $scope.clear = function () {
      localStorage.removeItem("freight_filter");
      $scope.searchForm = {};
      $scope.initFreight(1, null, null, null, null,
        ($scope.searchForm.validityWithTime || $scope.todayDate),
        (+$scope.searchForm.onlyInvalid || 0)
      );
    };

    $scope.openPop = function (type, data) {
      if (type == "edit") {
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        if (data.shiplineId) {
          $scope.myForm.shiplineId = data.shiplineId._id;
        }
        $scope.getCity(data.countryName, false);
        if (data.loadingPortId && data.loadingPortId._id)
          $scope.getEquipment(data.loadingPortId._id);
        $scope.myForm.validity = moment(data.validity).format("YYYY-MM-DD");
        $scope.myForm.equipmentId =
          data.equipmentId && data.equipmentId._id ? data.equipmentId._id : "";
        if (data.freightCompanyId) {
          $scope.myForm.freightCompanyId = data.freightCompanyId._id;
          $scope.getShpline($scope.myForm.freightCompanyId);
        }
        if (data.oceanFreight.bagToBagOcean == undefined) {
          data.oceanFreight.bagToBagOcean = data.oceanFreight.bagToBag;
          data.oceanFreight.bagToBagStuffing = 0;

          data.oceanFreight.bagToBagStuffingCurrency = data.oceanFreight.bagToBagOceanCurrency =
            data.currencyType;
        }

        if (data.oceanFreight.bulkToBulkOcean == undefined) {
          data.oceanFreight.bulkToBulkOcean = data.oceanFreight.bulkToBulk;
          data.oceanFreight.bulkToBulkStuffing = 0;

          data.oceanFreight.bulkToBulkStuffingCurrency = data.oceanFreight.bulkToBulkOceanCurrency =
            data.currencyType;
        }

        if (data.oceanFreight.bulkToBagOcean == undefined) {
          data.oceanFreight.bulkToBagOcean = data.oceanFreight.bulkToBag;
          data.oceanFreight.bulkToBagStuffing = 0;

          data.oceanFreight.bulkToBagStuffingCurrency = data.oceanFreight.bulkToBagOceanCurrency =
            data.currencyType;
        }

        $scope.myForm.loadingPortId =
          data.loadingPortId && data.loadingPortId._id
            ? data.loadingPortId._id
            : "";
        $(".freight_view").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "note") {
        $scope.myForm = data;
        $(".note_view").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "add") {
        $scope.myForm = {};
        $scope.inputField = type;
        $(".freight_view").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.getCity(data.countryName);
        if (data.loadingPortId && data.loadingPortId._id)
          $scope.getEquipment(data.loadingPortId._id);
        $scope.myForm.validity = moment(data.validity).format("YYYY-MM-DD");
        $scope.myForm.equipmentId =
          data.equipmentId && data.equipmentId._id ? data.equipmentId._id : "";
        if (data.freightCompanyId) {
          $scope.myForm.freightCompanyId =
            data.freightCompanyId && data.freightCompanyId._id
              ? data.freightCompanyId._id
              : "";
          $scope.getShpline($scope.myForm.freightCompanyId);
        }
        $scope.myForm.loadingPortId =
          data.loadingPortId && data.loadingPortId._id
            ? data.loadingPortId._id
            : "";
        if (data.shiplineId) {
          $scope.myForm.shiplineId =
            data.shiplineId && data.shiplineId._id ? data.shiplineId._id : "";
        }
        $(".freight_view").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };

    $scope.exportExcel = function() {
      $scope.filterData(1, 50, function(data) {
        if (!data) return;
        var newData = data.map((freight) => {
          return {
            Country: freight.countryName,
            City: freight.cityName,
            'Loading Port': freight.loadingPortId.loadingPortName,
            Equipment: freight.equipmentId.equipmentName,
            'Freight Company': freight.freightCompanyId ? freight.freightCompanyId.freightCompanyName : null,
            ShipLine: freight.shiplineId ? freight.shiplineId.shipLineName : null,
            Unit: freight.unit,
            Currency: freight.currencyType,
            Validity: freight.validity ? moment(freight.validity).format('YYYY-MM-DD') : null,
            'Ocean Bag to bag': freight.oceanFreight.bagToBag,
            'Ocean Bulk to bulk': freight.oceanFreight.bulkToBulk,
            'Ocean Bulk to bag': freight.oceanFreight.bulkToBag,
            'Freight BL Bag to bag': freight.freightWithBlFee.bagToBag,
            'Freight BL Bulk to bulk': freight.freightWithBlFee.bulkToBulk,
            'Freight BL Bulk to bag': freight.freightWithBlFee.bulkToBag,
            'Freight CWT Bag to bag': freight.freightCWT.bagToBag,
            'Freight CWT Bulk to bulk': freight.freightCWT.bulkToBulk,
            'Freight CWT Bulk to bag': freight.freightCWT.bulkToBag,
            'Freight MT Bag to bag': freight.freightMT.bagToBag,
            'Freight MT Bulk to bulk': freight.freightMT.bulkToBulk,
            'Freight MT Bulk to bag': freight.freightMT.bulkToBag,
            'Freight USD MT FOB Bag to bag': freight.freightUSDMTFOB.bagToBag,
            'Freight USD MT FOB Bulk to bulk': freight.freightUSDMTFOB.bulkToBulk,
            'Freight USD MT FOB Bulk to bag': freight.freightUSDMTFOB.bulkToBag,
          };
        });
        var obj = {
          data: newData,
          fileName: moment().format("MM/DD/YYYY") + "_freight-report.xlsx",
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
      });
    };

    if ($scope.myForm && $scope.myForm.country) {
      $scope.getCity($scope.myForm.country);
    }
    $scope.delete = function (id) {
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one freight.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your will not be able to recover this freight!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              freightHttpServices.removeFreight($scope.data, $scope.token).then(
                function (res) {
                  if (res.data.status == 200) {
                    $scope.initFreight($scope.page);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal(
                      "Deleted!",
                      "Your freight has been deleted.",
                      "success"
                    );
                  }
                },
                function (error) {}
              );
            } else {
              swal("Cancelled", "Your freight file is safe :)", "error");
            }
          }
        );
      }
    };
    $scope.closepop = function () {
      $(".freight_view").fadeOut();
      $(".popup_overlay").fadeOut();
      $(".note_view").fadeOut();
    };
    $(".popup_overlay , .close").click(function () {
      $(".freight_view").fadeOut();
      $(".popup_overlay").fadeOut();
      $(".note_view").fadeOut();
    });
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });
  });
