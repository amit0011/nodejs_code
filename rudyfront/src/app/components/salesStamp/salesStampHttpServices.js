angular.module('myApp.salesStampHttpServices', [])
    .service('salesStampHttpServices', function(apiUrl, $http, $state, $rootScope) {

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
            getsalesContract: function(pageNo, token) {
                return $http.get(apiUrl + 'salesContract', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getCommodityPricing: function(commodityId, gradeId, cropYear, token) {
                return $http.get(apiUrl + 'commodityPricing?commodityId=' + commodityId + '&gradeId=' + gradeId + '&cropYear=' + cropYear, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });