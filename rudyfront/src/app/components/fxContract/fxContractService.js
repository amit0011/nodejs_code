angular
    .module('myApp.fxContractService', [])
    .service('fxContractService', function(apiUrl, $http, $state, $rootScope) {

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
            list: function(data, page, token) {
                var query = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');
                return $http.get(apiUrl + 'fx_Contract?page=' + page + '&'+query, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addOrUpdate: function(data, token) {
                return $http.post(apiUrl + 'fx_Contract', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            noteList: function(contractId, token) {
                return $http.get(apiUrl + 'fxContractNote?contractId=' + contractId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addNote: function(data, token) {
                return $http.post(apiUrl + 'fxContractNote', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
        };
    });