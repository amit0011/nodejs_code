angular.module('myApp.salesContractHttpServices', [])
    .service('salesContractHttpServices', function(apiUrl, $http, $state, $rootScope) {

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
            addsalesContract: function(data, token) {
                return $http.post(apiUrl + 'salesContract', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateSalesStamp: function(data, token) {
                return $http.post(apiUrl + 'updateSalesStamp', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updatesalesContract: function(data, token) {
                return $http.put(apiUrl + 'salesContract', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removesalesContract: function(data, token) {
                return $http.post(apiUrl + 'salesContract/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchSaleContract: function(data, token) {
                return $http.post(apiUrl + 'salesContract/search', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            reloadSaleContractWeight: function(contractNumber, token) {
              return $http.get(apiUrl + 'sync/salesWeight/' + contractNumber, {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
            getsalesContract: function(pageNo, token, limit) {
                return $http.get(apiUrl + 'salesContract?page=' + pageNo + '&getSum=true&status=0&limit=' + limit, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getsalesContractCount: function(id, commId, cropYear, token, contractYear) {
                return $http.get(apiUrl + 'salesContract/count?brokerId=' + id + '&commodityId=' + commId + '&cropYear=' + cropYear + '&contractYear=' + contractYear, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getsalesContractDetails: function(contractNumber, token, buyerId) {
                return $http.get(apiUrl + 'salesContract/' + contractNumber + '/contract?buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            generatesalesContractId: function(token) {
                return $http.get(apiUrl + 'salesContract/ticket', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            changeVerifyStatus: function(data, token) {
                return $http.post(apiUrl + 'salesContract/verify', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            uploadPdf: function(data, contractId, token) {
              console.log(data);
                var fd = new FormData();
                fd.append('file', data.file);
                fd.append('brokerNote', data.brokerNote);
                return $http.put(apiUrl + 'sales/uploadPdf?contractId=' + contractId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(handleSuccess, handleError);
            },
            removeSignedContract: function(id, token) {
                return $http.put(apiUrl + 'salesContract/removeSignedContract?id=' + id, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            changeSalesContractStatus: function(data, token) {
                return $http.post(apiUrl + 'updateSalesContractStatus', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            salesSummary: function( data, token) {
                var query = Object.keys(data).map(function(k) { return `${encodeURIComponent(k)}=${encodeURIComponent(data[k])}`; }).join('&');
                return $http.get(apiUrl + `sales/salesSummary?${query}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            forexReport: function(contractNumber, cropYear, accountingCompleted, token) {
                return $http.get(apiUrl + 'sales/forexReport', {
                    params: { contractNumber, cropYear, accountingCompleted },
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateForexPayment: function(data, token) {
                return $http.post(apiUrl + 'sales/updateForexPayment', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getLatestSalesContract: function(token) {
                return $http.get(apiUrl + 'sales/getLatestSalesContract', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getAmendedSalesContract: function(token, page) {
                return $http.get(apiUrl + 'sales/getAmendedSalesContract', {
                    params: {page},
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            salesHistory: function(contractNumber, token) {
                return $http.get(apiUrl + `sales/salesHistory?contractNumber=${contractNumber}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });
