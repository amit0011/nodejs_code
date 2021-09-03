angular
  .module("myApp.scaleTicket", [])
  .controller("scaleTicketCtrl", function (
    $scope,
    scaleTicketHttpServices,
    httpService,
    $state,
    $stateParams,
    spinnerService,
    sudAdminHttpService,
    binHttpService,
    apiUrl,
    $rootScope,
    imageUrl,
    commonService
  ) {
    $scope.$on("access", (event, data) => {
      if ($stateParams.type == "incomingInventory") {
        if (
          !data ||
          !data.truckScale ||
          !data.truckScale.incomingInventory ||
          !data.truckScale.incomingInventory.viewMenu
        ) {
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
          $state.go("login");
          swal("ERROR", "Access denied", "error");
        }
      } else if ($stateParams.type == "outgoingInventory") {
        if (
          !data ||
          !data.truckScale ||
          !data.truckScale.outgoingInventory ||
          !data.truckScale.outgoingInventory.viewMenu
        ) {
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
          $state.go("login");
          swal("ERROR", "Access denied", "error");
        }
      } else {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Something went wrong", "error");
      }
    });
    $scope.myForm = {
      limit: "10",
    };
    $scope.selected = {};
    $scope.arr = [];
    $scope.allChecked = true;
    $scope.printTicket = false;
    var pageNo = localStorage.getItem("scale_ticket_page") || 1;

    $scope.extraKeysObject = {};
    $scope.showAllow = false;
    $scope.showMoisture = false;
    $scope.limit = 15;
    $scope.showLightbulb = "";
    $scope.imageUrl = imageUrl;
    $scope.sizeKabuli = [];
    $scope.kabuliFields = [];
    var a = [
      "",
      "One ",
      "Two ",
      "Three ",
      "Four ",
      "Five ",
      "Six ",
      "Seven ",
      "Eight ",
      "Nine ",
      "Ten ",
      "Eleven ",
      "Twelve ",
      "Thirteen ",
      "Fourteen ",
      "Fifteen ",
      "Sixteen ",
      "Seventeen ",
      "Eighteen ",
      "Nineteen ",
    ];
    var b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    $scope.ticketNumber = $stateParams.tickertNo;
    $scope.myForm.withContractNumber = "withContractNumber";
    $scope.userType = JSON.parse(localStorage.getItem("userType"));

    $scope.getLabel = function (key) {
      return typeof $scope.extraKeysObject[key] === "object"
        ? $scope.extraKeysObject[key].label
        : $scope.extraKeysObject[key];
    };

    $scope.getValue = function (data, key) {
      if (typeof $scope.extraKeysObject[key] !== "object") {
        return data[key];
      }

      return typeof $scope.extraKeysObject[key].value === "function"
        ? $scope.extraKeysObject[key].value(data)
        : data[key];
    };

    if ($stateParams.type == "incomingInventory") {
      $scope.extraKeysObject = {
        contractNumber: "Contract #",
      };
      $scope.showType = "incomingInventory";
      $scope.title = "Incoming Inventory";
      $scope.ticketType = "Incoming";
      $scope.limit = 15;
      $scope.active = {
        page: "scaleTicketIncomingInventory",
      };
    } else if ($stateParams.type == "outgoingInventory") {
      // unloadWeidht
      $scope.myForm.fetchExtra = {
        bagId: "name",
        pallet: "name",
        stuffer: "freightCompanyName",
      };
      $scope.extraKeysObject = {
        contractExtra: {
          label: "Contract #",
          value: function (data) {
            return (
              data.contractNumber +
              (data.contractExtra ? "-" + data.contractExtra : "")
            );
          },
        },
        partyContract: "3rd Party Contract#",
        trackUnit: "Truck/Unit#",
        seal: "Seal#",
        cleanBinNumber: "Clean Bin#",
        lotNumber: "Lot#",
        invoiceNumber: "Invoice#",
        equipmentType: "Equipment Type",
        moisture: "Moisture",
        size: "Size",
        truckerBL: "Trucker B/L",
        containeNumber: "Container#",
        morrowLoadNumber: "Broker Load#",
        productWeight: "Product Weight",
        bagId: {
          label: "Bag",
          value: function (data) {
            return data.bagId ? data.bagId.name : "";
          },
        },
        bagsWeight: "Bag Wt",
        numberOfBags: "No of bags",
        totalPackagingWeight: "Total Packaging Wt",
        pallet: {
          label: "Pallet",
          value: function (data) {
            return data.pallet ? data.pallet.name : "";
          },
        },
        palletsWeight: "Pallet Wt",
        numberOfPallets: "No of pallets",
        targetWeight: "Target Wt",
        netWeightPerBag: "Net Wt/Bag",

        freightBy: "Freight By",
        actualFreight: {
          label: "Actual Freight",
          value: function (data) {
            return data.actualFreight
              ? data.actualFreightCurrency + " " + data.actualFreight
              : "";
          },
        },
        actualFreightBy: {
          label: "Actual freight By",
          value: function (data) {
            return data.actualFreightBy
              ? data.actualFreightBy.freightCompanyName
              : "";
          },
        },
        fdaNumber: "FDA#",
        fcAccountOf: "Freight Charges for the account of",
        buyerAddressId: {
          label: "Destination",
          value: function (data) {
            if (data.buyerAddressId) {
              var address = data.buyerId
                ? data.buyerId.addresses.find(function (addr) {
                    return addr._id === data.buyerAddressId;
                  })
                : null;
              return address ? address.street : "";
            }
            return "";
          },
        },
        stuffer: {
          label: "Stuffer",
          value: function (data) {
            return data.stuffer ? data.stuffer.freightCompanyName : "";
          },
        },
        invoicedWeight: "Invoiced Wt (Kgs)",
        shippingNumber: "PO#",
        bookingNumber: "Booking#",
        papsNumber: "PAPS#",
      };
      $scope.showType = "outgoingInventory";
      $scope.title = "Outgoing Load Analysis";
      $scope.ticketType = "Outgoing";
      $scope.limit = 15;
      $scope.active = {
        page: "scaleTicketOutgoingInventory",
      };
    } else {
      $scope.ticketType = "";
    }
    $scope.extraKeys = Object.keys($scope.extraKeysObject);

    function secondsToHms(d) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);

      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes ") : "";
      return hDisplay + mDisplay;
    }

    $scope.token = JSON.parse(localStorage.getItem("token"));

    httpService.getCommodity($scope.token).then(function (res) {
      $scope.commoditys = res.data.status == 200 ? res.data.data : [];
    });

    binHttpService.getbin($scope.token, "").then(function (res) {
      $scope.binList = res.data.status == 200 ? res.data.data : [];
    });

    scaleTicketHttpServices.getTrackWeight($scope.token).then(function (res) {
      if (res.data.status == 200) {
        if (res.data.data.weight > 0) {
          $scope.showLightbulb = "green";
        } else {
          $scope.showLightbulb = "red";
        }
      }
    });

    sudAdminHttpService
      .getreceiver(pageNo, $scope.token, "RECEIVER")
      .then(function (res) {
        $scope.receiverList = res.data.status == 200 ? res.data.data : [];
        spinnerService.hide("html5spinner");
      });

    $scope.getClass = (data) => {
      var Class = "clsblue";
      if (data && data.tareWeight != 0 && data.analysisCompleted == false) {
        Class = "clsblue";
      } else if (
        data &&
        data.tareWeight == 0 &&
        data.analysisCompleted == false
      ) {
        Class = "clsRed";
      } else if (data && data.analysisCompleted) {
        Class = "clsblack";
      }
      return Class;
    };

    $scope.getName = (result) => {
      if (result.buyerId) {
        return result.buyerId.businessName;
      } else if (result.growerId) {
        if (result.displayOnTicket == "Farm Name") {
          return result.growerId.farmName;
        } else {
          return result.growerId.firstName + " " + result.growerId.lastName;
        }
      } else return "";
    };

    $scope.DoCtrlPagingAct = function (text, page) {
      if ($scope.showType == "incoming" || $scope.showType == "Incoming") {
        localStorage.setItem(
          "incoming_scale_filter",
          JSON.stringify($scope.myForm)
        );
      } else if (
        $scope.showType == "outgoing" ||
        $scope.showType == "Outgoing"
      ) {
        localStorage.setItem(
          "outgoing_scale_filter",
          JSON.stringify($scope.myForm)
        );
      }

      var key = $scope.showType + "_page";
      if (page) localStorage.setItem(key, page);
      else page = localStorage.getItem(key) || 1;

      if (text == "clear") {
        if ($scope.showType == "incoming" || $scope.showType == "Incoming") {
          localStorage.removeItem("incoming_scale_filter");
        } else if (
          $scope.showType == "outgoing" ||
          $scope.showType == "Outgoing"
        ) {
          localStorage.removeItem("outgoing_scale_filter");
        }
        $scope.myForm = {
          limit: "10",
        };
      }
      $scope.search(page);
    };

    $scope.search = function (pageNo, cb) {
      if (!$scope.myForm.commodity) {
        $scope.scaleTicketList = [];
        return;
      }

      var analysis =
        $stateParams.type == "incomingInventory"
          ? "commodityDeliveryAnalysis"
          : "commodityShipmentAnalysis";
      $scope.analysis = $scope.commoditys.find(function (commodity) {
        return commodity._id == $scope.myForm.commodity;
      });

      if ($scope.myForm.commodity == "5ba549c3e623a2362e4b36ae") {
        $scope.sizeKabuli = ["Size 7", "Size 8", "Size 9", "Size 10"];
        $scope.kabuliFields = ["size7", "size8", "size9", "size10"];
      } else {
        $scope.sizeKabuli = [];
        $scope.kabuliFields = [];
      }
      $scope.analysis = $scope.analysis[analysis];

      if ($scope.showType == "incomingInventory") {
        localStorage.setItem(
          "incoming_scale_filter",
          JSON.stringify($scope.myForm)
        );
      } else if ($scope.showType == "outgoingInventory") {
        $scope.myForm.bagType = "!Bulk";
        localStorage.setItem(
          "outgoing_scale_filter",
          JSON.stringify($scope.myForm)
        );
      }
      spinnerService.show("html5spinner");
      $scope.myForm.ticketType = $scope.ticketType;
      $scope.myForm.unvoided = true;
      var page = pageNo || 1;

      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");

      scaleTicketHttpServices
        .searchScaleTicket(searchParam, page, $scope.token)
        .then(
          function (res) {
            if (res.data.status == 200) {
              $scope.scaleTicketList = res.data.data.docs;
              $scope.page = res.data.data.page;
              $scope.totalPages = res.data.data.total;
              for (var i = 0; i < $scope.scaleTicketList.length; i++) {
                $scope.scaleTicketList[i].status = $scope.scaleTicketList[
                  i
                ].status.toString();
                $scope.scaleTicketList[i].startDate = new Date(
                  $scope.scaleTicketList[i].inTime
                );
                $scope.scaleTicketList[i].endDate = new Date(
                  $scope.scaleTicketList[i].exitTime
                );
                $scope.scaleTicketList[i].seconds =
                  ($scope.scaleTicketList[i].endDate.getTime() -
                    $scope.scaleTicketList[i].startDate.getTime()) /
                  1000;
                $scope.scaleTicketList[i].unloadTime = secondsToHms(
                  $scope.scaleTicketList[i].seconds
                );
                $scope.scaleTicketList[i].name = $scope.getName(
                  $scope.scaleTicketList[i]
                );
              }

              if (cb) {
                cb($scope.scaleTicketList);
              }
            }
            spinnerService.hide("html5spinner");
          },
          function (error) {
            //console.log(JSON.stringify(error));
          }
        );
    };

    scaleTicketHttpServices.getTrucker($scope.token).then(function (res) {
      $scope.truckerList = res.data.status == 200 ? res.data.data : [];
    });

    $scope.getMTValueOfAnalysis = (scaleTicket, analysisKey) => {
      var weight = 0;
      scaleTicket.analysis.filter((anal) => {
        if (anal.analysisId.analysisName == analysisKey) {
          weight = anal.weightMT;
        }
      });
      return weight.toFixed(3);
    };

    $scope.getNetWeight = (scale) => {
      var netWeight = 0;
      if (
        $stateParams.type == "outgoingInventory" ||
        $stateParams.type == "incomingInventory"
      ) {
        netWeight =
          $stateParams.type == "outgoingInventory"
            ? scale.unloadWeidht
            : scale.netTotalWeight;
      }
      return netWeight;
    };

    $scope.exportSheet = function () {
      var old_limit = $scope.myForm.limit;
      $scope.page = 1;
      $scope.myForm.limit = 2000;
      $scope.search($scope.page, function (data) {
        $scope.myForm.limit = old_limit;
        var newData = data.map(function (scale) {
          scale.name = $scope.getName(scale);
          if (!scale.truckingCompany) {
            $scope.truckerName = "";
          } else {
            $scope.truckerName = scale.truckingCompany.truckerName;
          }
          if (scale.commodityId) {
            $scope.commodityCode = scale.commodityId.commodityCode;
            $scope.commodityName = scale.commodityId.commodityName;
          } else {
            $scope.commodityCode = "";
            $scope.commodityName = "";
          }
          if (scale.gradeId) {
            scale.gradeName = scale.gradeId.gradeName;
          }
          $forName =
            $scope.showType == "incomingInventory" ? "Grower" : "Buyer";
          var data = {
            Date: moment(scale.date).format("MM/DD/YYYY"),
            [`${$forName} Name`]: scale.name,
            "Ticket Number": "RI-" + scale.ticketNumber,
            Bin: scale.binNumber ? scale.binNumber.binName : "",
            "Trucking Company": $scope.truckerName || "",
            Gross: scale.grossWeightMT || 0,
            Tare: scale.tareWeightMT || 0,
            Net: $scope.getNetWeight(scale) || "",
            Commodity: $scope.commodityName || "",
            Grade: scale.gradeName || "",
            Code: $scope.commodityCode || "",
          };

          $scope.extraKeys.forEach(function (key) {
            data[$scope.getLabel(key)] = $scope.getValue(scale, key) || "";
          });

          $scope.analysis.forEach(function (ana) {
            var anaObj = scale.analysis.find(function (row) {
              return row.analysisId.analysisName == ana.analysisName;
            });
            data[ana.analysisName] = anaObj ? (anaObj.value || "") : 0;
          });

          $scope.sizeKabuli.forEach(function (sk, idx) {
            data[sk] = scale.sizeKabuli[0][$scope.kabuliFields[idx]] || '';
          });

          return data;
        });
        var obj = {
          data: newData,
          fileName:
            moment().format("MM/DD/YYYY") + $scope.showType + " ticket.xlsx",
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
  });
