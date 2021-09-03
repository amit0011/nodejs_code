angular
  .module("myApp.growerDetails", [])
  .controller("growerDetailsCtrl", function (
    $scope,
    $state,
    ckEditorService,
    jsonService,
    httpService,
    scaleTicketHttpServices,
    $stateParams,
    spinnerService,
    $rootScope,
    countryHttpService,
    $log,
    commonService,
    $sce
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.purchase ||
        !data.purchase.growers ||
        !data.purchase.growers.viewMenu ||
        !data.purchase.growers.view
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "growers",
    };
    $scope.qtyLimit = 1;
    $scope.myForm = {};
    $scope.rolloverForm = {};
    $scope.dateForm = {};
    $scope.uploadFormPurchase = {};
    $scope.uploadForm = {};
    $scope.min_date = moment().format("YYYY-MM-DD");
    $scope.arr = [];
    $scope.varietyPlus = true;
    $scope.varietyInput = false;
    var pageNo = 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.plusVariety = function () {
      $scope.varietyPlus = false;
      $scope.varietyInput = true;
    };
    $scope.uploadForm = {};
    localStorage.removeItem("ProductionContract");
    localStorage.removeItem("PurchaseConfirmation");
    localStorage.removeItem("landLoaction");
    $scope.growerId = $stateParams.id;
    $scope.showBtnRollover = false;
    $scope.cropYears = commonService.cropYears();

    $scope.resetFarm = () => {
      $scope.myForm = {
        farmNames: [],
      };
    };
    $scope.canChangeStatus = function (contract) {
      return commonService.canChangeStatus(contract, $rootScope.loggedInUser);
    };

    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.removeFarm = function(index) {
      $scope.myForm.farmNames.splice(index, 1);
    };

    $scope.manageFarms = (evnt) => {
      if ($scope.myForm.farmName) {
        (
          $scope.myForm.farmName !== $scope.myForm.farmNames[0] &&
          !$scope.myForm.farmNames.includes($scope.myForm.farmName)
        ) && $scope.myForm.farmNames.unshift($scope.myForm.farmName);

        if (evnt === 'enter') return ($scope.myForm.farmName = '');
      }

      if (evnt === 'blur') {
        if ($scope.myForm.farmNames[0]) {
          $scope.myForm.farmName = $scope.myForm.farmNames[0];
        }
      }
    };
    //only growerDetails
    $scope.initGrower = () => {
      httpService
        .getGrowerDetails($scope.growerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.growerDetails = res.data.data;
            
            $scope.cachedNote = $scope.growerDetails.note;
            if (res.data.data.callBackDate) {
              $scope.growerDetails.callBackDate = moment(
                res.data.data.callBackDate
              ).format("YYYY-MM-DD");
            } else {
              $scope.growerDetails.callBackDate = "";
            }

            $scope.initPhoneNote();
            if ($scope.growerDetails.deleteStatus == 0) {
              $scope.styleObje = {
                border: "2px solid #007e4e",
                "background-color": "#ffff",
                color: "#000000",
              };
            } else {
              $scope.styleObje = {
                border: "2px solid #f44336",
                "background-color": "#ffff",
                color: "#000000",
              };
            }
          }
        });
    };
    $scope.initGrower();
    $scope.townList = [];

    $scope.initLoadSheet = function () {
      httpService.loadSheets($scope.token, $scope.growerId).then(function (res) {
          $scope.loadSheets = res.data.status === 200 ? res.data.data : [];
      });
    };

    $scope.initLoadSheet();

    jsonService.getTownList($scope.token).then(function (res) {
      $scope.townList =
        res.data.status == 200
          ? res.data.data.docs.map(function (town) {
              return town.name;
            })
          : [];
    });

    countryHttpService.getCountryList($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.countryList = res.data.data;
      }
      spinnerService.hide("html5spinner");
    });

    httpService.getCommodity($scope.token).then(function (res) {
      $scope.commoditys = res.data.status == 200 ? res.data.data : [];
    });

    $scope.$watch("showBtnRollover", function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $log.log("Changed!");
      }
    });

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
    //seedScaleTicket given arry
    httpService
      .getOutgoingSeedScale($scope.growerId, $scope.token)
      .then(function (res) {
        // console.log(res);
        $scope.seedScaleTicketList =
          res.data.status == 200 ? res.data.data : [];
          // console.log($scope.seedScaleTicketList);
      });

    $scope.updateMovies = function (typed) {
      var objs = {
        farmName: typed,
      };
      spinnerService.show("html5spinner");
      httpService
        .getGrowerSearch(pageNo, objs, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.growerList = res.data.data.docs;
          }
          spinnerService.hide("html5spinner");
        });
    };
    $scope.getGrade = function (id, samples) {
      httpService.getGrade("", id, $scope.token).then(function (res) {
        $scope.grades = res.data.status == 200 ? res.data.data : [];
      });

      $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
        return hero._id == id;
      });

      if (samples) {
        $scope.commodityGrades[0].commoditySampleAnalysis.filter(function (
          sample
        ) {
          var matchedSample = samples.find(samp => samp.analysisId == sample._id);
          sample.analysisDetails = matchedSample ? matchedSample.analysisDetails : null;
        });
      }
      $scope.commoditySampleAnalysis =
        $scope.commodityGrades[0].commoditySampleAnalysis;
    };

    $scope.initVariety = function () {
      httpService.getVariety($scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.varietyList = res.data.data;
        }
      });
    };
    $scope.initVariety();
    $scope.initSample = function () {
      httpService.getSample({growerId: $scope.growerId, token: $scope.token, includeDumped: 1, sort: 'cropYear', sortOrder: -1}).then(function (res) {
        $scope.sampleList = res.data.status == 200 ? res.data.data : [];
      });
    };

    $scope.sampleClass = function (sample) {
      return ['Yes', '1'].includes(sample.dumped) ? "completed-contract" : "active-contract";
    };

    $scope.getDocumentList = function (contract) {
      var links = [];
      if (contract.harvestFileUrl || contract.harvestQty) {
        links.push(`<a href="${contract.harvestFileUrl}"
            target="_blank"
            style="cursor: pointer;">
            HS(${contract.harvestQty}${contract.harvestQtyUnit || ''})
          </a>`);
      }

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

      if (contract.cropInspectionPdf) {
        links.push(`<a href="${contract.cropInspectionPdf}"
            target="_blank"
            style="cursor: pointer;">
            CI
          </a>`);
      }

      return $sce.trustAsHtml(links.join(" - "));
    };

    /**
     * functions regarding contract delQty started from here
     */
    $scope.filterScalesHavingSplits = function (scale) {
      return scale.isSplitTicket && scale.splits.length;
    };

    //deliveries calculate
    $scope.calculateDelQtyForContracts = function (split, idx, splits) {
      var mathes = split.contractNumber.match(/[A-Za-z]+/gm);
      var contractList = [];
      switch (mathes[0]) {
        case "PC":
          contractList = $scope.purchaseConfirmationList;
          break;

        case "P":
          contractList = $scope.productionContractList;
          break;
      }

      if (contractList.length == 0) return;

      var index = contractList.findIndex(function (contract) {
        return contract.contractNumber == split.contractNumber;
      });

      // if currently found contract is original contact for scale ticket then
      // we need to remove the whole quantity first then add splited quantity
      if (splits.contractNumber == split.contractNumber) {
        contractList[index].delQty = contractList[index].delQty - splits.total; //
      }
      contractList[index].delQty =
        contractList[index].delQty + split.netWeight * 2.2046;
    };

    $scope.calculateSplitedQuantity = function (scale) {
      scale.splits.total = scale.netWeight * 2.2046;
      scale.splits.contractNumber = scale.contractNumber;

      scale.splits.forEach($scope.calculateDelQtyForContracts);
    };

    $scope.recalculateDeliveries = function () {
      if (
        !(
          $scope.scaleTicketLoaded &&
          $scope.productionContractLoaded &&
          $scope.purchaseConfirmationLoaded
        )
      ) {
        return;
      }

      $scope.scaleTicketList
        .filter($scope.filterScalesHavingSplits)
        .forEach($scope.calculateSplitedQuantity);
    };
    /* end of delQty calculation functions */

    $scope.initSample();
    $scope.initProductionContract = () => {
      httpService
        .contractByGrower($scope.growerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.productionContractList = [];
            // console.log(res.data.data.docs);
            res.data.data.docs.forEach((productionContract) => {
              productionContract.status = productionContract.status.toString();
              if (productionContract.harvestFileUrl == "0") {
                productionContract.harvestFileUrl = "";
              }

              if (productionContract.chemicalDeclarationFileUrl == "0") {
                productionContract.chemicalDeclarationFileUrl = "";
              }

              $scope.productionContractList.push(productionContract);
            });
            $scope.productionContractLoaded = true;
            $scope.recalculateDeliveries();
          }
        });
    };

    $scope.changeProductionContractStatus = (contract) => {
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
              $scope.contractStatusChange(contract);
            } else {
              swal("Cancelled", "Your contract file is safe :)", "error");
              $scope.initProductionContract();
            }
          }
        );
      } else {
        $scope.contractStatusChange(contract);
      }
    };

    $scope.contractStatusChange = (contract) => {
      spinnerService.show("html5spinner");
      httpService
        .addProductionContract(contract, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            swal("Alert", res.data.userMessage, "success");
          } else {
            swal("Alert", res.data.userMessage, "error");
          }
          $scope.initProductionContract();
          spinnerService.hide("html5spinner");
        });
    };

    $scope.initScaleticket = () => {
      scaleTicketHttpServices
        .getScaleTicketUsingGrowerId($scope.growerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.scaleTicketList = res.data.data;

            $scope.scaleTicketLoaded = true;
            $scope.recalculateDeliveries();
          }
        });
    };
    $scope.initProductionContract();
    $scope.initScaleticket();
    $scope.initPurchaseConfirmation = () => {
      httpService
        .purchaseConfirmationListByGrower($scope.growerId, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.purchaseConfirmationList = [];
            res.data.data.docs.forEach((purchaseConfirmation) => {
              purchaseConfirmation.status = purchaseConfirmation.status.toString();

              $scope.purchaseConfirmationList.push(purchaseConfirmation);
            });
            $scope.purchaseConfirmationLoaded = true;
            $scope.recalculateDeliveries();
          }
        });
    };
    $scope.initPurchaseConfirmation();

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
              $scope.tradePurchaseContractStatusChange(contract);
            } else {
              swal("Cancelled", "Your contract file is safe :)", "error");
              $scope.initPurchaseConfirmation();
            }
          }
        );
      } else {
        $scope.tradePurchaseContractStatusChange(contract);
      }
    };

    $scope.tradePurchaseContractStatusChange = (contract) => {
      spinnerService.show("html5spinner");
      httpService
        .addPurchaseConfirmation(contract, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            swal("Alert", res.data.userMessage, "success");
          } else {
            swal("Alert", res.data.userMessage, "error");
          }
          $scope.initPurchaseConfirmation();
          spinnerService.hide("html5spinner");
        });
    };

    $scope.saveVariety = function () {
      if (!$scope.myForm.varietyName) {
        swal("Here's a message!", "Please fill Variety Name first.", "error");
      } else {
        var data = {
          varietyName: $scope.myForm.varietyName,
        };
        httpService.addVariety(data, $scope.token).then(
          function (res) {
            if (res.data.status == 200) {
              $scope.initVariety();
              $scope.varietyPlus = true;
              $scope.varietyInput = false;
            }
          },
          function (error) {
            //console.log(JSON.stringify(error));
          }
        );
      }
    };
    $scope.calculateTarget = function () {
      if ($scope.myForm.unit == "lbs") {
        $scope.myForm.targetCWT = $scope.myForm.target * 100;
      }
      if ($scope.myForm.unit == "CWT") {
        $scope.myForm.targetCWT = $scope.myForm.target;
      }
      if ($scope.myForm.unit == "MT") {
        $scope.myForm.targetCWT = $scope.myForm.target / 22.0462;
      }
      if ($scope.myForm.unit == "BU") {
        $scope.myForm.targetCWT = $scope.myForm.target * 60;
      }
      if (!$scope.myForm.unit) {
        $scope.myForm.targetCWT = $scope.myForm.target;
      }
      $scope.myForm.targetCWT = $scope.myForm.targetCWT.toFixed(4);
    };

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
        switch ($scope.rolloverOf) {
          case "PRODUCTION_CONTRACT":
            httpService.createRollover($scope.rolloverForm, $scope.token).then(
              function (res) {
                if (res.data.status == 200) {
                  $scope.initProductionContract();
                  swal(
                    "Successful!",
                    "Rollover for contract created.",
                    "success"
                  );
                } else {
                  swal("Unsuccessful", res.data.userMessage, "error");
                }
              },
              function (error) {
                swal(
                  "Unsuccessful",
                  "Was unable to create rollover contract",
                  "error"
                );
              }
            );
            break;

          case "PURCHASE_CONFIRMATION":
            httpService
              .createPurchaseConfirmationRollover(
                $scope.rolloverForm,
                $scope.token
              )
              .then(
                function (res) {
                  if (res.data.status == 200) {
                    $scope.initPurchaseConfirmation();
                    swal(
                      "Successful!",
                      "Rollover for contract created.",
                      "success"
                    );
                  } else {
                    swal("Unsuccessful", res.data.userMessage, "error");
                  }
                },
                function (error) {
                  swal(
                    "Unsuccessful",
                    "Was unable to create rollover contract",
                    "error"
                  );
                }
              );
            break;

          default:
            break;
        }
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
//Rollover calc
    $scope.showRolloverPopup = (contract, rolloverOf) => {
      var commodityId = contract.commodityId._id;
      if (!$scope.inventoryGrades[commodityId]) {
        $scope.loadInventoryGrade(commodityId);
      } else {
        $scope.inventoryGrade = $scope.inventoryGrades[commodityId];
      }

      $(".rollover_popup").fadeIn();
      $(".popup_overlay").fadeIn();
      $scope.rolloverOf = rolloverOf;

      $scope.rolloverForm.contract_id = contract._id;
      $scope.rolloverContract = contract;
      // quantityLbs subtraction delQty
      // $scope.rolloverForm.quantityLbs = Math.floor(
      //   contract.quantityLbs - contract.delQty
      // );
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
    //shipped Quantity Lbs
    $scope.getShippedQuantityLbs = (scale) => {
      var totalShippedQuantityLbs = 0;
      if (scale && scale.length > 0) {
        scale.forEach((val) => {
          // convert kb to pounds ( Number(val.netWeight) * 2.2046)
          if (!val.void) {
            totalShippedQuantityLbs += val.netWeight
              ? Number(val.netWeight) * 2.2046
              : 0;
          }
        });
      }
      return totalShippedQuantityLbs;
    };

    $scope.saveSample = function () {
      if (!$scope.myForm.receiveDate) {
        $scope.myForm.sampleStatus = "Requested";
      } else if ($scope.myForm.requestDate) {
        $scope.myForm.sampleStatus = "Received";
      } else if ($scope.myForm.markForDump == "Yes") {
        $scope.myForm.sampleStatus = "Mark For Dump";
      } else if ($scope.myForm.dumped == "Yes") {
        $scope.myForm.sampleStatus = "Dumped";
      } else if ($scope.myForm.analyzed == "Yes") {
        $scope.myForm.sampleStatus = "Dumped";
      }
      if ($scope.myForm.requestDate) {
        $scope.myForm.requestDate = moment($scope.myForm.requestDate);
      } else {
        $scope.myForm.requestDate = "";
      }
      if ($scope.myForm.receiveDate) {
        $scope.myForm.receiveDate = moment($scope.myForm.receiveDate);
      } else {
        $scope.myForm.receiveDate = "";
      }
      $scope.myForm.growerId = $scope.growerId;
      $scope.myForm.createdAt = $scope.myForm.createdAt || moment(new Date());
      $scope.myForm.sampleAnalysis = $scope.commoditySampleAnalysis.map(
        function (elem) {
          return {
            analysisId: elem._id,
            analysisDetails: elem.analysisDetails,
          };
        }
      );

      if ($scope.selectedSampleForEdit) {
        var isSame = commonService.compareObjects(
          $scope.selectedSampleForEdit, $scope.myForm,
          {
            keys: [
              'analyzed', 'acres', 'bid', 'comments', 'commodityAnalysis',
              'commodityId', 'createdBy', 'cropYear', 'dumped', 'dumpedBy',
              'farmersLot', 'gradeId', 'growerId', 'lastEditedBy',
              'lastEditedOn', 'lastOpenedBy', 'markForDump',
              'oldSampleNumber', 'quantityPound', 'receiveDate',
              'requestDate', 'sampleAnalysis', 'sampleNumber',
              'status', 'target', 'targetCWT', 'unit', 'varietyId'
            ],
            skipKeys: ['sampleStatus'],
            comparators: {
              commodityId: commonService.idObjectComparator,
              gradeId:  commonService.idObjectComparator,
              growerId:  commonService.idObjectComparator,
              createdAt: commonService.dateComparator,
              receiveDate: commonService.dateComparator,
              requestDate: commonService.dateComparator,
              sampleAnalysis: commonService.arrayComparator,
            },
            comparatorModifiers: {
              requestDate: 'date',
              receiveDate: 'date',
              sampleAnalysis: function(a, b) {
                return _.isEqual(_.pick(a, ['analysisId', 'analysisDetails']), b);
              },
            }
          }
        );

        if (isSame) {
          $scope.closepop();
          $scope.myForm = {};
          return;
        }
      }

      httpService.addSample($scope.myForm, $scope.token).then(function (res) {
        if (res.data.status == 200) {
          $scope.initSample();
          $scope.closepop();
          $scope.myForm = {};
          $scope.selectedSampleForEdit = null;
          swal("Alert!", res.data.userMessage, "success");
        }
      });
    };
    $scope.delete = function (id) {
      $scope.data = {
        idsArray: [id],
      };
      swal(
        {
          title: "Are you sure?",
          text: "Your will not be able to recover this contract!",
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
            httpService.removeContract($scope.data, $scope.token).then(
              function (res) {
                if (res.data.status == 200) {
                  $scope.initProductionContract();
                  $scope.arr = [];
                  $scope.allChecked = true;
                  swal(
                    "Deleted!",
                    "Your contract has been deleted.",
                    "success"
                  );
                }
              },
              function (error) {
                //console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Your contract file is safe :)", "error");
          }
        }
      );
    };

    //rajeev generateTicketPdf
    $scope.generateTicketPdf = function (contractNumber, id) {
      if (contractNumber) {
        swal(
          {
            title: "Are you sure?",
            text: "You want to generate ticket pdf!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes,PDF generate!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: true,
            closeOnCancel: false,
          },
          function (isConfirm) {
            spinnerService.show("html5spinner");
            if (isConfirm) {
              httpService
                .generateTicketPdf({ contractNumber, id }, $scope.token)
                .then(
                  function (res) {
                    if (res.data.status == 200) {
                      $scope.initProductionContract();
                      $scope.arr = [];
                      $scope.allChecked = true;
                      spinnerService.hide("html5spinner");
                      swal(
                        "Generated!",
                        "Your contract pdf has been generated.",
                        "success"
                      );
                    }
                  },
                  function (error) {
                    //console.log(JSON.stringify(error));
                  }
                );
            } else {
              swal("Cancelled", "Your contract file is safe :)", "error");
            }
          }
        );
      }
    };

    $scope.activate_Deactivate_grower = function (id, status) {
      var newStatus = status == 0 ? 1 : 0;
      if (id) {
        $scope.arr = [id];
      }
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one grower.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
          status: newStatus,
        };
        swal(
          {
            title: "Are you sure?",
            text: `Your want be ${
              status == 0 ? "deactivate" : "activate"
            } this grower!`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: `Yes, ${
              status == 0 ? "deactivate" : "activate"
            } it!`,
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
          },
          function (isConfirm) {
            if (isConfirm) {
              httpService
                .removeGrower($scope.data, $scope.token)
                .then(function (res) {
                  if (res.data.status == 200) {
                    $scope.initGrower(pageNo);
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal({
                      title: "Deleted!",
                      text: `Your grower has been ${
                        status == 0 ? "deactivated" : "activated"
                      }.`,
                      type: "success",
                      timer: 2000,
                    });
                  }
                });
            } else {
              swal({
                title: "Cancelled!",
                text: "Your grower file is safe :)",
                type: "error",
                timer: 1000,
              });
            }
          }
        );
      }
    };

    $scope.deleteSample = function (id) {
      $scope.data = {
        idsArray: [id],
      };
      swal(
        {
          title: "Are you sure?",
          text: "Your will not be able to recover this sample!",
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
            httpService.removeSample($scope.data, $scope.token).then(
              function (res) {
                if (res.data.status == 200) {
                  $scope.initSample();
                  $scope.arr = [];
                  $scope.allChecked = true;
                  swal("Deleted!", "Your sample has been deleted.", "success");
                }
              },
              function (error) {
                //console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Your sample file is safe :)", "error");
          }
        }
      );
    };
    $scope.initPhoneNote = () => {
      httpService
        .getPhoneNote(
          $scope.token,
          $scope.growerId,
          $scope.growerDetails.reference
        )
        .then(
          function (res) {
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
          },
          function (error) {
            //console.log(JSON.stringify(error));
          }
        );
    };
    $scope.phoneNoteSubmit = () => {
      if (!$scope.myForm.message) {
        swal("Error", "Please enter value first.", "error");
      } else {
        var data = {
          growerId: $scope.growerDetails._id,
          message: $scope.myForm.message,
          referenceNumber: $scope.growerDetails.reference,
        };
        httpService.addPhoneNote(data, $scope.token).then(
          function (res) {
            if (res.data.status == 200) {
              $scope.initPhoneNote();
              $scope.myForm = {};
            }
          },
          function (error) {
            //console.log(JSON.stringify(error));
          }
        );
      }
    };

    $scope.callBackFunction = function () {
      if ($scope.growerDetails.callBack) {
        $scope.growerDetails.callBackDate = moment(
          $scope.growerDetails.callBackDate
        );
      } else {
        $scope.growerDetails.callBackDate = "";
      }
      //Update Grower Section
      httpService.updateGrower($scope.growerDetails, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.initGrower();
            $scope.closepop();
          } else {
            swal("ERROR", res.data.userMessage, "error");
          }
        },
        function (error) {
          //console.log(JSON.stringify(error));
        }
      );
    };

    $scope.saveChanges = function () {
      $scope.manageFarms('blur');
      $scope.myForm.addresses = [
        {
          street: $scope.myForm.street,
          town: $scope.myForm.town,
          province: $scope.myForm.province,
          postal: $scope.myForm.postal,
          country: $scope.myForm.country,
          rm: $scope.myForm.rm,
        },
      ];
      $scope.myForm.fullAddress = $scope.myForm.street;
      httpService.updateGrower($scope.myForm, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.initGrower();
            $scope.closepop();
          } else {
            swal("ERROR", res.data.userMessage, "error");
          }
        },
        function (error) {
          //console.log(JSON.stringify(error));
        }
      );
    };

    $scope.selectedFile = (input) => {
      $scope.file = input.files[0];
      if ($scope.file.name.split(".").pop() !== "pdf") {
        $scope.errorMessage = "Invalid pdf file";
        $scope.file = "";
      }
    };

    $scope.uploadGrowerPdf = () => {
      if ($scope.file) {
        spinnerService.show("html5spinner");
        var data = {
          file: $scope.file,
          expiryDate: $scope.growerDetails.certificateExpiryDate,
          type: 'certificate'
        };
        httpService.uploadGrowerPdf(data, $scope.growerId, $scope.token).then(
          function (res) {
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
              $scope.growerDetails.pdfUploaded = true;
              $scope.growerDetails.pdfUrl = res.data.data;
              $scope.closepop();
              swal("Success", "Pdf uploaded successfully.", "success");
            } else {
              $scope.errorMessage = res.data.userMessage;
            }
          },
          function (error) {
            spinnerService.hide("html5spinner");
          }
        );
      } else {
        $scope.errorMessage = $scope.errorMessage
          ? $scope.errorMessage
          : "Please select file";
      }
    };

    $scope.uploadGrowerDecPdf = () => {
      if ($scope.file) {
        spinnerService.show("html5spinner");
        var data = {
          file: $scope.file,
          expiryDate: $scope.growerDetails.declarationExpiryDate,
          type: 'declaration'
        };
        httpService.uploadGrowerPdf(data, $scope.growerId, $scope.token).then(
          function (res) {
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
              $scope.growerDetails.pdfDecUploaded = true;
              $scope.growerDetails.pdfDecUrl = res.data.data;
              $scope.closepop();
              swal("Success", "Pdf uploaded successfully.", "success");
            } else {
              $scope.errorMessage = res.data.userMessage;
            }
          },
          function (error) {
            spinnerService.hide("html5spinner");
          }
        );
      } else {
        $scope.errorMessage = $scope.errorMessage
          ? $scope.errorMessage
          : "Please select file";
      }
    };

    $scope.saveAll = function (contractType = '') {
      var fields = ['chemicalDeclarationFileUrl', 'signedContractPdf'];
      if (!contractType) {
        fields.push('cropInspectionPdf');
        $scope.upload('uploadFile');
      }

      fields.forEach(field => {
        $scope.uploadPdf(field, contractType);
      });
    };

    $scope.upload = () => {
      if ($scope.uploadForm.uploadFile) {
        spinnerService.show("html5spinner");
        var data = {
          file: $scope.uploadForm.uploadFile,
          harvestQty: $scope.uploadForm.harvestQty,
          harvestQtyUnit: $scope.uploadForm.harvestQtyUnit
        };
        httpService
          .uploadHarvestedFile(data, $scope.selectedContract._id, $scope.token)
          .then(function (res) {
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
              Object.assign($scope.selectedContract, res.data.data);
              $scope.formatContractData();
              $scope.closepop();
              $scope.uploadForm.uploadFile = null;
              swal("Success", "Harvest file uploaded successfully.", "success");
            } else {
              $scope.errMsg = res.data.userMessage;
            }
          });
      } else {
        $scope.errMsg = $scope.errMsg ? $scope.errMsg : "Please select file";
      }
    };

    $scope.removePdf = (pdfType) => {
      swal(
        {
          title: "Are you sure?",
          text: "Your will not be able to recover this document!",
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
            httpService.removeGrowerPdf($scope.growerId, pdfType, $scope.token).then(
              function (res) {
                spinnerService.hide("html5spinner");
                if (res.data.status == 200) {
                  if (pdfType === 'declaration') {
                    $scope.growerDetails.pdfDecUploaded = false;
                    $scope.growerDetails.declarationExpiryDate = "";
                  } else {
                    $scope.growerDetails.pdfUploaded = false;
                    $scope.growerDetails.certificateExpiryDate = "";
                  }
                  swal("Deleted!", "Document deleted.", "success");
                }
              },
              function (error) {
                spinnerService.hide("html5spinner");
                //console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Your file is safe :)", "error");
          }
        }
      );
    };

    $scope.selectFile = function (input, type, contractType = '') {
      var formContainer = 'uploadForm' + contractType;
      $scope[formContainer][type] = input.files[0];
      if (!$scope[formContainer][type]) {
        return;
      }
      var ext = $scope[formContainer][type].name.split(".").pop();
      if (!["pdf", "jpg", "png", "jpeg"].includes(ext)) {
        $scope.errMsgs = "Invalid file selected";
        $scope[formContainer][type] = "";
      }
    };

    $scope.formatContractData = function () {
      $scope.selectedContract.status = $scope.selectedContract.status.toString();
      if ($scope.selectedContract.harvestFileUrl == "0") {
        $scope.selectedContract.harvestFileUrl = "";
      }
      if ($scope.selectedContract.chemicalDeclarationFileUrl == "0") {
        $scope.selectedContract.chemicalDeclarationFileUrl = "";
      }
    };

    $scope.uploadPdf = function (field, contractType = '') {
      var formContainer = 'uploadForm' + contractType;
      if ($scope[formContainer][field]) {
        spinnerService.show("html5spinner");
        var data = {
          file: $scope[formContainer][field],
          field: field,
        };
        var serviceName = contractType ? 'uploadPdf' : 'uploadProductionPdf';
        httpService[serviceName](data, $scope.selectedContract._id, $scope.token)
          .then(function (res) {
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
              Object.assign($scope.selectedContract, res.data.data);
              $scope.formatContractData();
              $scope.closepop();
              $scope.uploadForm[field] = null;
              swal("Success", "Document uploaded successfully.", "success");
            } else {
              $scope.errMsg = res.data.userMessage;
            }
          });
      } else {
        $scope.errMsg = $scope.errMsg
          ? $scope.errMsg
          : "Please select file first then upload";
      }
    };

    $scope.openPop = function (data, type) {
      if (type == "view") {
        $scope.myForm = _.clone(data);
        $scope.myForm.targetCWT = _.clone(data.targetCWT);
        $scope.myForm.bid = _.clone(data.bid);
        $scope.myForm.acres = _.clone(data.acres);
        $scope.myForm.commodityId = _.clone(data.commodityId._id);
        if (data.varietyId) {
          $scope.myForm.varietyId = _.clone(data.varietyId._id);
        }
        $scope.getGrade($scope.myForm.commodityId, data.sampleAnalysis);
        if (data.gradeId) {
          $scope.myForm.gradeId = _.clone(data.gradeId._id);
          $scope.myForm.requestDate = moment(data.requestDate).format(
            "YYYY-MM-DD"
          );
          $scope.myForm.receiveDate = moment(data.receiveDate).format(
            "YYYY-MM-DD"
          );
        }
        $(".sample_popup").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "edit") {
        $scope.btnType = "Save Changes";
        $scope.selectedSampleForEdit = data;
        $scope.myForm = _.clone(data);
        $scope.myForm.targetCWT = _.clone(data.targetCWT);
        $scope.myForm.bid = _.clone(data.bid);
        $scope.myForm.acres = _.clone(data.acres);
        $scope.myForm.commodityId = _.clone(data.commodityId._id);
        $scope.getGrade($scope.myForm.commodityId, data.sampleAnalysis);
        if (data.varietyId) {
          $scope.myForm.varietyId = _.clone(data.varietyId._id);
        }
        if (data.gradeId) {
          $scope.myForm.gradeId = _.clone(data.gradeId._id);
          $scope.myForm.requestDate = data.requestDate ? moment(data.requestDate).format(
            "YYYY-MM-DD"
          ) : null;
          $scope.myForm.receiveDate = data.receiveDate ? moment(data.receiveDate).format(
            "YYYY-MM-DD"
          ) : null;
        }
        $(".sample_popup").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "uploadHarvestQty") {
        $scope.file = "";
        $scope.errMsg = "";
        $scope.selectedContract = data;

        $scope.uploadForm.uploadFile = null;
        $scope.uploadForm.chemicalDeclarationFileUrl = null;
        $scope.uploadForm.cropInspectionPdf = null;
        $scope.uploadForm.signedContractPdf = null;

        $scope.uploadForm.harvestQty = data.harvestQty;
        $scope.uploadForm.harvestQtyUnit = data.harvestQtyUnit;
        $('[name="addPdfAndQtyForm_342834"]')[0].reset();
        $(".add_pdf_qty").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == 'uploadPurchaseDocument') {
        $scope.file = "";
        $scope.errMsg = "";
        $scope.selectedContract = data;

        $scope.uploadFormPurchase.chemicalDeclarationFileUrl = null;
        $scope.uploadFormPurchase.signedContractPdf = null;

        $('[name="addPdfAndQtyForm_342390"]')[0].reset();
        $(".add_purchase_docs").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        $scope.btnType = "Save";
        $(".sample_popup").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };

    $scope.saveNote = function() {
      if ($scope.cachedNote == $scope.growerDetails.note) return;

      spinnerService.show("html5spinner");
      httpService.upateNote($scope.growerDetails._id, $scope.growerDetails.note, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.cachedNote = $scope.growerDetails.note;
          }
          spinnerService.hide("html5spinner");
        })
    };

    $scope.openGrowerPop = function (data, type) {
      if (type == "view") {
        $(".grower_popup").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.town = data.addresses[0].town;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.rm = data.addresses[0].rm;
        $scope.myForm.country = data.addresses[0].country;
      } else if (type == "edit") {
        $(".grower_popup").fadeIn();
        $(".popup_overlay").fadeIn();
        $scope.inputField = type;
        $scope.myForm = _.clone(data);
        $scope.myForm.street = data.addresses[0].street;
        $scope.myForm.town = data.addresses[0].town;
        $scope.myForm.province = data.addresses[0].province;
        $scope.myForm.postal = data.addresses[0].postal;
        $scope.myForm.rm = data.addresses[0].rm;
        $scope.myForm.country = data.addresses[0].country;
      } else {
        $scope.resetFarm();
        $(".grower_popup").fadeIn();
        $(".popup_overlay").fadeIn();
      }
      if (!($scope.myForm.farmNames && Array.isArray($scope.myForm.farmNames))) {
        $scope.myForm.farmNames = [];
      }

      if ($scope.myForm.farmName && $scope.myForm.farmNames.length === 0) {
        $scope.myForm.farmNames.unshift($scope.myForm.farmName);
      }
    };

    $scope.uploadPdfModal = function (data) {
      $scope.selectedGrower = data;
      $scope.file = "";
      $scope.errorMessage = "";
      angular.element("input[type='file']").val(null);
      $(".new_add1").fadeIn();
    };

    $scope.uploadPdfDecModal = function (data) {
      $scope.selectedGrower = data;
      $scope.file = "";
      $scope.errorMessage = "";
      angular.element("input[type='file']").val(null);
      $(".new_add2").fadeIn();
    };

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

    $scope.takeRating = function (rating) {
      httpService.getRating($scope.growerDetails._id, $scope.token).then(
        (objS) => {
          $scope.ratingList = objS.data.status == 200 ? objS.data.data : [];
          $scope.ratingform = {
            rating: rating,
            growerId: $scope.growerDetails._id,
          };
          $(".rating_popup").fadeIn();
          $(".popup_overlay").fadeIn();
        },
        (objE) => {
          //console.log(objE);
        }
      );
    };

    $scope.updateRating = function () {
      httpService.updateRating($scope.ratingform, $scope.token).then(
        (objS) => {
          if (objS.data.status == 200) {
            $scope.closepop();
            $scope.growerDetails.rating = $scope.ratingform.rating;
            swal("Alert!", objS.data.userMessage, "success");
          } else {
            swal("Alert!", objS.data.userMessage, "error");
          }
        },
        (objE) => {
          //console.log(objE);
        }
      );
    };

    $scope.removeRating = function () {
      swal(
        {
          title: "Are you sure?",
          text: "Your want to remove this grower rating!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, remove it!",
          cancelButtonText: "No, cancel!",
          closeOnConfirm: false,
          closeOnCancel: false,
        },
        function (isConfirm) {
          if (isConfirm) {
            spinnerService.show("html5spinner");
            httpService.removeGrowerRating($scope.growerId, $scope.token).then(
              function (res) {
                spinnerService.hide("html5spinner");
                if (res.data.status == 200) {
                  $scope.growerDetails.rating = 0;
                  swal("Removed!", "Rating removed successfully.", "success");
                }
              },
              function (error) {
                spinnerService.hide("html5spinner");
                //console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Grower rating is safe :)", "error");
          }
        }
      );
    };

    $scope.send_mail = function (data, type) {
      if (!data.pdfUrl || data.mailSent || data.status == 2) return;
      else if (!data.growerId.email) {
        swal("Error", "Email not attched with this grower");
      } else {
        $(".compose_mail").fadeIn();
        $(".popup_overlay").fadeIn();
        ckEditorService.showEditor();
        $scope.data = data;
        $scope.type = type;
        $scope.emailSending = false;
        $scope.to_email = [data.growerId.email];
        $scope.cc_email = [data.createdBy.email];
        $scope.to_email = $scope.to_email
          .filter((val) => val)
          .map((val1) => val1);
        $scope.cc_email = $scope.cc_email
          .filter((val) => val)
          .map((val1) => val1);

        $scope.emailform = {
          body: `<p><strong>Hi ${$scope.data.growerId.firstName},</strong></p>

                        <p>Please click the link below to review your ${
                          type == "purchase confirmation"
                            ? "purchase confirmation contract"
                            : "production contract"
                        }.  If you have any questions or concerns please give me a call anytime.</p>

                        <p><strong>${$scope.data.pdfUrl}</strong></p>

                        <p>&nbsp;</p>

                        <p>&nbsp;</p>

                        <p><strong>Regards</strong></p>

                        <p>Rudy Agro.</p>`,
          subject:
            type == "purchase confirmation"
              ? "Purchase Confirmation Contract pdf"
              : "Production Contract pdf",
        };
      }
    };
    // <p>To view your quote , please click on the below link :</p>
    $scope.sendMailToUser = (valid) => {
      if (
        $scope.emailform.subject &&
        CKEDITOR.instances.ckeditor.getData() &&
        valid
      ) {
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
              if ($scope.type == "production contract") {
                $scope.initProductionContract();
              } else {
                $scope.initPurchaseConfirmation();
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

    $scope.closepop = function () {
      $(".sample_popup").fadeOut();
      $(".grower_popup").fadeOut();
      $(".popup_overlay").fadeOut();
      $(".new_add1").fadeOut();
      $(".rating_popup").fadeOut();
      $(".rollover_popup").fadeOut();
      $(".compose_mail").fadeOut();
      $(".add_coomm").fadeOut();
      $(".uploadPurchaseDocument").fadeOut();
    };

    $(".popup_overlay , .close").click($scope.closepop);

    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });

    $scope.ticketList = (contract, seqNo) => {
      const { contractNumber, delQty } = contract;
      if (delQty > 0) {
        $state.go("ticketList", {
          seqNo: seqNo,
          contractNumber: contractNumber
        });
      }
    };
  });
