angular
  .module("myApp.countryHttpService", [])
  .service("countryHttpService", function(apiUrl, $http, $state, $rootScope) {
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
      addCountry: function(data, token) {
        return $http
          .post(apiUrl + "country", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      updateCountry: function(data, token) {
        return $http
          .put(apiUrl + "country", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      removeCountry: function(data, token) {
        return $http
          .post(apiUrl + "country/delete", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      uploadCountry: function(data, token) {
        var fd = new FormData();
        fd.append("file", data.filePath);
        return $http
          .post(apiUrl + "country/bulk?type=country", fd, {
            transformRequest: angular.identity,
            headers: {
              "Content-Type": undefined,
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getCountry: function(pageNo, token) {
        return $http
          .get(apiUrl + "country?page=" + pageNo, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getCountryList: function(token) {
        return $http
          .get(apiUrl + "country", {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      searchCountry: function(pageNo, search, token) {
        return $http
          .get(apiUrl + "country?page=" + pageNo + "&search=" + search, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      }
    };
  });
