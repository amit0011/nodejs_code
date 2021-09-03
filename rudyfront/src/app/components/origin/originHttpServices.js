angular.module('myApp.originHttpService', [])
    .service('originHttpService', function(apiUrl, $http, $state, $rootScope) {
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
            addOrigin: function(data, token) {
                return $http.post(apiUrl + 'origin', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateOrigin: function(data, token) {
                return $http.put(apiUrl + 'origin', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeOrigin: function(data, token) {
                return $http.post(apiUrl + 'origin/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getOrigin: function(pageNo, token) {
                return $http.get(apiUrl + 'origin?page=' + pageNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getOriginList: function(token) {
                return $http.get(apiUrl + 'origin', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchOrigin: function(pageNo, search, token) {
                return $http.get(apiUrl + 'origin?page=' + pageNo + '&search=' + search, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });