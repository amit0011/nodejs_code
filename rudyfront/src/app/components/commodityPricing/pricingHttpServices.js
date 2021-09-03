angular.module('myApp.pricingHttpServices', [])
    .service('pricingHttpServices', function(apiUrl, $http, $state, $rootScope) {
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
            addCommodityPricing: function(data, token) {
                return $http.post(apiUrl + 'commodityPricing', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateCommodityPricing: function(data, token) {
                return $http.put(apiUrl + 'commodityPricing', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeCommodityPricing: function(data, token) {
                return $http.post(apiUrl + 'commodityPricing/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            applyDefault: function (data, token) {
              return $http.put(apiUrl + 'commodityPricing/applyDefault', data, {
                headers: {
                  'Content-Type': 'application/json',
                  'authorization': "Bearer " + token
                }
              }).then(handleSuccess, handleError);
            },
            getCommodityPricing: function(pageNo, token, search) {
                var searchQuery = '';
                if (search) {
                    if (search.commodityId) {
                        searchQuery = '&commodityId='+search.commodityId;
                    }
                }
                return $http.get(apiUrl + 'commodityPricing?page=' + pageNo+ searchQuery, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTargetFOB: function(token, commodityId, gradeId, cropYear) {
                return $http
                    .get(apiUrl + "commodityPricing/netFob?commodityId=" + commodityId + "&gradeId=" + gradeId + "&cropYear=" + cropYear, {
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': "Bearer " + token
                        }
                    }).then(handleSuccess, handleError);
            }
        };
    });
