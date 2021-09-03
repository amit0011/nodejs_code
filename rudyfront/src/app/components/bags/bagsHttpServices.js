angular
  .module("myApp.bagsHttpService", [])
  .service("bagsHttpService", function (apiUrl, $http, $rootScope, $state) {
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
      addbags: function (data, token) {
        return $http
          .post(apiUrl + "bags", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      updatebags: function (data, token) {
        return $http
          .put(apiUrl + "bags", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      removebags: function (data, token) {
        return $http
          .post(apiUrl + "bags/delete", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      uploadbags: function (data, token) {
        var fd = new FormData();
        fd.append("file", data.filePath);
        return $http
          .post(apiUrl + "bags/bulk?type=bags", fd, {
            transformRequest: angular.identity,
            headers: {
              "Content-Type": undefined,
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      getbags: function (pageNo, token) {
        return $http
          .get(apiUrl + "bags?page=" + pageNo, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      searchbags: function (pageNo, search, token) {
        return $http
          .get(apiUrl + "bags?page=" + pageNo + "&search=" + search, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      addBagInventory: function (data, token) {
        return $http
          .post(apiUrl + "bagInventory", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      downloadBagBalanceExcel: function (id, token) {
        return $http
          .post(
            apiUrl + "bagInventory/excel/bag-balance",
            { bagId: id },
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token,
                accept: "*",
                requestType: "blob",
              },
            }
          )
          .then(handleSuccess, handleError);
      },
      bagBalanceData: function (id, token) {
        return $http
          .get(apiUrl + "bag/report/balance/" + id, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      bagCategoryBalanceData: function (id, token) {
        return $http
          .get(apiUrl + "bag/category/report/balance/" + id, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      bagInventoryData: function (token) {
        return $http
          .get(apiUrl + "bag/report/inventory", {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      bagInventoryCategorizedData: function (token) {
        return $http
          .get(apiUrl + "bag/report/inventory/categorized", {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      udpateBagData: function (url, token) {
        return $http
          .post(
            apiUrl + url,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token,
              },
            }
          )
          .then(handleSuccess, handleError);
      },
      bagInventoryDetailMonthly: function (data, token) {
        return $http
          .get(
            apiUrl +
              `bag/bagInventory/${data.bagId}/monthlyDetail/${data.year}/${data.month}?type=${data.type}`,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token,
              },
            }
          )
          .then(handleSuccess, handleError);
      },
      bagInventoryCategorizedDetailMonthly: function (data, token) {
        return $http
          .get(
            apiUrl +
              `bag/bagInventory/${data.bagId}/monthlyDetail/${data.year}/${data.month}/categorized?type=${data.type}`,
            {
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token,
              },
            }
          )
          .then(handleSuccess, handleError);
      },
      addBagCategory: function (data, token) {
        return $http
          .post(apiUrl + "bag/category", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      updateBagCategory: function (data, token) {
        return $http
          .put(apiUrl + "bag/category", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      removeBagCategory: function (data, token) {
        return $http
          .post(apiUrl + "bag/category/delete", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
      getBagCategories: function (token, page, search) {
        return $http
          .get(apiUrl + "bag/category", {
            params: {page, search},
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          })
          .then(handleSuccess, handleError);
      },
    };
  });
