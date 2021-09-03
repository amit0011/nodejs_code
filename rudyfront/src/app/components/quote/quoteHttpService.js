angular.module('myApp.quoteHttpService', [])
    .service('quoteHttpService', function(apiUrl, $http, $state, $rootScope) {

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
            addquote: function(data, token) {
                return $http.post(apiUrl + 'quote', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updatequote: function(data, token) {
                return $http.put(apiUrl + 'quote', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removequote: function(data, token) {
                return $http.post(apiUrl + 'quote/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getquote: function(token, userId, type) {
                return $http.get(apiUrl + 'quote?userId=' + userId + '&&type=' + type, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getCommodityPrice: function(data, token) {
                return $http.post(apiUrl + 'commodity/pricing', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getCommodityFromCommodityPrices: function(token) {
                return $http.get(apiUrl + '/commodityList', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            gradesByCommodity: function(id, token) {
                return $http.get(apiUrl + 'gradesByCommodity?commodityId=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getFreightDetails: function(data, token) {
                return $http.post(apiUrl + 'freight/filter', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getPreviousQuote: function(buyerId, token) {
                return $http.get(apiUrl + 'previousQuote?buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getQuotesDetails: function(data, token) {
                return $http.get(apiUrl + 'getQuotesDetails?userId=' + data.userId + '&&type=' + data.type, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            quoteDetail: function(quoteId, token) {
                return $http.get(apiUrl + 'quoteDetail?quoteId=' + quoteId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });