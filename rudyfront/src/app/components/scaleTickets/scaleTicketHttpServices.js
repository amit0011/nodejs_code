angular.module('myApp.scaleTicketHttpServices', [])
    .service('scaleTicketHttpServices', function(apiUrl, $http, $state, $rootScope) {
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
            addScaleTicket: function(data, token) {
                return $http.post(apiUrl + 'scale', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateScaleTicket: function(data, token) {
                return $http.put(apiUrl + 'scale', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeScaleTicket: function(data, token) {
                return $http.post(apiUrl + 'scale/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getScaleTicket: function(pageNo, type, token, limit, buyerId) {
                return $http.get(apiUrl + 'scale?page=' + pageNo + '&type=' + type + '&limit=' + limit + '&buyerId=' + buyerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getScaleTicketDetails: function(ticketNumber, token) {
                return $http.get(apiUrl + 'scale?ticketNumber=' + ticketNumber, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getScaleTicketUsingGrowerId: function(growerId, token) {
                return $http.get(apiUrl + 'scale?growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            generateScaleTicketId: function(data, token, type) {
                return $http.post(apiUrl + 'scale/ticket?type=' + type, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTrucker: function(token) {
                return $http.get(apiUrl + 'trucker', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getGrowerList: function(token) {
                return $http.get(apiUrl + 'grower', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getTrackWeight: function(token) {
                return $http.get(apiUrl + 'track/weight', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchScaleTicket: function(data, page, token) {
                return $http.post(apiUrl + 'scale/search?page=' + page, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            exportIncomingScaleTicket: function(data, token) {
                return $http.post(apiUrl + 'scale/incomingExcelDownload' , data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            exportOutgoingScaleTicket: function(data, token) {
                return $http.post(apiUrl + 'scale/outgoingExcelDownload' , data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getGrowerListByCommodity: function(growerId, commodityId, token) {
                return $http.get(apiUrl + 'grower/list', {
                    params: {growerId: growerId, commodityId: commodityId},
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBuyerListByCommodity: function(buyerId, commodityId, token) {
                return $http.get(apiUrl + 'buyer/list', {
                    params: {buyerId: buyerId, commodityId: commodityId},
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getBuyersByCommodityHaveTrade: function(buyerId, commodityId, token) {
                return $http.get(apiUrl + 'buyer/list', {
                    params: {buyerId: buyerId, commodityId: commodityId, havingTrades: true},
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getContractListByCommodity: function(data, token) {
                return $http.post(apiUrl + 'grower/list', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getSalesContractListByCommodity: function(data, token) {
                return $http.post(apiUrl + 'buyer/list', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getsalesContract: function(contractNo, token) {
                return $http.get(apiUrl + 'salesContract/search?contractNo=' + contractNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getScaleTicketNumber: function(type, token) {
                return $http.get(apiUrl + 'scale/ticket?type=' + type, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateMailColor: function(data, token) {
                return $http.post(apiUrl + 'scale/mail', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            unlockTicket: function(_id, obj, token) {
                return $http.put(apiUrl + 'scale/unlockTicket?_id=' + _id, obj, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            generateBillOfLading: function(_id, token) {
                return $http.get(apiUrl + 'scale/generateBillOfLading/' + _id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getProductionContractList: function(commodityId, growerId, token) {
                return $http.get(apiUrl + 'production/getProductionContractList?commodityId=' + commodityId + '&&growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getLatestIncomingTicket: function(token) {
                return $http.get(apiUrl + 'scale/getLatestIncomingTicket', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getLatestOutgoingTicket: function(token) {
                return $http.get(apiUrl + 'scale/getLatestOutgoingTicket', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            ticketList: function(data, token) {
                const cropYear = data.rollover == 0 ? '' : data.cropYear;
                return $http.get(apiUrl + 'scale/ticketList?contract=' + data.contractNumber + '&cropYear=' + cropYear + '&seqNo=' + data.seqNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            tradeTicketList: function(data, token) {
                var cropYear = data.rollover == 0 ? '' : data.cropYear;
                return $http.get(apiUrl + 'tradePurchaseScale/ticketList?salesContractNumber=' + data.contractNumber + '&cropYear=' + cropYear + '&seqNo=' + data.seqNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            sendTicketMail: function(data, token) {
                return $http.post(apiUrl + 'scale/sendTicketMail', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            scaleHistory: function(scaleId, token) {
                return $http.get(apiUrl + 'scale/scaleHistory?scaleId=' + scaleId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            scaleOutgoingHistory: function(scaleId, token) {
                return $http.get(apiUrl + 'scale/scaleOutgoingHistory?scaleId=' + scaleId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeScaleSplits: function (data, token) {
                return $http.delete(apiUrl + `scale/${data}/splitTicket`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            splittTicket: function(data, token) {
                return $http.post(apiUrl + 'scale/splittTicket', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getSplittTicket: function(ticketId, token) {
                return $http.get(apiUrl + 'scale/splittTicket?ticketId=' + ticketId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            bagList: function(token) {
                return $http.get(apiUrl + 'bags/list', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            splittOutgoingTicket: function(data, token) {
                return $http.post(apiUrl + 'scale/splittOutgoingTicket', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getOutgoingSplittTicket: function(ticketId, token) {
                return $http.get(apiUrl + 'scale/splittOutgoingTicket?ticketId=' + ticketId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addGrowerLoadSheet: function(data, token) {
              return $http.post(apiUrl + 'scale/' + data.growerId + '/loadsheet', data, {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
            updateGrowerLoadSheet: function(data, token) {
              return $http.put(apiUrl + 'scale/' + data.growerId + '/loadsheet', data, {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
        };
    });
