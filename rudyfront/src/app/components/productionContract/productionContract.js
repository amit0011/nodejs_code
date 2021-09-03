angular
  .module("myApp.productionContract", [])
  .controller("productionContractCtrl", function (
    $scope,
    httpService,
    spinnerService,
    apiUrl,
    $rootScope,
    $state,
    commonService,
    $sce
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.purchase ||
        !data.purchase.productionContracts ||
        !data.purchase.productionContracts.viewMenu
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
    $scope.myForm = { address: true };
    $scope.uploadForm = {};
    $scope.exportTrue = false;
    $scope.arr = [];
    $scope.allChecked = true;
    $scope.showTotalBox = false;
    var i, item;
    var pageNo = localStorage.getItem("production_cont_page_No") || 1;
    $scope.contractByNo = "";
    $scope.totalQuantityLbs = 0;
    $scope.totalDelQty = 0;
    $scope.totalWegAvrg = 0;
    $scope.totalOutStandingQty = 0;
    $scope.searchModel = { status: "0", limit: "10" };
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));
    $scope.canChangeStatus = function (contract) {
      return commonService.canChangeStatus(contract, $rootScope.loggedInUser);
    };
    $scope.cropYears = commonService.cropYears();
    httpService.getCommodity($scope.token).then(function (res) {
      if (res.data.status == 200) {
        $scope.commoditys = res.data.data;
      }
    });
    $scope.search = function (pageNo, pendingTask = null) {
      spinnerService.show("html5spinner");
      localStorage.setItem(
        "production_contract_filter",
        JSON.stringify($scope.searchModel)
      );
      if ($scope.searchModel.limit) {
        $scope.searchModel.limit = Number($scope.searchModel.limit);
      }

      var searchParam = Object.assign({}, $scope.searchModel);
      searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
      searchParam.toDate = commonService.adjustDate(searchParam.toDate, "]");
      searchParam.deliveryDateFrom = commonService.adjustDate(
        searchParam.deliveryDateFrom
      );
      searchParam.deliveryDateTo = commonService.adjustDate(
        searchParam.deliveryDateTo,
        "]"
      );
      searchParam.getSum = true;
      searchParam.address = true;
//Search fileld
      httpService
        .searchProductionContractInfo(searchParam, $scope.token, pageNo)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.productionContractList = res.data.data.docs;
            $scope.qtySum = res.data.data.qtySum;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            $scope.totallimit = res.data.data.limit;
            $scope.searchModel.limit = res.data.data.limit.toString();
            $scope.totalQuantityLbs = 0;
            $scope.totalDelQty = 0;
            $scope.totalWegAvrg = 0;
            $scope.totalOutStandingQty = 0;
            for (var i = 0; i < $scope.productionContractList.length; i++) {
              if ($scope.searchModel.commodityId) {
                if (
                  $scope.productionContractList[i].quantityLbs &&
                  $scope.productionContractList[i].status != 2
                ) {
                  $scope.totalQuantityLbs +=
                    $scope.productionContractList[i].quantityLbs / 100;
                  $scope.totalWegAvrg =
                    ($scope.productionContractList[i].quantityLbs /
                      100 /
                      $scope.totalQuantityLbs) *
                    $scope.productionContractList[i].CWTDel;
                  $scope.totalOutStandingQty =
                    $scope.totalQuantityLbs - $scope.totalDelQty;
                }
                
                if ($scope.productionContractList[i].delQty) {
                  $scope.totalDelQty += $scope.productionContractList[i].delQty;
                }
                $scope.showTotalBox = true;
              }
              $scope.productionContractList[
                i
              ].status = $scope.productionContractList[i].status.toString();
              if ($scope.productionContractList[i].harvestFileUrl == "0") {
                $scope.productionContractList[i].harvestFileUrl = "";
              }
              if (
                $scope.productionContractList[i].chemicalDeclarationFileUrl ==
                "0"
              ) {
                $scope.productionContractList[i].chemicalDeclarationFileUrl =
                  "";
              }
            }
          }
          if (pendingTask) {
            pendingTask($scope.productionContractList);
          }
          spinnerService.hide("html5spinner");
        });
    };

    $scope.reloadWeight = function(contractNumber) {
      httpService.reloadProductionWeight(contractNumber, $scope.token).then(function(res) {
        if (res.data.status === 200) {
          $scope.search(localStorage.getItem('production_cont_page_No'));
        }
      });
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

    $scope.groweDetails = (growerId) => {
      if ($rootScope.loginUserAccess.purchase.growers.view) {
        $state.go("growerDetails", {
          id: growerId,
        });
      }
    };

    $scope.getShippedQuantityLbs = (contract) => {
      var totalShippedQuantityLbs = 0;
      if (contract.scale && contract.scale.length > 0) {
        contract.scale.forEach((val) => {
          // convert kb to pounds ( Number(val.netWeight) * 2.2046)
          if (!val.void) {
            totalShippedQuantityLbs += val.netWeight
              ? Number(val.netWeight) * 2.2046
              : 0;
          }
        });
      }

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

    $scope.DoCtrlPagingAct = function (page) {
      page = page || pageNo;
      localStorage.setItem("production_cont_page_No", page);
      var prev_filter = localStorage.getItem("production_contract_filter");
      if (prev_filter) {
        $scope.searchModel = JSON.parse(prev_filter);
      } else {
        $scope.searchModel = { status: "0", address: true };
      }

      var keys = Object.keys($scope.searchModel);
      if (keys.length) {
        $scope.search(page);
      } else {
        $scope.search(page);
      }
    };

    $scope.clear = () => {
      $scope.searchModel = { status: "0" };
      localStorage.setItem("production_cont_page_No", 1);
      localStorage.removeItem("production_contract_filter");
      $scope.search(1);
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
              $scope.search();
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
          $scope.search();
          spinnerService.hide("html5spinner");
        });
    };

    $scope.delete = function () {
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one commodity.", "error");
      } else {
        $scope.data = {
          idsArray: $scope.arr,
        };
        swal(
          {
            title: "Are you sure?",
            text: "Your will not be able to recover this commodity!",
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
              httpService
                .removeCommodity($scope.data, $scope.token)
                .then(function (res) {
                  if (res.data.status == 200) {
                    $scope.initCommodity();
                    $scope.arr = [];
                    $scope.allChecked = true;
                    swal(
                      "Deleted!",
                      "Your commodity has been deleted.",
                      "success"
                    );
                  }
                });
            } else {
              swal("Cancelled", "Your commodity file is safe :)", "error");
            }
          }
        );
      }
    };

    $scope.openPop = function (type, data) {
      if (type == "edit") {
        $scope.inputField = type;
        $scope.updateFrom = data;
        $scope.updateFrom.commodityTypeId = data.commodityTypeId._id;
        $scope.gradeList = data.commodityTypeId._id;
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "uploadPDF") {
        $scope.file = "";
        $scope.errMsg = "";
        $scope.selectedContract = data;
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
        $('[name="addPdfAndQtyForm_342831"]')[0].reset();
        $(".add_pdf_qty").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        $scope.inputField = type;
        $scope.updateFrom = data;
        $scope.updateFrom.commodityTypeId = data.commodityTypeId._id;
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };

    $scope.saveChanges = function () {
      httpService
        .updateCommodity($scope.updateFrom, $scope.token)
        .then(function (res) {
          if (res.data.status == 200) {
            $scope.closepop();
            $scope.initCommodity();
          }
        });
    };
    $scope.searchFunction = () => {
      spinnerService.show("html5spinner");
      httpService
        .getProductionContract(
          "",
          "",
          pageNo,
          $scope.contractByNo,
          $scope.token
        )
        .then(function (res) {
          if (res.data.status == 200) {
            spinnerService.hide("html5spinner");
            $scope.productionContractList = res.data.data.docs;
            $scope.page = res.data.data.page;
            $scope.totalPages = res.data.data.total;
            for (var i = 0; i < $scope.productionContractList.length; i++) {
              $scope.productionContractList[
                i
              ].status = $scope.productionContractList[i].status.toString();
            }
          }
        });
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

    $scope.closepop = function () {
      $(".add_coomm").fadeOut();
      $(".popup_overlay").fadeOut();
    };
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });

    $scope.saveAll = function () {
      var fields = ['chemicalDeclarationFileUrl', 'cropInspectionPdf', 'signedContractPdf'];
      $scope.upload('uploadFile');

      fields.forEach(field => {
        $scope.uploadPdf(field);
      });
    };

    $scope.uploadPdf = function (field) {
      if ($scope.uploadForm[field]) {
        spinnerService.show("html5spinner");
        var data = {
          file: $scope.uploadForm[field],
          field: field,
        };

        httpService
          .uploadProductionPdf(data, $scope.selectedContract._id, $scope.token)
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
          $scope.search();
          spinnerService.hide("html5spinner");
        });
    };

    $scope.delete = function () {
      if ($scope.arr.length == 0) {
        swal("Here's a message!", "Select atleast one commodity.", "error");
        httpService
          .uploadProductionPdf(data, $scope.selectedContract._id, $scope.token)
          .then(function (res) {
            spinnerService.hide("html5spinner");
            if (res.data.status == 200) {
              $scope.selectedContract.contractIsSigned = true;
              $scope.closepop();
              swal("Success", "Pdf uploaded successfully.", "success");
            } else {
              $scope.errMsg = res.data.userMessage;
            }
          });
      } else {
        $scope.errMsg = $scope.errMsg ? $scope.errMsg : "Please select file";
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
              $scope.uploadForm.uploadFile = null;
              $scope.closepop();
              swal("Success", "Harvest file uploaded successfully.", "success");
            } else {
              $scope.errMsg = res.data.userMessage;
            }
          });
      } else {
        $scope.errMsg = $scope.errMsg ? $scope.errMsg : "Please select file";
      }
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
            httpService
              .removeProductionSignedContract(data._id, $scope.token)
              .then(
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

    $scope.exportSheet = (data) => {
      var old_limit = $scope.searchModel.limit;
      $scope.page = 1;
      $scope.searchModel.limit = 2000;
      $scope.search($scope.page, (data) => {
        var newData = data.map((production) => {
          production.growerFullName = production.growerId ?
            (production.growerId.firstName + " " + production.growerId.lastName) : '';

          $scope.gradeName = production.gradeId ? production.gradeId.gradeName : '';

          var address =
            production.growerId.addresses &&
            production.growerId.addresses.length > 0
              ? production.growerId.addresses[0]
              : {
                  street: "",
                  street2: "",
                  town: "",
                  province: "",
                  postal: "",
                  country: "",
                };

          return {
            Date: moment(production.createdAt).format("MM/DD/YYYY"),
            Name: production.growerFullName,
            "Farm Name": production.growerId.farmName,
            "Cell Number": production.growerId.cellNumber,
            Signed: production.contractIsSigned ? "Yes" : "No",
            City: production.growerId.addresses
              ? production.growerId.addresses[0].town
              : "",
            Commodity: production.commodityId
              ? production.commodityId.commodityName
              : "",
            Grade: $scope.gradeName,
            "Crop Year": production.cropYear,
            Acers: production.acres,
            CWTDel: production.CWTDel,
            "Contrat Number": production.contractNumber,
            "Delivery Date From": moment(production.deliveryDateFrom).format(
              "MM/DD/YYYY"
            ),
            "Delivery Date To": moment(production.deliveryDateTo).format(
              "MM/DD/YYYY"
            ),
            "Delivery Option": production.deliveryOption,
            "Del Qty": production.delQty || "",
            "Quantity Lbs": production.quantityLbs,
            "Price Option": production.priceOption,
            "Person Farm Type": production.personFarmType,
            "Fixed On First": production.fixedOnFirst,
            "Fixed Price": production.fixedPrice || 0,
            "Fixed Price Unit": production.fixedPriceUnit,
            "Freight Rate": production.freightRate,
            "Grower Retain": production.growerRetain,
            "Grower Retain Units": production.growerRetainUnits,
            "Contract Return Date": moment(
              production.contractReturnDate
            ).format("MM/DD/YYYY"),
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
          fileName: "Production Contract report.xlsx",
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
        $scope.searchModel.limit = old_limit;
      });
    };

    $scope.ticketList = (contractNumber, delQty) => {
      if (delQty > 0) {
        $state.go("ticketList", {
          seqNo: 0,
          contractNumber: contractNumber,
        });
      }
    };
  });
