angular.module('myApp.jsonService', [])
    .service('jsonService', function(apiUrl, $http, $state, $rootScope) {
        var baseUrl = apiUrl;

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
            getTownList: function(token) {
                return $http.get(baseUrl + 'town', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                })
                .then(handleSuccess, handleError);
            }
        };
    });