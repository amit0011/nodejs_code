angular
  .module("myApp.outgoing", [])
  .controller("outgoingCtrl", function (
    $scope,
    scaleTicketHttpServices,
    httpService,
    $state,
    spinnerService,
    apiUrl,
    $rootScope,
    $window,
    freightCompanyHttpServices,
    commonService
  ) {
    var prev_filter = localStorage.getItem("outgoing_scale_filter");
    $scope.myForm = prev_filter
      ? JSON.parse(prev_filter)
      : { ticketType: "Outgoing" };

    $scope.active = {
      page: "scaleTicketOutgoing",
    };
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.truckScale ||
        !data.truckScale.outgoing ||
        !data.truckScale.outgoing.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.token = JSON.parse(localStorage.getItem("token"));

    httpService.getCommodity($scope.token).then(function (res) {
      $scope.commoditys = res.data.status == 200 ? res.data.data : [];
    });

    $scope.equipmentTypes = [
      { _id: "53 ft Intermodal", name: "53 ft Intermodal" },
      { _id: "40 ft Intermodal", name: "40 ft Intermodal" },
      { _id: "20 FT sourceload", name: "20 FT sourceload" },
      { _id: "40 ft Sourceload", name: "40 ft Sourceload" },
      { _id: "Dry Van", name: "Dry Van" },
      { _id: "Bulk Truck", name: "Bulk Truck" },
    ];

    freightCompanyHttpServices.getFreightCompany('', $scope.token).then(function(res) {
      $scope.freightCompanyList = res.data.status == 200 ? res.data.data : [];
      spinnerService.hide("html5spinner");
    });

    scaleTicketHttpServices.getTrucker($scope.token).then(function (res) {
      $scope.truckerList = res.data.status == 200 ? res.data.data : [];
    });

    $scope.updateField = function (scale, type) {
      spinnerService.show("html5spinner");
      var scaleData = _.clone(scale);

      scaleData.actualFreightBy = (scaleData.actualFreightBy && typeof scaleData.actualFreightBy === 'object') ?
        scaleData.actualFreightBy._id :
        scaleData.actualFreightBy;
      if (type === 'invoiceNumber') {
        if (scale.invoiceNumberTemp) {
          scaleData.invoiceNumber = scale.invoiceNumberTemp;
          delete scaleData.invoiceNumberTemp;
        } else {
          return;
        }
      }
      scaleData.binNumber = scaleData.binNumber ? scaleData.binNumber._id : scaleData.binNumber;
      scaleData.growerId = scaleData.growerId ? scaleData.growerId._id : scaleData.growerId;
      scaleData.analysis = scaleData.analysis ? scaleData.analysis.map(function(analysis) {
        return analysis ? {analysisId: analysis.analysisId._id} : analysis;
      }) : scaleData.analysis;
      scaleData.commodityId = scaleData.commodityId ? scaleData.commodityId._id : scaleData.commodityId;
      scaleData.gradeId = scaleData.gradeId ? scaleData.gradeId._id : scaleData.gradeId;
      scaleData.truckingCompany = scaleData.truckingCompany ? scaleData.truckingCompany._id : scaleData.truckingCompany;
      scaleData.buyerId = scaleData.buyerId ? scaleData.buyerId._id : scaleData.buyerId;

      scaleTicketHttpServices
        .updateScaleTicket(scaleData, $scope.token)
        .then(function (res) {
          spinnerService.hide("html5spinner");
          $scope.search($scope.page);
        });
    };

    $scope.search = function (pageNo) {
      $scope.myForm.limit = $scope.myForm.limit ? $scope.myForm.limit : "10";
      localStorage.setItem(
        "outgoing_scale_filter",
        JSON.stringify($scope.myForm)
      );

      spinnerService.show("html5spinner");

      var page = pageNo || 1;

      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");

      scaleTicketHttpServices
        .searchScaleTicket(searchParam, page, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.outgoingList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            for (var i = 0; i < $scope.outgoingList.length; i++) {
              $scope.outgoingList[i].status = $scope.outgoingList[
                i
              ].status.toString();

              $scope.outgoingList[i].cLoadTime = commonService.getDuration(
                $scope.outgoingList[i].containerIncomingDate,
                $scope.outgoingList[i].exitTime
              );
              $scope.outgoingList[i].timeToTicket = commonService.getDuration(
                $scope.outgoingList[i].inTime,
                $scope.outgoingList[i].exitTime
              );

              $scope.outgoingList[i].generateIncomingScalePDF = true;
              if (
                "updatePdf" in $scope.outgoingList[i] &&
                $scope.outgoingList[i].updatePdf == false
              ) {
                $scope.outgoingList[i].generateIncomingScalePDF = false;
              }
            }
          }
          spinnerService.hide("html5spinner");
        });
    };

    $scope.openPdf = (pdf) => {
      if (pdf) $window.open(pdf, "_blank");
    };

    $scope.DoCtrlPagingAct = function (page) {
      localStorage.setItem(
        "outgoing_scale_filter",
        JSON.stringify($scope.myForm)
      );
      if (page) localStorage.setItem("outgoing_page", page);
      else page = localStorage.getItem("outgoing_page") || 1;
      $scope.search(page);
    };

    $scope.clear = () => {
      $scope.myForm = {
        limit: "10",
        ticketType: "Outgoing",
      };
      localStorage.removeItem("outgoing_scale_filter");
      localStorage.setItem("outgoing_page", 1);
      $scope.search(1);
    };

    $scope.getClass = (data) => {
      var Class = "clsblue";
      if (data.void) {
        Class = "clsRed";
      } else if (
        data &&
        data.tareWeight != 0 &&
        data.analysisCompleted == false
      ) {
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

    $scope.exportSheet = () => {
      var request = new XMLHttpRequest();
      request.open("POST", apiUrl + "scale/outgoingExcelDownload", true);
      request.responseType = "blob";
      request.setRequestHeader("Content-type", "application/json");
      request.setRequestHeader("authorization", "Bearer " + $scope.token);
      request.onload = function (e) {
        if (this.status === 200) {
          console.log(this.response);
          var file = window.URL.createObjectURL(this.response);
          var a = document.createElement("a");
          a.href = file;
          a.download = "outgoing_ticket.xlsx";
          document.body.appendChild(a);
          a.click();
        }
      };

      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");
      request.send(JSON.stringify(searchParam));
    };

    $scope.exportCGCReport = () => {
      var newData = $scope.outgoingList.map((scale) => {
        return {
          Date: moment(scale.date).format("MM/DD/YYYY"),
          "Ticket Number": "RO-" + scale.ticketNumber,
          Gross: scale.grossWeightMT ? +scale.grossWeightMT.toFixed(3) : 0,
          Tare: scale.tareWeightMT ? +scale.tareWeightMT.toFixed(3) : 0,
          Net: scale.unloadWeidhtMT ? +scale.unloadWeidhtMT.toFixed(3) : 0,
          "Contract Number": scale.contractNumber || "",
          "Buyer Name":
            scale.buyerId && scale.buyerId.businessName
              ? scale.buyerId.businessName
              : "",
        };
      });
      var obj = {
        data: newData,
        fileName: moment().format("MM/DD/YYYY") + "_outgoing_cgc_tickets.xlsx",
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

    $scope.exportAllData = (filter) => {
      var searchParam = Object.assign({}, $scope.myForm);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");
      var obj = {
        filter: filter ? true : false,
        ticketType: $scope.myForm.ticketType,
        filterBy: searchParam,
        fileName: moment().format("MM/DD/YYYY") + "_Outgoing_ticket.xlsx",
      };
      var request = new XMLHttpRequest();
      request.open("POST", apiUrl + "scale/exportAll", true);
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

    $scope.generateBillOfLading = (result, $event, $index) => {
      $event.preventDefault();
      spinnerService.show("html5spinner");
      scaleTicketHttpServices
        .generateBillOfLading(result._id, $scope.token)
        .then(
          function ({ data: result }) {
            spinnerService.hide("html5spinner");
            if (result.status == 200) {
              const outgoingList = [...$scope.outgoingList];
              outgoingList[$index] = result.data;
              console.log(result);
              $scope.outgoingList = outgoingList;
              window.open(result.data.billOfLadingURL, "_blank");
            }
          },
          function (error) {
            console.log(error);
            spinnerService.hide("html5spinner");
          }
        );
    };

    $scope.unlockScaleTicket = (result, key) => {
      swal(
        {
          title: "Are you sure?",
          text: "You want to unlock this Scale Ticket!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, unlock it!",
          cancelButtonText: "No, cancel!",
          closeOnConfirm: false,
          closeOnCancel: false,
        },
        function (isConfirm) {
          if (isConfirm) {
            spinnerService.show("html5spinner");
            var obj = {
              type: key,
            };
            scaleTicketHttpServices
              .unlockTicket(result._id, obj, $scope.token)
              .then(
                function (res) {
                  spinnerService.hide("html5spinner");
                  if (res.data.status == 200) {
                    result[key] = false;
                    swal("Unlocked!", "Scale ticket is unlocked.", "success");
                  }
                },
                function (error) {
                  spinnerService.hide("html5spinner");
                }
              );
          } else {
            swal("Cancelled", "Your Scale Ticket is safe :)", "error");
          }
        }
      );
    };
  });
