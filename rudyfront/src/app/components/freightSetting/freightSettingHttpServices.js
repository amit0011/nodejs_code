angular.module('myApp.freightSettingHttpService', [])
    .service('freightSettingHttpService', function(apiUrl, $http, $state, $rootScope) {
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
            addfreightSetting: function(data, token) {
                return $http.post(apiUrl + 'freightSetting', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updatefreightSetting: function(data, token) {
                return $http.put(apiUrl + 'freightSetting', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removefreightSetting: function(data, token) {
                return $http.post(apiUrl + 'freightSetting/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            uploadfreightSetting: function(data, token) {
                var fd = new FormData();
                fd.append('file', data.filePath);
                return $http.post(apiUrl + 'freightSetting/bulk?type=freightSetting', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getfreightSetting: function(pageNo, token) {
                return $http.get(apiUrl + 'freightSetting?page=' + pageNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchfreightSetting: function(pageNo, search, token) {
                return $http.get(apiUrl + 'freightSetting?page=' + pageNo + '&search=' + search, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addFreightNote: function(data, token) {
                return $http.post(apiUrl + 'freightSetting/note', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getFreightNote: function(token) {
                return $http.get(apiUrl + 'freightSetting/note', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
        };
    });