angular.module('myApp.scaleTicketNumberHttpService', [])
    .service('scaleTicketNumberHttpService', function(apiUrl, $http, $state, $rootScope) {
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
            addscaleTicketNumber: function(data, token) {
                return $http.post(apiUrl + 'scaleTicketNumber', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updatescaleTicketNumber: function(data, token) {
                return $http.put(apiUrl + 'scaleTicketNumber', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removescaleTicketNumber: function(data, token) {
                return $http.post(apiUrl + 'scaleTicketNumber/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getscaleTicketNumber: function(token) {
                return $http.get(apiUrl + 'scaleTicketNumber', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });