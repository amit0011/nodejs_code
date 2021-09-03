angular.module('myApp.freightCompanyHttpServices', [])
    .service('freightCompanyHttpServices', function(apiUrl, $http, $state, $rootScope) {
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
            addFreightCompany: function(data, token) {
                return $http.post(apiUrl + 'freightCompany', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateFreightCompany: function(data, token) {
                return $http.put(apiUrl + 'freightCompany', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeFreightCompany: function(data, token) {
                return $http.post(apiUrl + 'freightCompany/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getFreightCompany: function(pageNo, token, stuffers) {
                return $http.get(apiUrl + 'freightCompany?page=' + pageNo + '&stuffers=' + stuffers, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });