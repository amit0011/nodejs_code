angular.module('myApp.brokerHttpService', [])
    .service('brokerHttpService', function(apiUrl, $http, $state, $rootScope) {
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

            addBroker: function(data, token) {
                return $http.post(apiUrl + 'broker', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateBroker: function(data, token) {
                return $http.put(apiUrl + 'broker', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBroker: function(pageNo, token) {
                return $http.get(apiUrl + 'broker/bulk?page=' + pageNo, {
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            // getBrokerSearch: function(pageNo, search, token) {
            // 	return $http.get(apiUrl + 'broker/bulk?page=' + pageNo + '&search=' + search, {
            // 		headers: {
            // 			'Content-Type': undefined,
            // 			'authorization': "Bearer " + token
            // 		}
            // 	}).then(handleSuccess, handleError);
            // },
            uploadBroker: function(data, token) {
                var fd = new FormData();
                fd.append('file', data.filePath);
                return $http.post(apiUrl + 'broker/bulk?type=broker', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeBroker: function(data, token) {
                return $http.post(apiUrl + 'broker/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBrokerDetails: function(id, token) {
                return $http.get(apiUrl + 'broker/bulk?brokerId=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBrokerSearch: function(pageNo, data, token) {
                return $http.post(apiUrl + 'broker/search?page=' + pageNo, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getPurchaseConfirmation: function(id, token) {
                return $http.get(apiUrl + 'purchase/confirmation?growerId=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getsalesContract: function(brokerId, token) {
                return $http.get(apiUrl + 'salesContract?brokerId=' + brokerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addEmployees: function(data, token) {
                return $http.post(apiUrl + 'employees', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateEmployees: function(data, token) {
                return $http.put(apiUrl + 'employees', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeEmployees: function(data, token) {
                return $http.post(apiUrl + 'employees/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getEmployees: function(pageNo, brokerId, token) {
                return $http.get(apiUrl + 'employee?page=' + pageNo + '&brokerId=' + brokerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
        };
    });