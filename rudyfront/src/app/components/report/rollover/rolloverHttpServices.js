angular.module('myApp.rolloverHttpServices', [])
    .service('rolloverHttpServices', function(apiUrl, $http, $state, $rootScope) {

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
            getProductionRolloverList: function(data, token) {
                const query = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
                
                return $http.get(apiUrl + 'production/rollover?' + query, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getPurchaseRolloverList: function(data, token) {
                const query = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
                
                return $http.get(apiUrl + 'purchase/rollover?' + query, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }, 

            getSalesRolloverList: function(data, token) {
                const query = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
                
                return $http.get(apiUrl + 'sales/rollover?' + query, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }, 
            
        };
    });