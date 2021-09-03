angular.module('myApp.sudAdminHttpService', [])
    .service('sudAdminHttpService', function(apiUrl, $http, $state, $rootScope) {
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
            addadmin: function(data, token) {
                return $http.post(apiUrl + 'admin/subadmin', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            checkUsername: function(username, token) {
                return $http.get(apiUrl + 'username?username=' + username, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateadmin: function(data, token) {
                return $http.put(apiUrl + 'admin/subadmin', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeadmin: function(data, token) {
                return $http.post(apiUrl + 'admin/subadmin/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getadmin: function(pageNo, token, list) {
                return $http.get(apiUrl + 'admin/subadmin?list=' + list, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getGrainBuyer: function(type, role, token) {
                return $http.get(apiUrl + 'admin/subadmin?type=' + type + '&role=' + role, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchadmin: function(pageNo, search, token) {
                return $http.get(apiUrl + 'admin/subadmin', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getreceiver: function(pageNo, token, type) {
                return $http.get(apiUrl + 'admin/receiver?type=' + type, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeReceiver: function(data, token, type) {
                return $http.post(apiUrl + 'admin/receiver', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            uploadImage: function(data, token) {
                var fd = new FormData();
                fd.append('avatar', data.avatar);
                return $http.post(apiUrl + 'upload', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateAccess: function(data, token) {
                return $http.post(apiUrl + 'admin/access', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getAccess: function(id, token) {
                return $http.get(apiUrl + 'admin/access?id=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });