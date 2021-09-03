angular
  .module("myApp.sample", [])
  .controller("sampleCtrl", function (
    $scope,
    $state,
    httpService,
    spinnerService,
    apiUrl,
    $rootScope,
    commonService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.purchase ||
        !data.purchase.productionRecords ||
        !data.purchase.productionRecords.viewMenu
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "sample",
    };

    $scope.myForm = {};
    $scope.searchModel = Object.assign({
      status: "all",
    }, JSON.parse(localStorage.getItem('production_record_filter')));

    $scope.statuses = [
      { text: "All", value: "all" },
      { text: "Requested", value: "requested" },
      { text: "Received", value: "received" },
    ];
    $scope.current_page = localStorage.getItem("prod_record_page") || 1;
    $scope.userType = JSON.parse(localStorage.getItem("userType"));
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.$watch(
      "current_page",
      function (newValue, oldValue) {
        localStorage.setItem("prod_record_page", newValue);
      },
      true
    );
    $scope.cropYears = commonService.cropYears();
    $scope.clear = function () {
      $scope.searchModel = {
        status: "all"
      };
      $scope.sampleList = [];
      localStorage.removeItem('production_record_filter');
    };

    $scope.initSample = function (search) {
      spinnerService.show("html5spinner");
      search.token = $scope.token;

      httpService.getSample(search).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.sampleList = res.data.data;
            $scope.samples = $scope.sampleList
              .filter((s) => s.sampleNumber && s.dumped != 1)
              .map((s) => s._id);
          }
          spinnerService.hide("html5spinner");
        },
        function (error) {
          spinnerService.hide("html5spinner");
        }
      );
    };

    $scope.initDumped = function () {
      httpService.getDumpList($scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.dumpedList = res.data.data;
            $scope.samples = $scope.dumpedList.map((s) => s._id);
          }
          spinnerService.hide("html5spinner");
        },
        function (error) {
          spinnerService.hide("html5spinner");
        }
      );
    };

    $scope.setActive = function (sample) {
      $scope.activeSampleId = sample._id;
    };

    $scope.getClass = function (sample) {
      return sample._id == $scope.activeSampleId ? "active" : "";
    };

    $scope.isAllSelected = false;
    $scope.selection = [];
    $scope.sampleCount = 0;
    $scope.toggleAll = function () {
      $scope.isAllSelected = !$scope.isAllSelected;
      if ($scope.isAllSelected) {
        $scope.sampleCount = $scope.samples.length;
        $scope.selection = [...$scope.samples];
      } else {
        $scope.selection = [];
        $scope.sampleCount = 0;
      }
    };
    $scope.toggleSelection = function (sampleId) {
      const index = $scope.selection.indexOf(sampleId);

      if (index > -1) {
        $scope.selection.splice(index, 1);
        $scope.sampleCount--;
      } else {
        $scope.selection.push(sampleId);
        $scope.sampleCount++;
      }
      $scope.isAllSelected = $scope.samples.length === $scope.sampleCount;
    };

    $scope.search = (save = true) => {
      if (save === true) {
        localStorage.setItem('production_record_filter', JSON.stringify($scope.searchModel));
      }
      $scope.selectedCommodity = $scope.commoditys.find(function (commodity) {
        return commodity._id == $scope.searchModel.commodityId;
      });
      $scope.analysis = $scope.selectedCommodity.commoditySampleAnalysis;

      if ($scope.searchModel.commodityId) {
        if (!$scope.searchModel.gradeId) {
          $scope.getGrade($scope.searchModel.commodityId);
          $scope.searchModel.gradeId = "";
        } else if ($scope.searchModel.gradeId) {
          $scope.getGrade($scope.searchModel.commodityId);
        } else {
          $scope.getGrade($scope.searchModel.commodityId);
          $scope.searchModel.gradeId = "";
        }
      } else {
        $scope.searchModel.commodityId = "";
        $scope.searchModel.gradeId = "";
      }
      spinnerService.show("html5spinner");
      $scope.initSample({
        commodityId: $scope.searchModel.commodityId,
        gradeId: $scope.searchModel.gradeId,
        cropYear: $scope.searchModel.cropYear,
        sampleNumber: $scope.searchModel.sampleNumber,
        fromDate: $scope.searchModel.fromDate,
        toDate: $scope.searchModel.toDate,
        status: $scope.searchModel.status
      });
    };
    httpService.getCommodity($scope.token).then(
      function (res) {
        if (res.data.status == 200) {
          $scope.commoditys = res.data.data;

          if (Object.keys($scope.searchModel).length > 1) {
            $scope.search(true);
          }
        }
      },
      function (error) {
        console.log(JSON.stringify(error));
      }
    );

    $scope.getGrade = function (id, samples) {
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
      $scope.commodityGrades = $scope.commoditys.filter(function (hero) {
        return hero._id == id;
      });

      if (samples) {
        $scope.commodityGrades[0].commoditySampleAnalysis.filter(function (
          sample
        ) {
          for (var i = 0; i < samples.length; i++) {
            if (sample._id == samples[i].analysisId) {
              sample.analysisDetails = samples[i].analysisDetails;
            }
          }
        });
      }
      $scope.commoditySampleAnalysis =
        $scope.commodityGrades[0].commoditySampleAnalysis;
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
                  $scope.initSample({});
                  $scope.arr = [];
                  $scope.allChecked = true;
                  swal("Deleted!", "Your sample has been deleted.", "success");
                }
              },
              function (error) {
                console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Your sample file is safe :)", "error");
          }
        }
      );
    };

    //rajeev code Dump Edit
    $scope.editDump = function () {
      if ($scope.selection.length < 1) {
        swal("Info", "You haven't selected any record.", "error");
        return;
      }
      $scope.data = {
        idsArray: $scope.selection,
      };
      swal(
        {
          title: "Are you sure?",
          text: "Selected sample will be added to dump list",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, update it!",
          cancelButtonText: "No, cancel!",
          closeOnConfirm: false,
          closeOnCancel: false,
        },
        function (isConfirm) {
          if (isConfirm) {
            httpService.updateDump($scope.data, $scope.token).then(
              function (res) {
                if (res.data.status == 200) {
                  swal(
                    "Updated!",
                    "Selected sample added to dump list",
                    "success"
                  );
                  window.open("/sample/dumpList", "_self");
                }
              },
              function (error) {
                console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Your samples are safe :)", "error");
          }
        }
      );
    };

    //update sample dumped = 1

    $scope.editDumped = function () {
      if ($scope.selection.length < 1) {
        swal("Info", "You haven't selected any record.", "error");
        return;
      }
      $scope.data = {
        idsArray: $scope.selection,
      };
      swal(
        {
          title: "Are you sure?",
          text:
            "Selected samples will be dumped permanently this can not be undone!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, update it!",
          cancelButtonText: "No, cancel!",
          closeOnConfirm: false,
          closeOnCancel: false,
        },
        function (isConfirm) {
          if (isConfirm) {
            httpService.updateDumped($scope.data, $scope.token).then(
              function (res) {
                if (res.data.status == 200) {
                  $scope.initDumped();
                  $scope.selection = [];
                  swal("Updated!", "Samples dumped successfully", "success");
                }
              },
              function (error) {
                console.log(JSON.stringify(error));
              }
            );
          } else {
            swal("Cancelled", "Your samples dumped are safe :)", "error");
          }
        }
      );
    };

    //export excel for dumped list
    $scope.exportMarkForDumpSheet = (data) => {
      var newData = data.map((sample) => {
        if (sample.gradeId) {
          $scope.gradeName1 = sample.gradeId.gradeName;
        } else {
          $scope.gradeName1 = "NA";
        }
        if (sample.varietyId) {
          $scope.varietyName = sample.varietyId.varietyName;
        } else {
          $scope.varietyName = "NA";
        }
        return {
          "Sample Number": sample.sampleNumber,
          "Grower Name":
            sample.growerId.firstName + " " + sample.growerId.lastName,
          "Grower Email": sample.growerId.email,
          "Phone/Cell Number": sample.growerId.cellNumber,

          "Commodity Name": sample.commodityId.commodityName,
          "Grade Name": $scope.gradeName1,
          Variety: $scope.varietyName,
          Acres: sample.acres || "",
          "Crop Year": sample.cropYear || "",
          "Quantity LBS": sample.quantityPound,
          Bid: sample.bid || "",
          Target: sample.target || "",
          Unit: sample.unit || "",
          "Target CWT": sample.targetCWT || "",
          "Created At": sample.createdAt ? moment(sample.createdAt).format("MM/DD/YYYY") : '',
          "Last Modified Date": sample.lastEditedOn ? moment(sample.lastEditedOn).format("MM/DD/YYYY") : '',
        };
      });
      var obj = {
        data: newData,
        fileName: "sample_dump.xlsx",
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

    //end rajeev code

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
      $scope.myForm.growerId = $scope.growerId;
      $scope.myForm.requestDate = moment($scope.myForm.requestDate);
      $scope.myForm.receiveDate = moment($scope.myForm.receiveDate);
      $scope.myForm.createdAt = moment(new Date());
      $scope.myForm.sampleAnalysis = $scope.commoditySampleAnalysis.map(
        function (elem) {
          return {
            analysisId: elem._id,
            analysisDetails: elem.analysisDetails,
          };
        }
      );
      httpService.addSample($scope.myForm, $scope.token).then(
        function (res) {
          if (res.data.status == 200) {
            $scope.initSample({});
            $scope.closepop();
            $scope.myForm = {};
            swal("Alert!", res.data.userMessage, "success");
          }
        },
        function (error) {
          console.log(JSON.stringify(error));
        }
      );
    };
    $scope.exportSheet = (data) => {
      var newData = data.map((sample) => {
        $scope.gradeName1 = sample.gradeId ? sample.gradeId.gradeName : "NA";
        $scope.varietyName = sample.varietyId ? sample.varietyId.varietyName : "NA";

        var data = {
          "Sample Number": sample.sampleNumber || "",
          "Grower Name": sample.growerId.firstName + " " + sample.growerId.lastName,
          "Grower Email": sample.growerId.email || "",
          "Phone/Cell Number": sample.growerId.cellNumber || "",
          Town: sample.growerId.addresses && sample.growerId.addresses.length > 0 ? sample.growerId.addresses[0].town : '',
          "Commodity Name": sample.commodityId.commodityName || "",
          "Grade Name": $scope.gradeName1 || "",
          Variety: $scope.varietyName || "",
          "Quantity LBS": sample.quantityPound || "",
          Acres: sample.acres || "",
          "Crop Year": sample.cropYear || "",
          Bid: sample.bid || "",
          Target: sample.target || "",
          Unit: sample.unit || "",
          "Formers Lot": sample.farmersLot || "",
        };

        $scope.analysis.forEach(function (ana) {
          var anaObj = sample.sampleAnalysis.find(function (row) {
            return row.analysisId == ana._id;
          });
          data[ana.analysisName] = anaObj ? (anaObj.analysisDetails || "") : 0;
        });

        data["Requested Date"] = sample.requestDate ? moment(sample.requestDate).format("MM/DD/YYYY") : '';
        data["Received Date"] = sample.receiveDate ? moment(sample.receiveDate).format("MM/DD/YYYY") : '';
        data["Target CWT"] = sample.targetCWT || "";
        data["Created At"] = sample.createdAt ? moment(sample.createdAt).format("MM/DD/YYYY") : '';
        data["Last Modified Date"] = sample.lastEditedOn ? moment(sample.lastEditedOn).format("MM/DD/YYYY") : '';

        return data;
      });
      var obj = {
        data: newData,
        fileName: "sample.xlsx",
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

    $scope.groweDetails = (growerId) => {
      if ($rootScope.loginUserAccess.purchase.growers.view) {
        $state.go("growerDetails", {
          id: growerId,
        });
      }
    };

    $scope.calculateTarget = function () {
      if ($scope.myForm.unit == "LBS" || $scope.myForm.unit == "Lbs") {
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

    $scope.openPop = function (data, type) {
      if (type == "view") {
        $scope.myForm = _.clone(data);
        $scope.myForm.targetCWT = _.clone(data.targetCWT);
        $scope.myForm.bid = _.clone(data.bid);
        $scope.myForm.acres = _.clone(data.acres);
        $scope.myForm.commodityId = _.clone(data.commodityId._id);
        $scope.getGrade($scope.myForm.commodityId, data.sampleAnalysis);
        if (data.growerId) {
          $scope.growerId = _.clone(data.growerId._id);
        }
        if (data.varietyId) {
          $scope.myForm.varietyId = _.clone(data.varietyId._id);
        }
        if (data.gradeId) {
          $scope.myForm.gradeId = _.clone(data.gradeId._id);
        }
        $scope.myForm.requestDate = moment(data.requestDate).format(
          "YYYY-MM-DD"
        );
        $scope.myForm.receiveDate = moment(data.receiveDate).format(
          "YYYY-MM-DD"
        );
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      } else if (type == "edit") {
        $scope.btnType = "Save Changes";
        $scope.myForm = _.clone(data);
        $scope.myForm.targetCWT = _.clone(data.targetCWT);
        $scope.myForm.bid = _.clone(data.bid);
        $scope.myForm.acres = _.clone(data.acres);
        if (data.growerId) {
          $scope.growerId = _.clone(data.growerId._id);
        }
        $scope.myForm.commodityId = _.clone(data.commodityId._id);
        $scope.getGrade($scope.myForm.commodityId, data.sampleAnalysis);
        if (data.varietyId) {
          $scope.myForm.varietyId = _.clone(data.varietyId._id);
        }
        if (data.gradeId) {
          $scope.myForm.gradeId = _.clone(data.gradeId._id);
        }
        $scope.myForm.requestDate = moment(data.requestDate).format(
          "YYYY-MM-DD"
        );
        $scope.myForm.receiveDate = moment(data.receiveDate).format(
          "YYYY-MM-DD"
        );
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        $scope.btnType = "Save";
        $(".add_coomm").fadeIn();
        $(".popup_overlay").fadeIn();
      }
    };
    $scope.closepop = function () {
      $(".add_coomm").fadeOut();
      $(".popup_overlay").fadeOut();
    };
    $(".popup_overlay , .close").click(function () {
      $(".add_coomm").fadeOut();
      $(".popup_overlay").fadeOut();
    });
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });
  });
