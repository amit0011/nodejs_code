angular.module('myApp.bidSheetHttpService', [])
    .service('bidSheetHttpService', function(apiUrl, $http, $state, $rootScope) {


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
            addBidsheet: function(data, token) {
                return $http.post(apiUrl + 'bidsheet', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateBidsheet: function(data, token) {
                return $http.put(apiUrl + 'bidsheet/', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateBidPeriod: function(data, token) {
                return $http.put(apiUrl + 'bidsheet/period', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeBidsheet: function(data, token) {
                return $http.post(apiUrl + 'bidsheet/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBidsheet: function(pageNo, token) {
                return $http.get(apiUrl + 'bidsheet?page=' + pageNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchBidsheet: function(pageNo, search, token) {
                return $http.get(apiUrl + 'bidsheet?page=' + pageNo + '&search=' + search, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });