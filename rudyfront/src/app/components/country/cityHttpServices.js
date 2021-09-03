angular
  .module("myApp.cityHttpServices", [])
  .service("cityHttpServices", function(apiUrl, $http, $state, $rootScope) {
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
      addCity: function(data, token) {
        return $http
          .post(apiUrl + "city", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      updateCity: function(data, token) {
        return $http
          .put(apiUrl + "city", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      removeCity: function(data, token) {
        return $http
          .post(apiUrl + "city/delete", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      uploadCity: function(data, token) {
        var fd = new FormData();
        fd.append("file", data.filePath);
        return $http
          .post(apiUrl + "city/bulk?type=city", fd, {
            transformRequest: angular.identity,
            headers: {
              "Content-Type": undefined,
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getCity: function(pageNo, token) {
        return $http
          .get(apiUrl + "city?page=" + pageNo, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      getCityList: function(token) {
        return $http
          .get(apiUrl + "city", {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      searchCity: function(pageNo, search, token) {
        return $http
          .get(apiUrl + "city?page=" + pageNo + "&search=" + search, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      }
    };
  });
