angular
  .module("myApp.purchaseConfirmation", [])
  .controller("purchaseConfirmationCtrl", function (
    $scope,
    $state,
    httpService,
    $timeout,
    $stateParams,
    brokerHttpService,
    spinnerService,
    sudAdminHttpService,
    currencyHttpService,
    imageUrl,
    apiUrl,
    $rootScope,
    commonService,
    $sce
  ) {
    $scope.$on("access", (event, data) => {
      if ($state.current.name == "purchase") {
        if (
          !data ||
          !data.purchase ||
          !data.purchase.purchaseConfirmation ||
          !data.purchase.purchaseConfirmation.viewMenu
        ) {
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
          $state.go("login");
          swal("ERROR", "Access denied", "error");
        }
      } else if ($state.current.name == "purchaseConfirmationPdf") {
        if (
          !data ||
          !data.purchase ||
          !data.purchase.purchaseConfirmation ||
          !data.purchase.purchaseConfirmation.viewMenu ||
          !data.purchase.purchaseConfirmation.view
        ) {
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
          $state.go("login");
          swal("ERROR", "Access denied", "error");
        }
      } else if ($state.current.name == "confirmation") {
        if (
          !data ||
          !data.purchase ||
          !data.purchase.purchaseConfirmation ||
          !data.purchase.purchaseConfirmation.viewMenu ||
          !data.purchase.purchaseConfirmation.edit
        ) {
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
          $state.go("login");
          swal("ERROR", "Access denied", "error");
        }
      } else if ($state.current.name == "purchaseConfirmation") {
        if (
          !data ||
          !data.purchase ||
          !data.purchase.purchaseConfirmation ||
          !data.purchase.purchaseConfirmation.viewMenu ||
          !data.purchase.purchaseConfirmation.add
        ) {
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
          $state.go("login");
          swal("ERROR", "Access denied", "error");
        }
      }
    });

    $scope.oldData = {};
    var state = $rootScope.previousState.$$state().name;
    if (state) {
      localStorage.setItem("prev_prchse_state", state);
    }

    $scope.active = {
      page: "purchase",
    };
    $scope.myForm = {};
    $scope.uploadForm = {};
    $scope.searchModel = { status: "0" };
    var page = "";
    var pageNo = localStorage.getItem("purchase_conf_page_No") || 1;
    $scope.type = $stateParams.type;
    $scope.searchModel.limit = "10";
    $scope.disableField = false;
    $scope.growerId = $stateParams.growerId;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.userProfile = JSON.parse(localStorage.getItem("userProfile"));
    $scope.imagePath = imageUrl;
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.purchaseConfirmation = JSON.parse(
      localStorage.getItem("PurchaseConfirmation")
    );
    $scope.canChangeStatus = function (contract) {
      return commonService.canChangeStatus(contract, $rootScope.loggedInUser);
    };
    $scope.cropYears = commonService.cropYears();
    $scope.search = function (pageN, pendingTask) {
      spinnerService.show("html5spinner");

      if ($scope.searchModel.limit) {
        $scope.searchModel.limit = Number($scope.searchModel.limit);
      }
      $scope.searchModel.page = pageN;

      localStorage.setItem(
        "purchase_conf_filter",
        JSON.stringify($scope.searchModel)
      );

      var searchParam = Object.assign({}, $scope.searchModel);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");
      searchParam.shipmentPeriodFrom = commonService.adjustDate(
        searchParam.shipmentPeriodFrom
      );
      searchParam.shipmentPeriodTo = commonService.adjustDate(
        searchParam.shipmentPeriodTo,
        "]"
      );
      searchParam.getSum = true;
      searchParam.address = true;

      httpService
        .searchPurchaseInfo(searchParam, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.purchaseConfirmationList = res.data.data.docs;
            $scope.scales = res.data.scales;
            $scope.qtySum = res.data.data.qtySum;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            $scope.totallimit = res.data.data.limit;
            $scope.searchModel.limit = res.data.data.limit.toString();
            for (var i = 0; i < $scope.purchaseConfirmationList.length; i++) {
              $scope.purchaseConfirmationList[
                i
              ].delQty += $scope.getShippedQuantityLbs(
                $scope.purchaseConfirmationList[i]
              );
              $scope.purchaseConfirmationList[
                i
              ].status = $scope.purchaseConfirmationList[i].status.toString();
            }
            spinnerService.hide("html5spinner");
            if (pendingTask) {
              pendingTask($scope.purchaseConfirmationList);
            }
          }
        });
    };
    $scope.getCurrencyInfo = function () {
      currencyHttpService.getcurrency($scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.currencyList = res.data.data;
          $scope.myForm.exchangeRate = $scope.currencyList[0].currencyCADUSD;
          $scope.myForm.exchangeDeduction =
            $scope.currencyList[0].exchangeDeduction;
        }
      });
    };

    sudAdminHttpService.getadmin(pageNo, $scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.updatedAdminList = [];
        spinnerService.hide("html5spinner");
        for (var i = 0; i < res.data.data.length; i++) {
          if (
            res.data.data[i].type == "ADMIN" ||
            res.data.data[i].roles == "Sales"
          ) {
            $scope.updatedAdminList.push(res.data.data[i]);
          } else {
            $scope.adminList = res.data.data;
          }
        }
      } else {
        spinnerService.hide("html5spinner");
      }
    });

    $scope.DoCtrlPagingAct = function (text, page) {
      page = page || pageNo;

      if (text == "Clear") {
        localStorage.setItem("purchase_conf_page_No", 1);
        localStorage.removeItem("purchase_conf_filter");
        $scope.searchModel = { status: "0" };
        $scope.searchModel.limit = "10";
        $scope.search(page);
      } else {
        localStorage.setItem("purchase_conf_page_No", page);
        var prev_filter = localStorage.getItem("purchase_conf_filter");
        if (prev_filter) {
          $scope.searchModel = JSON.parse(prev_filter);
        }
        $scope.search(page);
      }
    };

    $scope.getQuantityLbs = (contract) => {
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

    $scope.getShippedQuantityLbs = (contract) => {
      var totalShippedQuantityLbs = 0;
      if (!$scope.scales || !$scope.scales.length)
        return totalShippedQuantityLbs;

      $scope.scales.forEach(function (scale) {
        scale.splits.total = scale.netWeight * 2.2046;
        scale.splits.contractNumber = scale.contractNumber;
        scale.splits.forEach(function (split, i, splits) {
          if (contract.contractNumber != split.contractNumber) return;

          if (splits.contractNumber == contract.contractNumber) {
            totalShippedQuantityLbs -= splits.total;
          }

          totalShippedQuantityLbs += split.netWeight * 2.2046;
        });
      });
      return totalShippedQuantityLbs;
    };

    $scope.changePurchaseConfirmationStatus = (contract) => {
      contract.status = Number(contract.status);
      contract.growerId = contract.growerId._id;
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
              $scope.purchaseConfirmationStatusChange(contract);
            } else {
              swal("Cancelled", "Your contract file is safe :)", "error");
              $scope.search();
            }
          }
        );
      } else {
        $scope.purchaseConfirmationStatusChange(contract);
      }
    };

    $scope.purchaseConfirmationStatusChange = (contract) => {
      spinnerService.show("html5spinner");
      httpService
        .addPurchaseConfirmation(contract, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            swal("Alert", res.data.userMessage, "success");
          } else {
            swal("Alert", res.data.userMessage, "error");
          }
          $scope.search();
          spinnerService.hide("html5spinner");
        });
    };

    brokerHttpService.getBroker(page, $scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.brokerList = res.data.data;
      }
    });

    if ($scope.growerId) {
      httpService
        .getGrowerDetails($scope.growerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.growerDetails = res.data.data;
          } else {
            swal("Error", res.data.userMessage, "error");
          }
        });
    }

    httpService.getCommodity($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.commoditys = res.data.data;
      }
    });

    $scope.getGrade = function (id) {
      if ($scope.myForm.commodityId && $scope.myForm.cropYear) {
        $scope.generateContractNo();
      }

      httpService.getGrade("", id, $scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.grades = res.data.data;
          $scope.contractGrade = [];
          $scope.inventoryGrade = [];
          $scope.grades.forEach((grade) => {
            if (['Both', 'All'].includes(grade.gradeDisplay)) {
              $scope.contractGrade.push(grade);
              $scope.inventoryGrade.push(grade);
            } else if (grade.gradeDisplay == "Contract Grade") {
              $scope.contractGrade.push(grade);
            } else if (grade.gradeDisplay == "Inventory Grade") {
              $scope.inventoryGrade.push(grade);
            }
          });
        }
      });
      if ($scope.growerId && $scope.myForm.commodityId) {
        var data = {
          growerId: $scope.growerId,
          commodityId: $scope.myForm.commodityId,
        };
        httpService
          .getSampleUsingCommodity(data, $scope.token)
          .then(function (res) {
            if (res.data.status == 200) {
              $scope.sampleList = res.data.data;
            }
          });
      }
      $timeout(function () {
        $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
          return hero._id == id;
        });
        $scope.myForm.commodityName = $scope.commodityGrades[0].commodityName;
      }, 300);
    };
    $scope.getGradeName = (gradeId) => {
      if (gradeId) {
        $timeout(function () {
          $scope.gradesName = $scope.grades.filter(function (hero) {
            return hero._id == gradeId;
          });
          if ($scope.gradesName) {
            $scope.myForm.gradeName = $scope.gradesName[0].gradeName;
          }
        }, 1500);
      }
    };
    $scope.getCwtDelPrice = () => {
      $scope.getBushelweight = $scope.commoditys.filter(function (hero) {
        return hero._id == $scope.myForm.commodityId;
      });

      let freightRatePerMT = ($scope.myForm.freightRatePerMT || 0) != 0
          ? $scope.myForm.freightRatePerMT
          : ($scope.myForm.freightEstimate || 0);

      freightRatePerMT = (freightRatePerMT - 0) / 22.0462;

      if ($scope.myForm.quantityUnit == "Lbs") {
        $scope.CWTDel = ($scope.myForm.price || 0) * 100 + freightRatePerMT;
        $scope.myForm.quantityLbs = $scope.myForm.contractQuantity || 0;
      } else if ($scope.myForm.quantityUnit == "CWT") {
        $scope.CWTDel = Number($scope.myForm.price) + freightRatePerMT;
        $scope.myForm.quantityLbs = ($scope.myForm.contractQuantity || 0) * 100;
      } else if ($scope.myForm.quantityUnit == "MT") {
        $scope.CWTDel = ($scope.myForm.price || 0) / 22.0462 + freightRatePerMT;
        $scope.myForm.quantityLbs =
          ($scope.myForm.contractQuantity || 0) * 2204.62;
      } else if ($scope.myForm.quantityUnit == "BU") {
        $scope.CWTDel =
          ($scope.myForm.price || 0) *
            (100 / Number($scope.getBushelweight[0].commodityWeight)) +
          freightRatePerMT;
        $scope.myForm.quantityLbs =
          ($scope.myForm.contractQuantity || 0) *
          Number($scope.getBushelweight[0].commodityWeight);
      }

      if ($scope.myForm.priceCurrency === 'USD') {
        $scope.CWTDel = $scope.CWTDel * $scope.myForm.exchangeRate;
      }

      if ($scope.CWTDel) {
        $scope.CWTDel = Number($scope.CWTDel);
        $scope.CWTDel = $scope.CWTDel.toFixed(2);
      }

      $scope.myForm.CWTDel = $scope.CWTDel;
    };

    if ($scope.purchaseConfirmation) {
      $scope.purchaseConfirmation.shipmentPeriodFrom = moment(
        $scope.purchaseConfirmation.shipmentPeriodFrom
      ).format("MMM DD,YYYY");
      $scope.purchaseConfirmation.backDate = moment(
        $scope.purchaseConfirmation.backDate
      ).format("MMM DD,YYYY");
      $scope.purchaseConfirmation.shipmentPeriodTo = moment(
        $scope.purchaseConfirmation.shipmentPeriodTo
      ).format("MMM DD,YYYY");
      $timeout(function () {
        $scope.getGrade($scope.purchaseConfirmation.commodityId);
        $scope.purchaseConfirmation.commodityDetails = $scope.commoditys.filter(
          function (hero) {
            return hero._id == $scope.purchaseConfirmation.commodityId;
          }
        );
        $scope.purchaseConfirmation.commodityName =
          $scope.purchaseConfirmation.commodityDetails[0].commodityName;
      }, 1000);
      $scope.myForm = $scope.purchaseConfirmation;
    }

    $scope.formatContractData = function () {
      $scope.selectedContract.status = $scope.selectedContract.status.toString();
      if ($scope.selectedContract.chemicalDeclarationFileUrl == "0") {
        $scope.selectedContract.chemicalDeclarationFileUrl = "";
      }
    };
    $scope.groweDetails = (growerId) => {
      if ($rootScope.loginUserAccess.purchase.growers.view) {
        $state.go("growerDetails", {
          id: growerId,
        });
      }
    };

    $scope.calculateCWT = () => {
      $scope.myForm.CWTDel = $scope.myForm.freightRatePerMT / 22.0462;
    };
    $scope.generateContractNo = () => {
      if ($stateParams.type != "edit" && $stateParams.type != "view") {
        httpService
          .getPurchaseConfirmationCount(
            $scope.myForm.cropYear,
            $scope.myForm.commodityId,
            $scope.token
          )
          .then(function (res) {
            if (res.data.status == 200) {
              $scope.count = res.data.data;

              if ($scope.myForm.commodityId) {
                $scope.commodityGrades = $scope.commoditys.filter(function (
                  hero
                ) {
                  return hero._id == $scope.myForm.commodityId;
                });
                $scope.myForm.commodityName =
                  $scope.commodityGrades[0].commodityName;
              }
              if ($scope.count) {
                var contractNumber = $scope.count.contractNumber.replace('-R', '');
                var last_count = contractNumber.slice(-4);
                var next_sequence = Number(last_count) + 1;
                $scope.myForm.contractNumber =
                  "PC" +
                  $scope.myForm.cropYear +
                  $scope.commodityGrades[0].commodityCode +
                  next_sequence;
              } else {
                $scope.myForm.contractNumber =
                  "PC" +
                  $scope.myForm.cropYear +
                  $scope.commodityGrades[0].commodityCode +
                  "2000";
              }
            }
          });
      }
    };

    var all_keys = [
      "contractNumber",
      "nameOfContract",
      "signee",
      "commodityId",
      "gradeId",
      "growerId",
      "brokerId",
      "personFarmType",
      "quantityLbs",
      "farmName",
      "cropYear",
      "shipmentPeriodFrom",
      "shipmentPeriodTo",
      "deliveryPoint",
      "contractQuantity",
      "quantityUnit",
      "splitsPrice",
      "price",
      "priceUnit",
      "priceCurrency",
      "otherConditions",
      "paymentTerms",
      "specifications",
      "sampleNumber",
      "settlementInstructions",
      "settlementComments",
      "freightRatePerMT",
      "CWTDel",
      "delQty",
      "freightEstimate",
      "freightActual",
      "inventoryGrade",
      "history",
      "backDate",
      "lastOpenedBy",
      "lastOpenedOn",
      "lastEditedBy",
      "lastEditedOn",
      "createdBy",
      "status",
      "createdAt",
      "pdfUrl",
      "signedContractPdf",
      "contractIsSigned",
    ];

    $scope.submit = (valid) => {
      $scope.submitted = true;
      if (valid) {
        if ($scope.myForm.specificationsOther) {
          $scope.myForm.specifications = $scope.myForm.specificationsOther;
        }
        if ($scope.myForm.settlementComments) {
          $scope.myForm.settlementInstructions =
            $scope.myForm.settlementComments;
        }
        if ($scope.myForm.paymentTermsOther) {
          $scope.myForm.paymentTerms = $scope.myForm.paymentTermsOther;
        }
        $scope.getBushelweight = $scope.commoditys.filter(function (hero) {
          return hero._id == $scope.myForm.commodityId;
        });

        $scope.getCwtDelPrice();

        var rolloverKeys =
          typeof $scope.myForm.rollover == "object"
            ? _.keys($scope.myForm.rollover)
            : [];
        if (rolloverKeys.length) {
          if (rolloverKeys.length > 1) {
            var lastKey = rolloverKeys.sort().pop();
            var sumofPrevQuantities = 0;
            var quantityLbs;
            for (var year of rolloverKeys) {
              quantityLbs = $scope.myForm.rollover[year].quantityLbs - 0;
              sumofPrevQuantities += isNaN(quantityLbs) ? 0 : quantityLbs;
            }
            var qtyToUpdate = $scope.myForm.quantityLbs - sumofPrevQuantities;
            if (qtyToUpdate >= 0) {
              $scope.myForm.rollover[lastKey].quantityLbs = qtyToUpdate;
            } else {
              swal(
                "Here's a message!",
                "Quantity you entered is less than sum of previous year rollover quantities.",
                "error"
              );
              return;
            }
          } else {
            $scope.myForm.rollover[rolloverKeys[0]].quantityLbs =
              $scope.myForm.quantityLbs;
          }
        }

        $scope.myForm.priceCAD = $scope.myForm.price;
        if (
          $scope.myForm.exchangeRate &&
          $scope.myForm.priceCurrency == "USD"
        ) {
          $scope.myForm.priceCAD =
            $scope.myForm.exchangeRate * $scope.myForm.price;
        }

        $scope.myForm.growerId = $scope.growerId;
        $scope.myForm.priceUnit = $scope.myForm.quantityUnit;
        $scope.myForm.shipmentPeriodFrom = moment(
          $scope.myForm.shipmentPeriodFrom
        );
        $scope.myForm.shipmentPeriodTo = moment($scope.myForm.shipmentPeriodTo);
        $scope.myForm.backDate = moment($scope.myForm.backDate);

        spinnerService.show("html5spinner");

        var changed_key = [];
        for (var i = 0; i < all_keys.length; i++) {
          if ($scope.oldData[all_keys[i]] != $scope.myForm[all_keys[i]]) {
            changed_key.push(all_keys[i]);
          }
        }

        $scope.myForm.someFieldValueChangedPurchaseConfirmation = changed_key.length
          ? true
          : false;

        httpService.addPurchaseConfirmation($scope.myForm, $scope.token).then(
          function (res) {
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
              localStorage.setItem(
                "PurchaseConfirmation",
                JSON.stringify(res.data.data)
              );
              var state = localStorage.getItem("prev_prchse_state");
              if (state) {
                if (state == "purchase") {
                  $state.go("purchase");
                } else {
                  $state.go("growerDetails", {
                    id: $stateParams.growerId,
                  });
                }
              } else {
                $state.go("purchase");
              }
            }
          },
          function (error) {
            spinnerService.hide("html5spinner");
          }
        );
      }
    };
    $scope.btnShow = $stateParams.type;
    if ($stateParams.type == "view") {
      httpService
        .getPurchaseConfirmationByContractNo(
          $stateParams.contractNo,
          $scope.token
        )
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.confirmationDetailsByNo = res.data.data;
            $scope.myForm = $scope.confirmationDetailsByNo;
            $scope.myForm.shipmentPeriodFrom = moment(
              $scope.confirmationDetailsByNo.shipmentPeriodFrom
            ).format("MMM DD,YYYY");
            $scope.myForm.shipmentPeriodTo = moment(
              $scope.confirmationDetailsByNo.shipmentPeriodTo
            ).format("MMM DD,YYYY");
            $scope.myForm.commodityName =
              $scope.confirmationDetailsByNo.commodityId.commodityName;
            $scope.myForm.gradeName =
              $scope.confirmationDetailsByNo.gradeId.gradeName;
            $scope.myForm.commodityId =
              $scope.confirmationDetailsByNo.commodityId._id;
            if (res.data.data.signee) {
              $scope.myForm.signature = res.data.data.signee.signature;
            }
            if ($scope.confirmationDetailsByNo.personFarmType == "Person") {
              $scope.myForm.growerFullName =
                $scope.confirmationDetailsByNo.growerId.firstName +
                " " +
                $scope.confirmationDetailsByNo.growerId.lastName;
            } else {
              $scope.myForm.growerFullName =
                $scope.confirmationDetailsByNo.growerId.farmName;
            }
            if (!$scope.myForm.farmName) {
              $scope.myForm.farmName = $scope.myForm.growerId ? $scope.myForm.growerId.farmName : null;
            }
            $timeout(function () {
              $scope.getGrade($scope.confirmationDetailsByNo.commodityId);
            }, 500);
            $scope.myForm.gradeId = $scope.confirmationDetailsByNo.gradeId._id;
            $scope.myForm.contractNumber =
              $scope.confirmationDetailsByNo.contractNumber;
            $scope.oldData = angular.copy($scope.confirmationDetailsByNo);
          }
        });
    } else if ($stateParams.type == "edit") {
      if ($stateParams.type == "edit") {
        $scope.disableField = true;
      }
      $scope.btnType = "Save Changes";
      httpService
        .getPurchaseConfirmationByContractNo(
          $stateParams.contractNo,
          $scope.token
        )
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.confirmationDetailsByNo = res.data.data;
            $scope.myForm = $scope.confirmationDetailsByNo;
            $scope.myForm.shipmentPeriodFrom = moment(
              $scope.confirmationDetailsByNo.shipmentPeriodFrom
            ).format("MMM DD,YYYY");
            $scope.myForm.shipmentPeriodTo = moment(
              $scope.confirmationDetailsByNo.shipmentPeriodTo
            ).format("MMM DD,YYYY");
            $scope.myForm.backDate = moment(
              $scope.confirmationDetailsByNo.backDate
            ).format("MMM DD,YYYY");
            $scope.myForm.commodityName =
              $scope.confirmationDetailsByNo.commodityId.commodityName;
            $scope.myForm.gradeName =
              $scope.confirmationDetailsByNo.gradeId.gradeName;
            $scope.myForm.commodityId =
              $scope.confirmationDetailsByNo.commodityId._id;
            if (res.data.data.signee) {
              $scope.myForm.signature = res.data.data.signee.signature;
            }
            if ($scope.confirmationDetailsByNo.personFarmType == "Person") {
              $scope.myForm.growerFullName =
                $scope.confirmationDetailsByNo.growerId.firstName +
                " " +
                $scope.confirmationDetailsByNo.growerId.lastName;
            } else {
              $scope.myForm.growerFullName =
                $scope.confirmationDetailsByNo.growerId.farmName;
            }
            if (!$scope.myForm.farmName) {
              $scope.myForm.farmName = $scope.myForm.growerId ? $scope.myForm.growerId.farmName : null;
            }
            $timeout(function () {
              $scope.getGrade($scope.confirmationDetailsByNo.commodityId);
            }, 500);
            $scope.myForm.gradeId = $scope.confirmationDetailsByNo.gradeId._id;
            $scope.myForm.contractNumber =
              $scope.confirmationDetailsByNo.contractNumber;
            $scope.myForm.cropyear =
              $scope.myForm.cropyear || $scope.myForm.cropYear;

            $scope.oldData = angular.copy($scope.confirmationDetailsByNo);
          }
        });
    } else if ($stateParams.contractNo) {
      $scope.btnType = "Submit";
      httpService
        .getPurchaseConfirmationByContractNo(
          $stateParams.contractNo,
          $scope.token
        )
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.confirmationDetailsByNo = res.data.data;
            $scope.myForm = $scope.confirmationDetailsByNo;
            $scope.myForm.shipmentPeriodFrom = moment(
              $scope.confirmationDetailsByNo.shipmentPeriodFrom
            ).format("MMM DD,YYYY");
            $scope.myForm.shipmentPeriodTo = moment(
              $scope.confirmationDetailsByNo.shipmentPeriodTo
            ).format("MMM DD,YYYY");
            $scope.myForm.commodityName =
              $scope.confirmationDetailsByNo.commodityId.commodityName;
            $scope.myForm.gradeName =
              $scope.confirmationDetailsByNo.gradeId.gradeName;
            $scope.myForm.commodityId =
              $scope.confirmationDetailsByNo.commodityId._id;
            if (res.data.data.signee) {
              $scope.myForm.signature = res.data.data.signee.signature;
            }
            if ($scope.confirmationDetailsByNo.personFarmType == "Person") {
              $scope.myForm.growerFullName =
                $scope.confirmationDetailsByNo.growerId.firstName +
                " " +
                $scope.confirmationDetailsByNo.growerId.lastName;
            } else {
              $scope.myForm.growerFullName =
                $scope.confirmationDetailsByNo.growerId.farmName;
            }
            $timeout(function () {
              $scope.getGrade($scope.confirmationDetailsByNo.commodityId);
            }, 500);
            $scope.myForm.gradeId = $scope.confirmationDetailsByNo.gradeId._id;
            $scope.myForm.contractNumber =
              $scope.confirmationDetailsByNo.contractNumber;

            $scope.oldData = angular.copy($scope.confirmationDetailsByNo);
          }
        });
    } else {
      $scope.btnType = "Submit";
      $scope.getCurrencyInfo();
    }
    $scope.getSigneeSignatures = (signeeId) => {
      $timeout(function () {
        $scope.signeeSignatures = $scope.updatedAdminList.filter(function (
          hero
        ) {
          return hero._id == signeeId;
        });
        if ($scope.signeeSignatures) {
          $scope.myForm.signature = $scope.signeeSignatures[0].signature;
        }
      }, 1500);
    };
    $scope.viewPdf = () => {
      window.open($scope.confirmationDetailsByNo.pdfUrl, "_blank");
    };
    $scope.print = function (printSectionId) {
      function print_data(removeChemicalReaction) {
        $timeout(function () {
          if (removeChemicalReaction) {
            $("#chemicalRecationId").remove();
          }
          var innerContents = document.getElementById("printSectionId")
            .innerHTML;
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
          $state.reload();
        }, 1000);
      }

      swal(
        {
          title: "Do you want to print with chemical declaration?",
          text: "",
          type: "info",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          closeOnConfirm: false,
          closeOnCancel: false,
        },
        function (isConfirm) {
          if (isConfirm) {
            swal({
              title: "Selected!",
              text: "Chemical declaration added in print section.",
              type: "success",
              timer: 2000,
            });
            print_data(false);
          } else {
            swal({
              title: "Ignored!",
              text: "Chemical declaration removed from print section.",
              type: "success",
              timer: 2000,
            });
            print_data(true);
          }
        }
      );
    };

    $scope.exportSheet = function () {
      var old_limit = $scope.searchModel.limit;
      $scope.page = 1;
      $scope.searchModel.limit = 2000;
      $scope.search($scope.page, function (data) {
        var newData = data.map(function (purchase) {
          if (purchase.personFarmType) {
            if (purchase.personFarmType == "Person") {
              if (purchase.growerId) {
                purchase.growerFullName =
                  purchase.growerId.firstName +
                  " " +
                  purchase.growerId.lastName;
              }
            } else {
              if (purchase.growerId) {
                purchase.growerFullName = purchase.growerId.farmName;
              }
            }
          }
          if (purchase.gradeId) {
            $scope.gradeName = purchase.gradeId.gradeName;
          }

          var address =
            purchase.growerId.addresses &&
            purchase.growerId.addresses.length > 0
              ? purchase.growerId.addresses[0]
              : {
                  street: "",
                  street2: "",
                  town: "",
                  province: "",
                  postal: "",
                  country: "",
                };

          return {
            Date: moment(purchase.createdAt).format("MM/DD/YYYY"),
            Name: purchase.growerFullName,
            Signed: purchase.contractIsSigned ? "Yes" : "No",
            Commodity: purchase.commodityId.commodityName || "",
            Grade: $scope.gradeName,
            "Crop Year": purchase.cropYear,
            "Contract Quantity": purchase.contractQuantity,
            CWTDel: purchase.CWTDel,
            "Contrat Number": purchase.contractNumber,
            "Quantity Unit": purchase.quantityUnit,
            "Quantity Lbs": $scope.getQuantityLbs(purchase),
            "Del Qty": purchase.delQty || "",
            Price: purchase.price,
            "Price Currency": purchase.priceCurrency,
            "Price Unit": purchase.priceUnit,
            "Person Farm Type": purchase.personFarmType,
            "Shipment Period From": moment(purchase.shipmentPeriodFrom).format(
              "MM/DD/YYYY"
            ),
            "Shipment Period To": moment(purchase.shipmentPeriodTo).format(
              "MM/DD/YYYY"
            ),
            Specifications: purchase.specifications,
            "Payment Terms": purchase.paymentTerms,
            "Other Conditions": purchase.otherConditions,
            "Settlement Instructions": purchase.settlementInstructions,
            "Settlement Comments": purchase.settlementComments,
            Street: address.street,
            Street2: address.street2,
            Town: address.town,
            Province: address.province,
            Postal: address.postal,
            Country: address.country,
          };
        });
        var obj = {
          data: newData,
          fileName: "Purchase Confirmation" + " report.xlsx",
        };
        var request = new XMLHttpRequest();
        request.open("POST", apiUrl + "export", true);
        request.responseType = "blob";
        request.setRequestHeader("Content-type", "application/json");
        request.onload = function (e) {
          if (this.status === 200) {
            // $col.removeLoader();
            var file = window.URL.createObjectURL(this.response);
            var a = document.createElement("a");
            a.href = file;
            a.download = obj.fileName;
            document.body.appendChild(a);
            a.click();
            // window.onfocus = function() {
            //     document.body.removeChild(a)
            // }
          }
        };
        request.send(JSON.stringify(obj));
        $scope.searchModel.limit = old_limit;
      });
    };

    $scope.saveAll = function () {
      var fields = ["chemicalDeclarationFileUrl", "signedContractPdf"];

      fields.forEach((field) => {
        $scope.uploadPdf(field);
      });
    };

    $scope.getDocumentList = function (contract) {
      var links = [];

      if (contract.chemicalDeclarationFileUrl) {
        links.push(`<a href="${contract.chemicalDeclarationFileUrl}"
                target="_blank"
                style="cursor: pointer;">
                CD
              </a>`);
      }

      if (contract.signedContractPdf) {
        links.push(`<a href="${contract.signedContractPdf}"
                target="_blank"
                style="cursor: pointer;">
                SC
              </a>`);
      }

      return $sce.trustAsHtml(links.join(" - "));
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
        };
        httpService
          .uploadPdf(data, $scope.selectedContract._id, $scope.token)
          .then(
            function (res) {
              spinnerService.hide("html5spinner");
              if (res.data.status == 200) {
                Object.assign($scope.selectedContract, res.data.data);
                $scope.formatContractData();
                $scope.closepop();
                swal("Success", "Pdf uploaded successfully.", "success");
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

    $scope.reloadWeight = function (contractNumber) {
      httpService
        .reloadPurchaseWeight(contractNumber, $scope.token)
        .then(function (res) {
          if (res.data.status === 200) {
            $scope.search(localStorage.getItem("purchase_conf_page_No"));
          }
        });
    };

    $scope.deleteSignedContract = (data) => {
      swal(
        {
          title: "Are you sure?",
          text: "Your will not be able to recover this signed contract!",
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
            spinnerService.show("html5spinner");
            httpService.removeSignedContract(data._id, $scope.token).then(
              function (res) {
                spinnerService.hide("html5spinner");
                if (res.data.status == 200) {
                  data.contractIsSigned = false;
                  swal("Deleted!", "Signed contract deleted.", "success");
                }
              },
              function (error) {
                spinnerService.hide("html5spinner");
              }
            );
          } else {
            swal("Cancelled", "Your signed contract is safe :)", "error");
          }
        }
      );
    };

    $scope.openPop = function (type, data) {
      if (type == "uploadPDF") {
        $scope.uploadForm.chemicalDeclarationFileUrl = null;
        $scope.uploadForm.signedContractPdf = null;
        $scope.errMsg = "";
        $scope.file = "";
        $scope.selectedContract = data;
        $('[name="addPdfAndQtyForm_342849"]')[0].reset();
        $(".add_pdf_qty").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };

    $scope.closepop = function () {
      $(".add_pdf_qty").fadeOut();
      $(".popup_overlay").fadeOut();
    };
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });

    $scope.ticketList = (contractNumber, delQty) => {
      if (delQty > 0) {
        $state.go("ticketList", {
          seqNo: 1,
          contractNumber: contractNumber,
        });
      }
    };
  });
