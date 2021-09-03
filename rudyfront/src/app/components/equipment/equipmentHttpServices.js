angular.module('myApp.equipmentHttpService', [])
    .service('equipmentHttpService', function(apiUrl, $http, $state, $rootScope) {

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
            addEquipment: function(data, token) {
                return $http.post(apiUrl + 'equipment', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateEquipment: function(data, token) {
                return $http.put(apiUrl + 'equipment', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeEquipment: function(data, token) {
                return $http.post(apiUrl + 'equipment/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getEquipment: function(pageNo, token, loadingPortId) {
                return $http.get(apiUrl + 'equipment?page=' + pageNo + '&loadingPortId=' + loadingPortId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getInlandEquipmentTypes: function(token, loadingPortId) {
                return $http.get(apiUrl + 'equipmentType/inland?loadingPortId=' + loadingPortId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            searchEquipment: function(pageNo, search, token) {
                return $http.get(apiUrl + 'equipment?page=' + pageNo + '&search=' + search, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            }
        };
    });