angular
  .module("myApp.growerMassReport", [])
  .controller("growerMassReportCtrl", function (
    $scope,
    $state,
    spinnerService,
    $rootScope,
    reportHttpServices,
    apiUrl,
    httpService,
    ckEditorService,
    commonService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.reports ||
        !data.reports.performance ||
        !data.reports.performance.view
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "groupEmail",
    };
    $scope.cropYears = commonService.cropYears();

    $scope.checkBoxForm = {
      checked: false,
    };

    $scope.emailform = {};

    $scope.page = 1;

    $scope.myForm = {};

    $scope.token = JSON.parse(localStorage.getItem("token"));

    httpService.getCommodity($scope.token).then(function (res) {
      $scope.commoditys = res.data.status == 200 ? res.data.data : [];
    });

    $scope.getList = (page) => {
      $scope.checkBoxForm = {
        checked: false,
      };
      spinnerService.show("html5spinner");
      $scope.page = page || $scope.page;
      $scope.myForm.page = $scope.page;
      reportHttpServices
        .massReport($scope.myForm, $scope.token)
        .then((objS) => {
          if (objS.data.status == 200) {
            $scope.list = objS.data.data;
          }
          spinnerService.hide("html5spinner");
        });
    };

    $scope.clear = () => {
      $scope.checkBoxForm = {
        checked: false,
      };
      $scope.myForm = {};
    };

    $scope.selectAll = () => {
      $scope.list.map((val) => (val.checked = !$scope.checkBoxForm.checked));
    };
    $scope.checkAllSelected = () => {
      var total = 0;
      $scope.list.forEach((val) => {
        if (val && val.checked) {
          total += 1;
        }
      });
      if (total == $scope.list.length) {
        $scope.checkBoxForm = {
          checked: true,
        };
      } else {
        $scope.checkBoxForm = {
          checked: false,
        };
      }
    };

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    }
    ckEditorService.showEditor();
    $scope.OpenMailPopUp = function () {
      var total = 0;
      $scope.growersEmails = [];
      $scope.list.forEach((val) => {
        if (val.growerId.email) {
          if (validateEmail(val.growerId.email)) {
            if (val && val.checked) {
              total += 1;
              if (
                $scope.growersEmails.indexOf(
                  val.growerId.email.toLowerCase()
                ) == -1
              ) {
                $scope.growersEmails.push(val.growerId.email.toLowerCase());
              }
            }
          }
        }
      });

      if (total > 0) {
        $scope.emailform = {
          subject: "",
          mailBody: "",
        };
        $scope.attachments = [];
        $scope.to = [];
        CKEDITOR.instances.ckeditor.setData("");
        $(".compose_mail").fadeIn();
        $(".popup_overlay").fadeIn();
      } else {
        swal("Info", "Please select grower", "info");
      }
    };
    $scope.closepop = function () {
      $(".compose_mail").fadeOut();
      $(".popup_overlay").fadeOut();
    };
    $("body").on("click", ".popup_overlay", function () {
      $scope.closepop();
    });

    $scope.sendMail = (valid) => {
      $scope.submitted = true;
      if (
        $scope.emailform.subject &&
        CKEDITOR.instances.ckeditor.getData() &&
        valid &&
        $scope.growersEmails.length &&
        $scope.to.length
      ) {
        var mailObj = {
          growersEmails: $scope.growersEmails,
          subject: $scope.emailform.subject,
          to: $scope.to,
          recordType: $scope.myForm.recordType,
          mailBody: CKEDITOR.instances.ckeditor.getData(),
          attachments: $scope.attachments,
        };
        $scope.emailSending = true;
        reportHttpServices.sendCompaign(mailObj, $scope.token).then(
          (objS) => {
            $scope.emailSending = false;
            if (objS.data.status == 200) {
              $scope.closepop();
              $scope.list.map((val) => (val.checked = false));
              $scope.checkBoxForm = {
                checked: false,
              };
            } else {
              swal("Error", objS.data.userMessage, "error");
            }
          },
          (objE) => {
            $scope.emailSending = false;
            swal("Error", objS.data.userMessage, "error");
          }
        );
      }
    };

    $scope.getBase64 = (input) => {
      angular.forEach(input.files, function (file, key) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
          var base64 = reader.result.replace(
            `data:${file.type.split("/")[0]}\/${
              file.type.split("/")[1]
            };base64,`,
            ""
          );
          $scope.$apply(function () {
            $scope.attachments.push({
              content: base64,
              filename: file.name,
              type: file.type,
              disposition: "attachment",
              contentId: key,
            });
          });
        };
        reader.onerror = function (error) {
          console.log("Error: ", error);
        };
      });
      angular.element("input[type='file']").val(null);
    };

    $scope.removeAttachment = (filename) => {
      $scope.attachments = $scope.attachments.filter(
        (val) => val.filename != filename
      );
    };
    $scope.addEmailInTo = () => {
      if (validateEmail($scope.emailform.to)) {
        if ($scope.to.indexOf($scope.emailform.to.toLowerCase()) != -1) {
          swal("Info", "Email already added in To", "info");
        } else if (
          $scope.growersEmails.indexOf($scope.emailform.to.toLowerCase()) != -1
        ) {
          swal("Info", "Email already added in BCC", "info");
        } else {
          $scope.to.push($scope.emailform.to.toLowerCase());
          $scope.emailform.to = "";
        }
      }
    };
    $scope.removeEmailFromTo = (index) => {
      $scope.to.splice(index, 1);
    };

    $scope.exportSheet = (data) => {
      var newData = $scope.list.map((v) => {
        return {
          Name: v.growerId.firstName + " " + v.growerId.lastName,
          Email: v.growerId.email,
          "Phone Number": v.growerI ? v.growerId.phone : "",
          "Commodity Name": v.commodityId ? v.commodityId.commodityName : "",
          "Contract Number": v.contractNumber,
          Street: v.growerId.addresses[0].street,
          City: v.growerId.addresses[0].town,
          Postal: v.growerId.addresses[0].postal,
          Province: v.growerId.addresses[0].province,
        };
      });
      var obj = {
        data: newData,
        fileName: moment().format("MM/DD/YYYY") + "_growerMassReport.xlsx",
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
