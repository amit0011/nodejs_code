angular.module('myApp.shippingTermsHttpService', [])
    .service('shippingTermsHttpService', function(apiUrl, $http, $state, $rootScope) {
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
            addshippingTerms: function(data, token) {
                return $http.post(apiUrl + 'shippingTerms', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateshippingTerms: function(data, token) {
                return $http.put(apiUrl + 'shippingTerms', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeshippingTerms: function(data, token) {
                return $http.post(apiUrl + 'shippingTerms/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getshippingTerms: function(pageNo, token, portId) {
                return $http.get(apiUrl + 'shippingTerms?page=' + pageNo + '&portId=' + portId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });