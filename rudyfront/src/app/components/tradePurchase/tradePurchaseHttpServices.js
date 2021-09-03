angular.module('myApp.tradePurchaseHttpServices', [])
    .service('tradePurchaseHttpServices', function(apiUrl, $http, $state, $rootScope) {

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
            addtradePurchase: function(data, token) {
                return $http.post(apiUrl + 'tradePurchase', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removetradePurchase: function(data, token) {
                return $http.post(apiUrl + 'tradePurchase/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            reloadTradePurchaseWeight: function(contractNumber, token) {
              return $http.get(apiUrl + 'sync/tradesWeight/' + contractNumber, {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
            searchSaleContract: function(data, token) {
                return $http.post(apiUrl + 'tradePurchase/search', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchTradePurchaseContract: function(contractNumber, token) {
                return $http.get(apiUrl + 'tradePurchase/search', {
                    params: {contractNumber},
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTradePurchase: function(pageNo, token, limit) {
                return $http.get(apiUrl + 'tradePurchase?page=' + pageNo + '&&limit=' + limit, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTradePurchaseCount: function(id, commId, cropYear, token, contractYear) {
                return $http.get(apiUrl + 'tradePurchase/count?brokerId=' + id + '&commodityId=' + commId + '&cropYear=' + cropYear + '&contractYear=' + contractYear, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTradePurchaseDetails: function(tradeId, token) {
                return $http.get(apiUrl + 'tradePurchase/getTradePurchaseDetails/?tradeId=' + tradeId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            uploadPdf: function(file, contractId, token) {
                var fd = new FormData();
                fd.append('file', file.file);
                return $http.put(apiUrl + 'tradePurchase/uploadPdf?contractId=' + contractId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(handleSuccess, handleError);
            },
            removeSignedContract: function(id, token) {
                return $http.put(apiUrl + 'tradePurchase/removeSignedContract?id=' + id, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            changeTradePurchaseContractStatus: function(data, token) {
                return $http.post(apiUrl + 'changeTradePurchaseContractStatus', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateTradePurchaseStamp: function(data, token) {
                return $http.post(apiUrl + 'updateTradePurchaseStamp', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
        };
    });
