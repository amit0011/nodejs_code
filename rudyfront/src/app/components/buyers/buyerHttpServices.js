angular.module('myApp.buyerHttpServices', [])
    .service('buyerHttpServices', function(apiUrl, $http, $state, $rootScope) {
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
            //rajeev add address request
            addBuyerAddress: function(data, token) {
                return $http.post(apiUrl + 'buyer/addBuyerAddress', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            
            
            removeBuyerAddress: function(data, token) {
                return $http.post(apiUrl + 'buyer/removeBuyerAddress', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            setDefaultBuyerAddress: function(data, token) {
                return $http.post(apiUrl + 'buyer/setDefaultBuyerAddress', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            editAddresssave: function(data,buyerId, token) {
                return $http.post(apiUrl + 'buyer/editAddresssave/'+buyerId, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            //end rajeev 

            addBuyer: function(data, token) {
                return $http.post(apiUrl + 'buyer', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateBuyer: function(data, token) {
                return $http.put(apiUrl + 'buyer', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBuyer: function(pageNo, token) {
                return $http.get(apiUrl + 'buyer/bulk?page=' + pageNo, {
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            // getBuyerSearch: function(pageNo, search, token) {
            // 	return $http.get(apiUrl + 'buyer/bulk?page=' + pageNo + '&search=' + search, {
            // 		headers: {
            // 			'Content-Type': undefined,
            // 			'authorization': "Bearer " + token
            // 		}
            // 	}).then(handleSuccess, handleError);
            // },
            uploadBuyer: function(data, token) {
                var fd = new FormData();
                fd.append('file', data.filePath);
                return $http.post(apiUrl + 'buyer/bulk', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeBuyer: function(data, token) {
                return $http.post(apiUrl + 'buyer/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBuyerDetails: function(id, token) {
                return $http.get(apiUrl + 'buyer/bulk?buyerId=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBuyerList: function(id, token) {
                return $http.get(apiUrl + 'buyer/Listt?buyerId=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBuyerSearch: function(pageNo, data, token) {
                return $http.post(apiUrl + 'buyer/search?page=' + pageNo, data, {
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
            getEmployees: function(pageNo, buyerId, token) {
                return $http.get(apiUrl + 'employees?page=' + pageNo + '&buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getsalesContract: function(buyerId, token) {
                return $http.get(apiUrl + 'salesContract?buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getsalesContractByBuyer: function(buyerId, token) {
                return $http.get(apiUrl + 'getsalesContractByBuyer?buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTradePurchaseList: function(buyerId, token) {
                return $http.get(apiUrl + 'getTradePurchaseList?buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            assignUser: function(data, token) {
                return $http.post(apiUrl + '/buyer/assignUser', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });