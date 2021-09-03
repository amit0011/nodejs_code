angular
  .module("myApp.reportHttpServices", [])
  .service("reportHttpServices", function(apiUrl, $http, $state, $rootScope) {
    function handleSuccess(res) {
      if (res.data.status == 401) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("Here's a message!", res.data.userMessage, "error");
      }
      return res;
    }

    function handleError(res) {
      return res;
    }

    return {
      getPurchaseReport: function(data, token) {
        return $http
          .post(apiUrl + "purchase", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getProductReport: function(data, token) {
        return $http
          .post(apiUrl + "production", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getPositionReport: function(commodityId, year, inventoryGrade, token) {
        return $http
          .get(
            apiUrl +
              "production?commodityId=" +
              commodityId +
              "&&year=" +
              year +
              "&&inventoryGrade=" +
              inventoryGrade,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      getPositionSalesReport: function(
        commodityId,
        year,
        inventoryGrade,
        token
      ) {
        return $http
          .get(
            apiUrl +
              "salesContract/report?commodityId=" +
              commodityId +
              "&&cropYear=" +
              year +
              "&&inventoryGrade=" +
              inventoryGrade,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      loadUsdPurchases: function(cropYear, token) {
        return $http.get(apiUrl + "purchase/usdPurchases", {
          params: {cropYear},
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token
          }
        })
      },
      getSalesSummaryReport: function(year, token) {
        return $http
          .get(apiUrl + "position-report/summary?year=" + year, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      areaReport: function(data, token) {
        return $http
          .post(apiUrl + "grower/areaReport", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      outstandingPurchaseReport: function(data, token) {
        var query = Object.keys(data)
          .map(
            key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
          )
          .join("&");
        return $http
          .get(apiUrl + "purchase/outstandingPurchaseReport?" + query, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      outstandingSalesReport: function(data, token) {
        var query = Object.keys(data)
          .map(
            key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
          )
          .join("&");
        return $http
          .get(apiUrl + "sales/outstandingSalesReport?" + query, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      updateOutstandingSalesReport: function(data, token) {
        return $http.put(apiUrl + "sales/outstandingSalesReport", data, {
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token
          }
        });
      },
      performanceReport: function(fromDate, toDate, token) {
        return $http
          .get(
            apiUrl +
              "admin/performanceReport?fromDate=" +
              fromDate +
              "&&toDate=" +
              toDate,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      phoneListByUser: function(adminId, page, token, data) {
        return $http
          .get(
            apiUrl +
              "phone/phoneListByUser?adminId=" +
              adminId +
              "&&page=" +
              page +
              "&&fromDate=" +
              data.fromDate +
              "&&toDate=" +
              data.toDate,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      salesContractListByUser: function(adminId, page, token, data) {
        return $http
          .get(
            apiUrl +
              "sales/salesContractListByUser?adminId=" +
              adminId +
              "&&page=" +
              page +
              "&&fromDate=" +
              data.fromDate +
              "&&toDate=" +
              data.toDate,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      getPurchaseConfirmation: function(adminId, page, token, data) {
        return $http
          .get(
            apiUrl +
              "purchase/purchaseConfirmationListByUser?adminId=" +
              adminId +
              "&&page=" +
              page +
              "&&fromDate=" +
              data.fromDate +
              "&&toDate=" +
              data.toDate,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },

      getProductionContract: function(adminId, page, token, data) {
        return $http
          .get(
            apiUrl +
              "production/productionContractListByUser",
            {
              params: {...data, adminId, page},
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      getProductionRecord: function(adminId, page, token, data) {
        return $http
          .get(
            apiUrl +
              "sample/productionRecordListByUser",
            {
              params: {...data, adminId, page},
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      massReport: function(data, token) {
        return $http
          .post(apiUrl + "grower/massReport", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      updateScaleActualData: function(data, token) {
        return $http
          .put(apiUrl + "scale/freightVariance", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      sendCompaign: function(data, token) {
        return $http
          .post(apiUrl + "compaign/add", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      usdPurchasesContracts: function(cropYear, token) {
        return $http
          .get(apiUrl + "purchase/usdPurchasesContracts", {
            params: {cropYear: cropYear},
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      targetPriceReport: function(data, token) {
        return $http
          .post(apiUrl + "sample/targetPriceReport", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      fxHedgeReport: function(year, token) {
        return $http
          .get(apiUrl + "fxHedgeReport", {
            params: {year},
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      packagingReport: function(data, token) {
        return $http
          .post(apiUrl + "scale/packagingReport", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      refreshPositionReport: function(data, token) {
        return $http
          .post(apiUrl + "position-report/refresh", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      commissionPayableReport: function(data, token) {
        return $http
          .post(apiUrl + "sales/commission", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      failedQuotesReport: function(data, token) {
        return $http
          .get(apiUrl + "failedQuotes", {
            params: data,
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      freightVarianceReport: function(data, token) {
        return $http
          .get(apiUrl + "scale/freightVariance", {
            params: data,
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      shippedWeightAnalysisReport: function(data, token) {
        return $http
          .post(apiUrl + "scale/shippedWeightAnalysis", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },

      getGrowerCallBack: function(token, page) {
        return $http
          .get(apiUrl + "grower/growerCallBackList?page=" + page, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },

      //get grower callback show in dashboard

      getGrowerLatestCallBack: function(token, data) {
        return $http
          .get(apiUrl + "grower/getLatestgrowerCallBack?lastEditedBy=" + data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },

      getGrowerCallBackSearch: function(page, token, data) {
        return $http
          .get(
            apiUrl +
              "grower/growerCallBackList?page=" +
              page +
              "&lastEditedBy=" +
              data,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },

      commodityMonthlyAdjustment: function(data, token) {
        return $http
          .post(apiUrl + "commodityAdjustment", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
    };
  });
