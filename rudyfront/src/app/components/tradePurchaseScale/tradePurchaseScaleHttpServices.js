angular.module('myApp.tradePurchaseScaleHttpServices', [])
    .service('tradePurchaseScaleHttpServices', function(apiUrl, $http, $state, $rootScope) {

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
            getContractList: function(buyerId, commodityId, token, excludeSales) {
                return $http.get(apiUrl + 'tradePurchaseScale/getContractList', {
                    params: {buyerId: buyerId, commodityId: commodityId, excludeSales},
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            generateTicketNumber: function(token) {
                return $http.get(apiUrl + 'tradePurchaseScale/generateTicketNumber', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addTradePurchaseScale: function(data, token) {
                return $http.post(apiUrl + 'tradePurchaseScale/addTradePurchaseScale', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateTradePurchaseScale: function(data, token) {
                return $http.post(apiUrl + 'tradePurchaseScale/updateTradePurchaseScale', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getAllTradePurchaseList: function(buyerId, token) {
                return $http.get(apiUrl + 'tradePurchaseScale/getAllTradePurchaseList?buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchTradePurchaseScale: function(data, page, token) {
                return $http.put(apiUrl + 'tradePurchaseScale/searchTradePurchaseScale?page=' + page, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getScaleTicketDetails: function(_id, token) {
                return $http.get(apiUrl + 'tradePurchaseScale/getScaleTicketDetails?_id=' + _id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTradeScalePdf: function(_id, token) {
                return $http.get(apiUrl + 'tradePurchaseScale/getTradeScalePdf?_id=' + _id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            unlockTicket: function(_id, token) {
                return $http.get(apiUrl + 'tradePurchaseScale/unlockTicket?_id=' + _id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            uploadPdf: function(file, scaleId, token) {
                var fd = new FormData();
                fd.append('file', file.file);
                return $http.put(apiUrl + 'tradePurchaseScale/uploadPdf?scaleId=' + scaleId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(handleSuccess, handleError);
            },
            removeSignedContract: function(scaleId, token) {
                return $http.put(apiUrl + 'tradePurchaseScale/removeSignedContract?scaleId=' + scaleId, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            loadSheetsByContract: function(data, token) {
                var cropYear = data.rollover == 0 ? '' : data.cropYear;
                return $http.get(apiUrl + 'tradePurchaseScale/ticketList?contractNumber=' + data.contractNumber + '&cropYear=' + cropYear, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
        };
    });
