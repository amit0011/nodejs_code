angular.module('myApp.maxWeightHttpService', [])
    .service('maxWeightHttpService', function(apiUrl, $http, $state, $rootScope) {

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
            addMaxWeight: function(data, token) {
                return $http.post(apiUrl + 'max-weight', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateMaxWeight: function(id, data, token) {
                return $http.put(apiUrl + 'max-weight?_id=' + id, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getMaxWeight: function(page, searchBy, token) {
                return $http.get(apiUrl + 'max-weight?page=' + page + '&&searchBy=' + searchBy, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            allMaxWeight: function(token) {
                return $http.get(apiUrl + 'max-weight', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });
