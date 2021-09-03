angular
  .module("myApp.freightHttpServices", [])
  .service("freightHttpServices", function(apiUrl, $http, $state, $rootScope) {
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
      addFreight: function(data, token) {
        return $http
          .post(apiUrl + "freight", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      updateFreight: function(data, token) {
        return $http
          .put(apiUrl + "freight", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      removeFreight: function(data, token) {
        return $http
          .post(apiUrl + "freight/delete", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getFreight: function(
        pageNo,
        token,
        portId,
        city,
        country,
        freightCompany,
        validity,
        onlyInvalid,
        limit
      ) {
        return $http
          .get(apiUrl + "freight", {
              params: {page: pageNo, portId, city, country, freightCompany, validity, onlyInvalid, limit},
              headers: {
                "Content-Type": "application/json",
                authorization: "Bearer " + token
              }
            }
          )
          .then(handleSuccess, handleError);
      },
      getCity: function(search, token) {
        return $http
          .get(apiUrl + "city?country=" + search, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getLoadingPort: function(token) {
        return $http
          .get(apiUrl + "loadingPort", {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getEquipment: function(loadingPortId, token) {
        return $http.get(apiUrl + "equipment?loadingPortId=" + loadingPortId, {
          headers: {
            "Content-Type": "application/json",
            authorization: "Bearer " + token
          }
        });
      },
      freightCompanyList: function(data, token) {
        return $http
          .post(apiUrl + "getFreightList", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },

      getFreightList: function(token, loadingPortId) {
        return $http
          .get(apiUrl + "freightlist?loadingPortId=" + loadingPortId, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      applyRateFactor: function(token, rateFactor) {
        return $http
          .post(apiUrl + "freight/applyRateFactor", {rateFactor}, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      revertRateFactor: function(token) {
        return $http
          .post(apiUrl + "freight/revertRateFactor", null, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      }
    };
  });
