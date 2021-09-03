angular.module('myApp.shiplineHttpServices', [])
    .service('shiplineHttpServices', function(apiUrl, $http, $state, $rootScope) {
        function handleSuccess(res) {
            if (res.data.status == 401) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("Here's a message!", res.data.userMessage, "error");
            }
            return res;
        }

        function handleError(res) {
            return res;
        }
        return {
            addshipline: function(data, token) {
                return $http.post(apiUrl + 'shipline', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateshipline: function(data, token) {
                return $http.put(apiUrl + 'shipline', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeshipline: function(data, token) {
                return $http.post(apiUrl + 'shipline/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getshipline: function(pageNo, freightCompanyId, token) {
                return $http.get(apiUrl + 'shipline?page=' + pageNo + '&freightCompanyId=' + freightCompanyId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });