angular
  .module("myApp.containerHttpServices", [])
  .service("containerHttpServices", function(apiUrl, $http, $state, $rootScope) {
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
      addContainer: function(data, token) {
        return $http
          .post(apiUrl + "containerInventory", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      updateContainer: function(data, token) {
        return $http
          .put(apiUrl + "containerInventory", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      removeContainer: function(data, token) {
        return $http
          .post(apiUrl + "containerInventory/delete", data, {
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      },
      searchContainer: function(data, token) {
        return $http
          .get(apiUrl + "containerInventory", {
            params: data,
            headers: {
              "Content-Type": "application/json",
              authorization: "Bearer " + token
            }
          })
          .then(handleSuccess, handleError);
      }
    };
  });
