angular.module('myApp.certificateCostHttpService', [])
    .service('certificateCostHttpService', function(apiUrl, $http, $state, $rootScope) {

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
            addcertificateCost: function(data, token) {
                return $http.post(apiUrl + 'certificateCost', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updatecertificateCost: function(data, token) {
                return $http.put(apiUrl + 'certificateCost', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removecertificateCost: function(data, token) {
                return $http.post(apiUrl + 'certificateCost/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getcertificateCost: function(pageNo, token) {
                return $http.get(apiUrl + 'certificateCost?page=' + pageNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchcertificateCost: function(pageNo, search, token) {
                return $http.get(apiUrl + 'certificateCost?page=' + pageNo + '&search=' + search, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });