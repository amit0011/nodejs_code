angular
  .module("myApp.buyerDetails", [])
  .controller("buyerDetailsCtrl", function (
    $scope,
    buyerHttpServices,
    spinnerService,
    $stateParams,
    httpService,
    salesContractHttpServices,
    tradePurchaseHttpServices,
    quoteHttpService,
    $timeout,
    scaleTicketHttpServices,
    weatherHttpService,
    edcHttpService,
    imageUrl,
    $state,
    documentsHttpService,
    tradePurchaseScaleHttpServices,
    ckEditorService,
    $rootScope,
    $log,
    countryHttpService,
    commonService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.sales ||
        !data.sales.buyers ||
        !data.sales.buyers.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });
    $scope.active = {
      page: "buyers",
    };
    $scope.qtyLimit = 1;
    $scope.myForm = {};
    $scope.rolloverForm = {};
    $scope.newForm = {
      selectedDocuments: [],
    };
    $scope.imagePath = imageUrl;
    $scope.arr = [];
    $scope.allChecked = true;
    var i;
    var pageNo = 1;
    $scope.sendMail = false;
    $scope.showBtnRollover = false;
    $scope.inputField = "Add";
    $scope.ticketType = "Outgoing";
    $scope.limit = 5;
    $scope.pdfUrl = "/outgoingScaleTicketPDF";
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.buyerId = $stateParams.buyerId;
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.canChangeStatus = function (contract) {
      return commonService.canChangeStatus(contract, $rootScope.loggedInUser);
    };
    weatherHttpService.getweather(pageNo, $scope.token).then(function (res) {
      $scope.weather = res.data.status == 200 ? res.data.data.docs[0] : null;
    });
    edcHttpService.allEdc($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.edcList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    $scope.$watch("showBtnRollover", function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $log.log("Changed!");
      }
    });

    $scope.dayList = [
      { dayName: "Monday" },
      { dayName: "Tuesday" },
      { dayName: "Wednesday" },
      { dayName: "Thursday" },
      { dayName: "Friday" },
      { dayName: "Saturday" },
      { dayName: "Sunday" },
    ];
    if ($scope.buyerId) {
      $scope.buyerDetailsInit = () => {
        buyerHttpServices.getBuyerDetails($scope.buyerId, $scope.token).then(
          function (res) {
            if (res.data.status == 200) {
              $scope.buyerDetails = res.data.data;
              $scope.cachedNote = $scope.buyerDetails.note;
              if ($scope.buyerDetails.days) {
                $timeout(function () {
                  $scope.dayList.map(function (el) {
                    for (var i = 0; i < $scope.buyerDetails.days.length; i++) {
                      if ($scope.buyerDetails.days[i].dayName == el.dayName) {
                        let { dayName } = $scope.buyerDetails.days[i];
                        var index = $scope.dayList.findIndex(
                          (x) => x.dayName == dayName
                        );
                        $scope.dayList[index].ticked = true;
                      }
                    }
                  });
                }, 500);
              }
              $scope.initEmployees(pageNo);
              $scope.initPhoneNote();
            }
          },
          function (error) {
            console.log(JSON.stringify(error));
          }
        );
      };
      $scope.buyerDetailsInit();
    }

    $scope.saveNote = function() {
      if ($scope.cachedNote == $scope.buyerDetails.note) return;

      spinnerService.show("html5spinner");
      httpService.updateBuyerNote($scope.buyerDetails._id, $scope.buyerDetails.note, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.cachedNote = $scope.buyerDetails.note;
          }
          spinnerService.hide("html5spinner");
        })
    };

    function secondsToHms(d) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor((d % 3600) / 60);
      var s = Math.floor((d % 3600) % 60);
      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes ") : "";
      return hDisplay + mDisplay;
    }

    $scope.getAddresses = () => {
      return $scope.buyerDetails && $scope.buyerDetails.addresses
        ? $scope.buyerDetails.addresses.filter((addr) => addr.isDeleted == 0)
        : [];
    };

    $scope.initScales = (pageNo) => {
      spinnerService.show("html5spinner");

      scaleTicketHttpServices
        .getScaleTicket(
          pageNo,
          $scope.ticketType,
          $scope.token,
          $scope.limit,
          $scope.buyerId
        )
        .then(
          function (res) {
            if (res.data.status == 200) {
              $scope.scaleTicketList = res.data.data.docs;
              $scope.scalePage = res.data.data.page;
              $scope.scaleTotalPages = res.data.data.total;
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
                if ($scope.scaleTicketList[i].displayOnTicket) {
                  if (
                    $scope.scaleTicketList[i].displayOnTicket == "Grower Name"
                  ) {
                    if ($scope.scaleTicketList[i].growerId) {
                      $scope.scaleTicketList[i].growerFullName =
                        $scope.scaleTicketList[i].growerId.firstName +
                        " " +
                        $scope.scaleTicketList[i].growerId.lastName;
                    }
                  } else {
                    if ($scope.scaleTicketList[i].growerId) {
                      $scope.scaleTicketList[i].growerFullName =
                        $scope.scaleTicketList[i].growerId.farmName;
                    }
                  }
                }
              }
              spinnerService.hide("html5spinner");
            }
          },
          function (error) {
            console.log(JSON.stringify(error));
          }
        );
    };
    $scope.initSalesContractByBuyer = () => {
      buyerHttpServices
        .getsalesContractByBuyer($scope.buyerId, $scope.token)
        .then(
          function (res) {
            if (res.data.status == 200) {
              $scope.salesContractList = [];
              res.data.data.docs.forEach((salesContract) => {
                salesContract.status = salesContract.status.toString();

                  salesContract.delQty = salesContract.scale
                    ? salesContract.scale.reduce((acc, next) => {
                        return !next.void ? acc + next.unloadWeidht : acc;
                      }, 0) * 2.2046
                    : 0;
                  salesContract.delQty += salesContract.tradeScale
                    ? salesContract.tradeScale.reduce((acc, next) => {
                        return !next.void ? acc + next.unloadWeidht : acc;
                      }, 0) * 2.2046
                    : 0;
                  salesContract.delQty += salesContract.scale_loadsheet
                    ? salesContract.scale_loadsheet.reduce((acc, next) => {
                        return !next.void ? acc + next.unloadWeidht : acc;
                      }, 0) * 2.2046
                    : 0;
                  $scope.salesContractList.push(salesContract);
              });
              spinnerService.hide("html5spinner");
            }
          },
          function (error) {
            console.log(JSON.stringify(error));
          }
        );
    };
    $scope.initEmployees = function (pageNo) {
      spinnerService.show("html5spinner");
      buyerHttpServices.getEmployees(pageNo, $scope.buyerId, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.employeesList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            spinnerService.hide("html5spinner");
          }
        },
        function (error) {
          console.log(JSON.stringify(error));
        }
      );
      $scope.initSalesContractByBuyer();
      buyerHttpServices
        .getTradePurchaseList($scope.buyerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.tradePurchaseList = res.data.data.docs;
            for (var i = 0; i < $scope.tradePurchaseList.length; i++) {
              $scope.tradePurchaseList[i].status = $scope.tradePurchaseList[
                i
              ].status.toString();
            }
            spinnerService.hide("html5spinner");
          }
        });
    };
    $scope.showBrokerNote = function(note) {
      $scope.brokerNote = note;
      console.log(note, 'called');

      $(".add_pdf_qty.broker-note").fadeIn();
      $(".popup_overlay").fadeIn();
    };

    $scope.uploadForm = {};
    $scope.openPopup = function (type, data) {
      if (type == "uploadPDF") {
        $scope.uploadForm.signedContractPdf = null;
        $scope.uploadForm.brokerNote = data.brokerNote;
        $scope.errMsg = "";
        $scope.file = "";
        $scope.selectedContract = data;
        $('[name="addPdfAndQtyForm_342159"]')[0].reset();
        $(".add_pdf_qty.upload-form-popup").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };

    $scope.selectFile = function (input, type) {
      $scope.uploadForm[type] = input.files[0];
      if (!$scope.uploadForm[type]) {
        return;
      }
      var ext = $scope.uploadForm[type].name.split(".").pop();
      if (!["pdf", "jpg", "png", "jpeg"].includes(ext)) {
        $scope.errMsgs = "Invalid file selected";
        $scope.uploadForm[type] = "";
      }
    };

    $scope.uploadPdf = (field) => {
      if ($scope.uploadForm[field]) {
        spinnerService.show("html5spinner");
        var data = {
          file: $scope.uploadForm[field],
          field: field,
          brokerNote: $scope.uploadForm.brokerNote
        };
        salesContractHttpServices
          .uploadPdf(data, $scope.selectedContract._id, $scope.token)
          .then(
            function (res) {
              spinnerService.hide("html5spinner");
              if (res.data.status == 200) {
                Object.assign($scope.selectedContract, res.data.data);
                $scope.closepop();
                swal("Success", "Pdf uploaded successfully.", "success");
                $scope.initSalesContract();
              } else {
                $scope.errMsg = res.data.userMessage;
              }
            },
            function (error) {
              spinnerService.hide("html5spinner");
            }
          );
      } else {
        $scope.errMsg = $scope.errMsg ? $scope.errMsg : "Please select file";
      }
    };
    $scope.contractClass = (contract) => {
      if (contract.isRollover) {
        return "rolledover-contract";
      }
      return contract.status == "1"
        ? "voided-contract"
        : contract.status == "2"
        ? "completed-contract"
        : "active-contract";
    };

    $scope.initSalesContract = () => {
      buyerHttpServices
        .getsalesContract($scope.buyerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.salesContractList = [];
            res.data.data.forEach((salesContract) => {
              salesContract.status = salesContract.status.toString();

                salesContract.delQty = salesContract.scale
                  ? salesContract.scale.reduce((acc, next) => {
                      return !next.void ? acc + next.unloadWeidht : acc;
                    }, 0) * 2.2046
                  : 0;

                $scope.salesContractList.push(salesContract);
            });
            spinnerService.hide("html5spinner");
          }
        });
    };

    countryHttpService.getCountryList($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.countryList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    $scope.checkIfRolloverHaveToVisible = (contract) => {
      var currentDate = moment();
      var year = currentDate.year();
      var currentCropYear = currentDate.month() < 8 ? year - 1 : year;
      var cropYear = +contract.cropYear;

      if (
        // check if contract is active
        contract.status != 0 ||
        // check if contract is from last crop year has no rollover record
        (!contract.rolloverCN && currentCropYear <= cropYear)
      ) {
        return false;
      }

      return true;
    };

    $scope.createRollover = (valid) => {
      $scope.submitted = true;
      if (valid) {
        httpService
          .createSalesContractRollover($scope.rolloverForm, $scope.token)
          .then(
            function (res) {
              if (res.data.status == 200) {
                $scope.initSalesContract();
                swal(
                  "Successful!",
                  "Rollover for sales contract created.",
                  "success"
                );
              } else {
                swal("Unsuccessful", res.data.userMessage, "error");
              }
            },
            function (error) {
              swal(
                "Unsuccessful",
                "Was unable to create rollover sales contract",
                "error"
              );
            }
          );

        $(".rollover_popup").fadeOut();
        $(".popup_overlay").fadeOut();
      }
    };

    $scope.inventoryGrades = {};
    $scope.loadInventoryGrade = function (id) {
      httpService.getInventoryGrade("", id, $scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.inventoryGrade = $scope.inventoryGrades[id] = res.data.data;
        }
      });
    };

    $scope.showRolloverPopup = (contract) => {
      var commodityId = contract.commodityId._id;
      if (!$scope.inventoryGrades[commodityId]) {
        $scope.loadInventoryGrade(commodityId);
      } else {
        $scope.inventoryGrade = $scope.inventoryGrades[commodityId];
      }

      $(".rollover_popup").fadeIn();
      $(".popup_overlay").fadeIn();

      $scope.rolloverForm.contract_id = contract._id;
      $scope.rolloverContract = contract;
      $scope.rolloverForm.quantityLbs = Math.floor(
        contract.quantityLbs - contract.delQty
      );
    };

    $scope.initTradePurchase = () => {
      buyerHttpServices
        .getTradePurchaseList($scope.buyerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.tradePurchaseList = res.data.data.docs;
            for (var i = 0; i < $scope.tradePurchaseList.length; i++) {
              $scope.tradePurchaseList[i].status = $scope.tradePurchaseList[
                i
              ].status.toString();
            }
            spinnerService.hide("html5spinner");
          }
        });
    };

    $scope.initTradePurchaseScale = () => {
      tradePurchaseScaleHttpServices
        .getAllTradePurchaseList($scope.buyerId, $scope.token)
        .then(function (res) {
          $scope.tradePurchaseScaleList =
            res.data.status == 200 ? res.data.data : [];
        });
    };

    $scope.initTradePurchaseScale();

    $scope.DoCtrlPagingAct = function (text, page, pageSize, total) {
      if (text == "Scale") {
        $scope.initScales(page);
        $scope.myForm = {};
      } else {
        $scope.initEmployees(page);
        $scope.myForm = {};
      }
    };

    $scope.checkValueLength = (key) => {
      if ($scope.myForm[key]) {
        var copy_value = angular.copy($scope.myForm[key]).toString();
        if (copy_value.length > 17) {
          var new_value = copy_value.substring(0, 17);
          $scope.myForm[key] = Number(new_value);
        }
      }
    };

    $scope.getShippedQuantityLbs = (scale) => {
      var totalShippedQuantityLbs = 0;
      if (scale && scale.length > 0) {
        scale.forEach((val) => {
          // convert kg to pounds ( Number(val.netWeight) * 2.2046)
          if (!val.void) {
            totalShippedQuantityLbs +=
              val.unloadWeidht && !val.void
                ? Number(val.unloadWeidht) * 2.2046
                : 0;
          }
        });
      }
      return totalShippedQuantityLbs;
    };

    $scope.DoCtrlPagingAct1 = function (text, page, pageSize, total) {
      $scope.initScales(page);
      $scope.myForm = {};
    };
    $scope.initEmployees(pageNo);
    $scope.initScales(pageNo);

    $scope.initdocuments = () => {
      $scope.documentsList = [];
      documentsHttpService.getdocuments($scope.token).then(function (res) {
        $scope.documentsList = res.data.status == 200 ? res.data.data : [];
      });
    };

    $scope.initdocuments();

    $scope.save = function () {
      $scope.myForm.buyerId = $scope.buyerId;
      buyerHttpServices
        .addEmployees($scope.myForm, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.initEmployees(1);
            $scope.myForm = {};
            $scope.closepop();
            $("#analysisFrom").trigger("reset");
          } else {
            swal("Message", res.data.userMessage, "error");
          }
        });
    };

    // start rajeev add address code

    $scope.addAddresssave = function () {
      $scope.myForm.buyerId = $scope.buyerId;
      buyerHttpServices
        .addBuyerAddress($scope.myForm, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.initEmployees(1);
            $scope.myForm = {};
            $scope.closepop();
            $("#analysisFrom").trigger("reset");
            $scope.buyerDetails = res.data.data;
            $scope.cachedNote = $scope.buyerDetails.note;
            //console.log(res.data.data);
            swal("Message", res.data.userMessage, "success");
          } else {
            swal("Message", res.data.userMessage, "error");
          }
        });
    };

    $scope.editAddresssave = function () {
      buyerHttpServices
        .editAddresssave($scope.myForm, $scope.buyerDetails._id, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.initEmployees(1);
            $scope.myForm = {};
            $scope.closepop();
            $scope.buyerDetails = res.data.data;
            $scope.cachedNote = $scope.buyerDetails.note;
            swal("Message", res.data.userMessage, "success");
          } else {
            swal("Message", res.data.userMessage, "error");
          }
        });
    };

    $scope.deleteAddress = function (id) {
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one employees.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
          _id: $scope.buyerDetails._id,
        };
        swal(
          {
            title: "Are you sure?",
            text: "Do you want to delete",
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
              buyerHttpServices
                .removeBuyerAddress($scope.data, $scope.token)
                .then(function (res) {
                  if (res.data.status == 200) {
                    $scope.initEmployees(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    $scope.buyerDetails = res.data.data;
                    $scope.cachedNote = $scope.buyerDetails.note;
                    swal({
                      title: "Deleted!",
                      text: "Your Address has been deleted.",
                      type: "success",
                      timer: 2000,
                    });
                  }
                });
            } else {
              swal({
                title: "Cancelled!",
                text: "Your Address info is safe :)",
                type: "error",
                timer: 1000,
              });
            }
          }
        );
      }
    };

    $scope.setDefaultAddress = function (id) {
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one employees.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
          _id: $scope.buyerDetails._id,
        };
        swal(
          {
            title: "Are you sure?",
            text: "Do you want to set default",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, default it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              buyerHttpServices
                .setDefaultBuyerAddress($scope.data, $scope.token)
                .then(function (res) {
                  if (res.data.status == 200) {
                    $scope.initEmployees(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    $scope.buyerDetails = res.data.data;
                    $scope.cachedNote = $scope.buyerDetails.note;
                    swal({
                      title: "Deleted!",
                      text: "Your Address has been deleted.",
                      type: "success",
                      timer: 2000,
                    });
                  }
                });
            } else {
              swal({
                title: "Cancelled!",
                text: "Your Address info is safe :)",
                type: "error",
                timer: 1000,
              });
            }
          }
        );
      }
    };

    //end rajeev address

    $scope.updateEmployee = function () {
      buyerHttpServices
        .updateEmployees($scope.myForm, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.initEmployees(1);
            $scope.myForm = {};
            $scope.closepop();
          } else {
            swal("Message", res.data.userMessage, "error");
          }
        });
    };

    $scope.changeSalesContractStatus = (contract) => {
      var data = {
        _id: contract._id,
        status: Number(contract.status),
        statusChanged: true,
      };
      if (contract.status == 1) {
        swal(
          {
            title: "Are you sure?",
            text: "You want to adjust the purchase to the delivered qty?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, Complete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              $scope.contractStatusChange(data);
            } else {
              swal("Cancelled", "Your contract file is safe :)", "error");
              $scope.buyerDetailsInit();
            }
          }
        );
      } else {
        $scope.contractStatusChange(data);
      }
    };

    $scope.contractStatusChange = (data) => {
      spinnerService.show("html5spinner");
      salesContractHttpServices
        .changeSalesContractStatus(data, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            swal("Alert", res.data.userMessage, "success");
          } else {
            swal("Alert", res.data.userMessage, "error");
          }
          $scope.buyerDetailsInit();
          spinnerService.hide("html5spinner");
        });
    };

    $scope.delete = function (id) {
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one employees.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your will not be able to recover this employees!",
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
              buyerHttpServices
                .removeEmployees($scope.data, $scope.token)
                .then(function (res) {
                  if (res.data.status == 200) {
                    $scope.initEmployees(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal({
                      title: "Deleted!",
                      text: "Your employees has been deleted.",
                      type: "success",
                      timer: 2000,
                    });
                  }
                });
            } else {
              swal({
                title: "Cancelled!",
                text: "Your employees info is safe :)",
                type: "error",
                timer: 1000,
              });
            }
          }
        );
      }
    };
    $scope.initPhoneNote = () => {
      httpService
        .getPhoneNote($scope.token, "", $scope.buyerId, "", "")
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.phoneNoteList = res.data.data.reverse();
            for (i = 0; i < $scope.phoneNoteList.length; i++) {
              if ($scope.phoneNoteList[i].createdBy) {
                $scope.phoneNoteList[i].fullName =
                  $scope.phoneNoteList[i].createdBy.fullName;
              } else {
                $scope.phoneNoteList[i].fullName =
                  $scope.phoneNoteList[i].userName;
              }
            }
          }
        });
    };
    $scope.phoneNoteSubmit = () => {
      if (!$scope.myForm.message) {
        swal("Error", "Please enter value first.", "error");
      } else {
        var data = {
          buyerId: $scope.buyerDetails._id,
          message: $scope.myForm.message,
          referenceNumber: $scope.buyerDetails.reference,
        };
        httpService.addPhoneNote(data, $scope.token).then(function (res) {
          if (res.data.status == 200) {
            $scope.initPhoneNote();
            $scope.myForm = {};
          }
        });
      }
    };
    $scope.changeProductionContractStatus = (contract) => {
      contract.status = Number(contract.status);
      contract.growerId = contract.growerId._id;
      httpService
        .addProductionContract(contract, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.initProductionContract();
            swal("Alert", res.data.userMessage, "success");
          }
        });
    };

    $scope.changeTradePurchaseStatus = (contract) => {
      var data = {
        _id: contract._id,
        status: Number(contract.status),
      };
      if (contract.status == 1) {
        swal(
          {
            title: "Are you sure?",
            text: "You want to adjust the purchase to the delivered qty?",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, Complete it!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              $scope.tradePurchaseContractStatusChange(data);
            } else {
              swal("Cancelled", "Your contract file is safe :)", "error");
              $scope.buyerDetailsInit();
            }
          }
        );
      } else {
        $scope.tradePurchaseContractStatusChange(data);
      }
    };

    $scope.getLoadSheetClass = function (result) {
      if (result.void) {
        return "clsRed";
      }
      return result.tareWeight != 0 && result.grossWeight != 0
        ? "clsBlue"
        : result.tareWeight == 0
        ? "clsRed"
        : "";
    };

    $scope.tradePurchaseContractStatusChange = (data) => {
      spinnerService.show("html5spinner");
      tradePurchaseHttpServices
        .changeTradePurchaseContractStatus(data, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            swal("Alert", res.data.userMessage, "success");
          } else {
            swal("Alert", res.data.userMessage, "error");
          }
          $scope.buyerDetailsInit();
          spinnerService.hide("html5spinner");
        });
    };

    $scope.ticketList = ({ contractNumber, delQty }) => {
      if (delQty > 0) {
        $state.go("ticketList", {
          seqNo: 2,
          contractNumber: contractNumber
        });
      }
    };

    $scope.loadSheetList = ({ contractNumber, delQty, cropYear, rollover }) => {
      if (delQty > 0) {
        $state.go("loadSheetList", { contractNumber, cropYear });
      }
    };

    $scope.openPop = function (data, type) {
      if (type == "view") {
        $(".employee").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
      } else if (type == "edit") {
        $(".employee").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        if ($scope.myForm.phone) {
          $scope.myForm.phone = Number($scope.myForm.phone);
        }
        if ($scope.myForm.cellNumber) {
          $scope.myForm.cellNumber = Number($scope.myForm.cellNumber);
        }
      } else {
        $(".employee").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };
    $scope.openBuyerPop = function (data, type) {
      if (type == "view") {
        $(".buyerEdit").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.line2 = data.addresses[0].line2;
        $scope.myForm.line3 = data.addresses[0].line3;
        $scope.myForm.city = data.addresses[0].city;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.country = data.addresses[0].country;
        $scope.myForm.edcId =
          $scope.myForm.edcId && $scope.myForm.edcId._id
            ? $scope.myForm.edcId._id
            : "";
      } else if (type == "edit") {
        $(".buyerEdit").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.myForm.phone = Number(data.phone);
        $scope.myForm.cellNumber = Number(data.cellNumber);
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.line2 = data.addresses[0].line2;
        $scope.myForm.line3 = data.addresses[0].line3;
        $scope.myForm.city = data.addresses[0].city;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.country = data.addresses[0].country;
        $scope.myForm.edcId =
          $scope.myForm.edcId && $scope.myForm.edcId._id
            ? $scope.myForm.edcId._id
            : "";
        $scope.documentsList.forEach((val) => {
          $scope.myForm.documents.forEach((val1) => {
            if (val._id == val1._id) {
              val.ticked = true;
              $scope.newForm.selectedDocuments.push(val1);
            }
          });
        });
      } else if (type == "buyerAddressList") {
        $(".buyerAddressList").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "addAddress") {
        $(".buyerAddressAdd").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "editAddress") {
        $(".buyerAddressEdit").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.myForm = _.clone(data);
        //console.log($scope.myForm);
      } else {
        $scope.myForm = {};
        $(".buyerEdit").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };

    $scope.closepop = function () {
      $(".add_coomm").fadeOut();
      $(".buyerAddressList").fadeOut();
      $(".buyerEdit").fadeOut();
      $(".popup_overlay").fadeOut();
      $(".rollover_popup").fadeOut();
    };

    $scope.closepopEdit = function () {
      $(".add_coomm").fadeOut();
      $(".buyerAddressEdit").fadeOut();
      $(".buyerEdit").fadeOut();
      $(".popup_overlay").fadeOut();
      $(".buyerAddressList").fadeOut();
    };

    $(".popup_overlay , .close").click(function () {
      $(".add_coomm").fadeOut();
      $(".buyerEdit").fadeOut();
      $(".popup_overlay").fadeOut();
      $(".rollover_popup").fadeOut();
    });
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });

    //Get all quotes
    $scope.assignUserFunction = (data) => {
      $scope.myForm = data;
      $scope.saveChanges();
    };

    $scope.saveChanges = function () {
      $scope.myForm.addresses = $scope.buyerDetails.addresses.map((address, idx) => {
        return idx === 0 ? {
          street: $scope.myForm.street,
          line2: $scope.myForm.line2,
          line3: $scope.myForm.line3,
          city: $scope.myForm.city,
          province: $scope.myForm.province,
          postal: $scope.myForm.postal,
          country: $scope.myForm.country,
        } : address;
      });
      $scope.myForm.fullAddress = $scope.myForm.street;
      $scope.myForm.documents = $scope.newForm.selectedDocuments.map(
        (val) => val._id
      );
      buyerHttpServices
        .updateBuyer($scope.myForm, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            if ($scope.buyerId) {
              $scope.buyerDetailsInit();
            }
            $scope.closepop();
          } else {
            swal("ERROR", res.data.userMessage, "error");
          }
        });
    };
    $scope.sendMailFunction = (data) => {
      if (data && data._id) {
        // if (!$scope.buyerDetails.email) {
        //     swal("Alert", "Email not attached with this buyer");
        //     return;
        // }
        $scope.sendMail = true;
        quoteHttpService.quoteDetail(data._id, $scope.token).then(
          (objS) => {
            spinnerService.hide("html5spinner");
            if (objS.data.status == 200) {
              $scope.quote = objS.data.data;
            }

            $scope.print("quotePdf", data._id);
          },
          (objE) => {
            spinnerService.hide("html5spinner");
            $scope.sendMail = false;
          }
        );
      } else {
        swal("Alert", "First create atleast one quote", "error");
      }
    };

    $scope.SubscribeEmail = [
      { text: "Yes", value: true },
      { text: "No", value: false },
    ];

    $scope.print = function (printSectionId, quoteId) {
      spinnerService.show("html5spinner");
      $timeout(function () {
        $scope.sendMail = false;
        var html = document.getElementById(printSectionId).innerHTML;
        var data = {
          html: html,
          subject:
            "Quote :" +
            $scope.buyerDetails.businessName +
            "-" +
            moment().format("MMM-DD-YYYY"),
          name: $scope.buyerDetails.businessName,
          email: [],
          orientation: "landscape",
          pdfType: "Quote",
          quoteId: quoteId,
        };

        if ($scope.buyerDetails && $scope.buyerDetails.email) {
          data.email.push($scope.buyerDetails.email);
        }

        if ($scope.employeesList.length > 0) {
          var empEmails = $scope.employeesList
            .filter(function (emp) {
              return emp.subscribeEmail === true;
            })
            .map(function (emp) {
              return emp.email;
            });

          data.email = data.email.concat(empEmails);
        }

        if (
          $scope.buyerDetails.assignedUserId &&
          $scope.buyerDetails.assignedUserId.email
        ) {
          data.email.push($scope.buyerDetails.assignedUserId.email);
        }

        if (data.email.length == 0) {
          data.email.push("info@rudyagro.ca");
        }

        httpService.sendContract(data, $scope.token).then(function (res) {
          if (res.data.status == 200) {
            spinnerService.hide("html5spinner");
          } else {
            swal("Error", res.data.userMessage, "error");
          }
        });
      }, 1000);
    };

    quoteHttpService
      .getquote($scope.token, $scope.buyerId, "buyer")
      .then(function (res) {
        $scope.quotes = res.data.status == 200 ? res.data.data.map(quote => {
          quote.pdfUrl = quote.pdfUrl || ('/quotePdf/' + quote._id);
          return quote;
        }) : [];
      });

    $scope.send_mail = function (data, type) {
      if (!data.pdfUrl || data.mailSent || data.status == 2) return;
      else if (!data.buyerId.email) {
        swal("Error", "Email not attched with this buyer");
      } else {
        $(".compose_mail").fadeIn();
        $(".popup_overlay").fadeIn();
        ckEditorService.showEditor();
        $scope.data = data;
        $scope.type = type;
        $scope.emailSending = false;
        $scope.to_email = [data.buyerId.email];
        $scope.cc_email = [data.createdBy.email];
        $scope.to_email = $scope.to_email
          .filter((val) => val)
          .map((val1) => val1);
        $scope.cc_email = $scope.cc_email
          .filter((val) => val)
          .map((val1) => val1);

        $scope.emailform = {
          body: `<p><strong>Hi ${$scope.data.buyerId.firstName},</strong></p>

                        <p>Please click the link below to review your ${
                          type == "sales contract"
                            ? "sales contract"
                            : "trade purchase contract"
                        }.  If you have any questions or concerns please give me a call anytime.</p>

                        <p><strong>${$scope.data.pdfUrl}</strong></p>

                        <p>&nbsp;</p>

                        <p>&nbsp;</p>

                        <p><strong>Regards</strong></p>

                        <p>Rudy Agro.</p>`,
          subject:
            type == "sales contract"
              ? "Sales Contract Pdf"
              : "Trade Purchase Contract Pdf",
        };
      }
    };
    // <p>To view your quote , please click on the below link :</p>
    $scope.sendMailToUser = () => {
      if ($scope.emailform.subject && CKEDITOR.instances.ckeditor.getData()) {
        var mailObj = {
          email: [...$scope.to_email, ...$scope.cc_email],
          subject: $scope.emailform.subject,
          _id: $scope.data._id,
          type: $scope.type,
          body: CKEDITOR.instances.ckeditor.getData(),
        };
        $scope.emailSending = true;
        httpService.sendPdfMail(mailObj, $scope.token).then(
          (objS) => {
            $scope.closepop();
            if (objS.data.status == 200) {
              if ($scope.type == "Trade purchase") {
                console.log("trade purchase");
                $scope.initTradePurchase();
              } else {
                console.log("otheres");
                $scope.initSalesContract();
              }
            }
            $scope.emailSending = false;
          },
          (objE) => {
            $scope.emailSending = false;
          }
        );
      }
    };
  });
