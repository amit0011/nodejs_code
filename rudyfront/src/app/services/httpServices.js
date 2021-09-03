angular.module('myApp.httpService', [])
    .service('httpService', function(apiUrl, $http, $state, $rootScope) {
        var baseUrl = apiUrl;

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

        console.log(baseUrl);
        return {
            login: function(data) {
                return $http.post(baseUrl + 'admin/login', data).then(handleSuccess, handleError);
            },
            forgot: function(data) {
                return $http.post(baseUrl + 'admin/password', data).then(handleSuccess, handleError);
            },
            resetPassword: function(data) {
                return $http.post(baseUrl + 'admin/reset', data).then(handleSuccess, handleError);
            },
            profile: function(token) {
                return $http.get(baseUrl + 'admin/profile', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addGrower: function(data, token) {
                return $http.post(baseUrl + 'grower', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError).then(handleSuccess, handleError);
            },
            updateGrower: function(data, token) {
                return $http.put(baseUrl + 'grower', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getGrower: function(pageNo, token) {
                return $http.get(baseUrl + 'grower/bulk?page=' + pageNo, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            upateNote: function(growerId, note, token) {
              return $http.put(baseUrl + 'grower/note/' + growerId, {note}, {
                headers: {
                  'Content-Type': 'application/json',
                  'authorization': "Bearer " + token
                }
              }).then(handleSuccess, handleError);
            },

            getGrowerSearch: function(pageNo, data, token) {
                return $http.post(baseUrl + 'grower/search?page=' + pageNo, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            updateRating: function(data, token) {
                return $http.post(baseUrl + 'grower/rating', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getRating: function(growerId, token) {
                return $http.get(baseUrl + 'grower/rating?growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getGrowerDetails: function(id, token) {
                return $http.get(baseUrl + 'grower/bulk?growerId=' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            uploadGrower: function(data, token) {
                var fd = new FormData();
                fd.append('file', data.filePath);
                return $http.post(baseUrl + 'grower/bulk', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            generateTicketPdf: function(data,token) {
                return $http.post(baseUrl + 'grower/generateTicketPdf', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            removeGrower: function(data, token) {
                return $http.post(baseUrl + 'grower/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addPhoneNote: function(data, token) {
                return $http.post(baseUrl + 'phone/note', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getPhoneNote: function(token, growerId, buyerId, brokerId, reference) {
                return $http.get(baseUrl + 'phone/note?growerId=' + growerId + '&buyerId=' + buyerId + '&brokerId=' + brokerId + '&reference=' + reference, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateBuyerNote : function(buyerId, note, token) {
              return $http.put(baseUrl + 'buyer/note/' + buyerId, {note}, {
                headers: {
                  'Content-Type': 'application/json',
                  'authorization': "Bearer " + token
                }
              }).then(handleSuccess, handleError);
            },
            addCommodityType: function(data, token) {
                return $http.post(baseUrl + 'commodity/type', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateCommodityType: function(data, token) {
                return $http.put(baseUrl + 'commodity/type', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getCommodityType: function(token, option) {
                var query = '';
                if (option && option.populateByProducts) {
                    query = 'populateByProducts=1';
                }

                return $http.get(baseUrl + 'commodity/type?' + query, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeCommodityType: function(data, token) {
                return $http.post(baseUrl + 'commodity/type/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addCommodity: function(data, token) {
                return $http.post(baseUrl + 'commodity', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getCommodity: function(token) {
                return $http.get(baseUrl + 'commodity', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            updateCommodity: function(data, token) {
                return $http.put(baseUrl + 'commodity', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeCommodity: function(data, token) {
                return $http.post(baseUrl + 'commodity/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getCommodityById: function(id, token) {
                return $http.get(baseUrl + 'commodity/' + id, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addGrade: function(data, token) {
                return $http.post(baseUrl + 'grade', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            updateGrade: function(data, token) {
                return $http.put(baseUrl + 'grade', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeGrade: function(data, token) {
                return $http.post(baseUrl + 'grade/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            activateGrade: function(data, token) {
                return $http.post(baseUrl + 'grade/activate', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getGrade: function(pageNo, commodityId, token, grade) {
                return $http.get(baseUrl + 'grade?page=' + pageNo + '&commodityId=' + commodityId + '&grade=' + grade, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getCallAsGrade: function(commodityId, token) {
                return $http.get(baseUrl + 'grade?commodityId=' + commodityId + '&callAs=1', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getInventoryGrade: function(pageNo, commodityId, token, grade) {
                return $http.get(baseUrl + 'grade?page=' + pageNo + '&commodityId=' + commodityId + '&inventoryGrade=yes', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addAnalysis: function(data, token) {
                return $http.post(baseUrl + 'analysis', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            editAnalysis: function(data, token) {
                return $http.put(baseUrl + 'analysis', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getAnalysis: function(token) {
                return $http.get(baseUrl + 'analysis', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeAnalysis: function(data, token) {
                return $http.post(baseUrl + 'analysis/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addVariety: function(data, token) {
                return $http.post(baseUrl + 'variety', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            editVariety: function(data, token) {
                return $http.put(baseUrl + 'variety', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            reloadPurchaseWeight: function(contractNumber, token) {
              return $http.get(apiUrl + 'sync/purchaseWeight/' + contractNumber, {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
            reloadProductionWeight: function(contractNumber, token) {
              return $http.get(apiUrl + 'sync/productionWeight/' + contractNumber, {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
            getVariety: function(token) {
                return $http.get(baseUrl + 'variety', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeVariety: function(data, token) {
                return $http.post(baseUrl + 'variety/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addSample: function(data, token) {
                return $http.post(baseUrl + 'sample', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getSample: function({token, ...restParams}) {
                return $http.get(baseUrl + 'sample', {
                    params: restParams,
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getSampleNumber: function(token) {
                return $http.get(baseUrl + 'sample/getNumber', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getSampleUsingCommodity: function(data, token) {
                return $http.post(baseUrl + 'sample/list', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeSample: function(data, token) {
                return $http.post(baseUrl + 'sample/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            //rajeev dwivedi code

            //update sample markForDump = 1
            updateDump: function(data, token) {
                return $http.post(baseUrl + 'sample/dump', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            //update sample dumped = 1
            updateDumped: function(data, token) {
                return $http.post(baseUrl + 'sample/dumped', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getDumpList: function(token) {
                return $http.get(baseUrl + 'sample/dumpList', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },



            searchProductionContractInfo: function(data, token, pageNo) {
                return $http.post(baseUrl + 'search/production?page=' + pageNo, data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addProductionContract: function(data, token) {
                return $http.post(baseUrl + 'production/contract', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getProductionContract: function(id, commId, page, search, token) {
                return $http.get(baseUrl + 'production/contract?growerId=' + id + '&commodityId=' + commId + '&page=' + page + '&search=' + search, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            contractByGrower: function(growerId, token) {
                return $http.get(baseUrl + 'production/contractByGrower?growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getProductionContractCount: function(cropYear, commId, token) {
                return $http.get(baseUrl + 'production/count?cropYear=' + cropYear + '&commodityId=' + commId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getProductionContractByContractNo: function(contractNo, token) {
                return $http.get(baseUrl + 'production/' + contractNo + '/contract', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeContract: function(data, token) {
                return $http.post(baseUrl + 'production/delete', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            createRollover: function(data, token) {
                return $http.post(baseUrl + 'production/rollover', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            createSalesContractRollover: function(data, token) {
                return $http.post(baseUrl + 'sales/rollover', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            sendContract: function(data, token) {
                return $http.put(baseUrl + 'production/contract', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            searchPurchaseInfo: function(data, token) {
                return $http.post(baseUrl + 'search/purchase', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            addPurchaseConfirmation: function(data, token) {
                return $http.post(baseUrl + 'purchase/confirmation', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getPurchaseConfirmation: function(id, commId, token) {
                return $http.get(baseUrl + 'purchase/confirmation?growerId=' + id + '&commodityId=' + commId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            createPurchaseConfirmationRollover: function(data, token) {
                return $http.post(baseUrl + 'purchase/rollover', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            purchaseConfirmationListByGrower: function(growerId, token) {
                return $http.get(baseUrl + 'purchase/purchaseConfirmationListByGrower?growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getPurchaseConfirmationByContractNo: function(contractNo, token) {
                return $http.get(baseUrl + 'purchase/' + contractNo + '/confirmation', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getPurchaseConfirmationCount: function(cropYear, commId, token) {
                return $http.get(baseUrl + 'purchase/count?cropYear=' + cropYear + '&commodityId=' + commId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            exportdata: function(data, token) {
                return $http.post(baseUrl + 'export', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            exportAllConctract: function(token) {
                return $http.get(baseUrl + 'production/export', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            loadSheets: function(token, growerId) {
              return $http.get(baseUrl + 'scale/' + growerId + '/loadsheet', {
                  headers: {
                      'Content-Type': 'application/json',
                      'authorization': "Bearer " + token
                  }
              }).then(handleSuccess, handleError);
            },
            uploadPdf: function(data, contractId, token) {
                var fd = new FormData();
                fd.append('file', data.file);
                fd.append('field', data.field);
                return $http.put(apiUrl + 'purchase/uploadPdf?contractId=' + contractId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            uploadProductionPdf: function(data, contractId, token) {
                var fd = new FormData();
                fd.append('file', data.file);
                fd.append('field', data.field);
                return $http.put(apiUrl + 'production/uploadPdf?contractId=' + contractId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined,
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            uploadHarvestedFile: function(data, contractId, harvestQty, token) {
              var fd = new FormData();
                fd.append('file', data.file);
                fd.append('harvestQty',data.harvestQty);
                return $http.put(apiUrl + 'production/uploadHarvestFile?contractId=' + contractId, fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).then(handleSuccess, handleError);
            },

            removeSignedContract: function(id, token) {
                return $http.put(apiUrl + 'purchase/removeSignedContract?id=' + id, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            uploadGrowerPdf: function(data, growerId, token) {
                var fd = new FormData();
                fd.append('file', data.file);
                return $http.put(apiUrl + '/grower/pdf', fd, {
                    transformRequest: angular.identity,
                    params: {
                      growerId,
                      expiryDate: data.expiryDate,
                      pdfType: data.type
                    },
                    headers: { 'Content-Type': undefined }
                }).then(handleSuccess, handleError);
            },
            removeGrowerPdf: function(growerId, pdfType, token) {
                return $http.get(apiUrl + '/grower/pdf?growerId=' + growerId, {
                    params: { pdfType },
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            removeProductionSignedContract: function(id, token) {
                return $http.put(apiUrl + 'production/removeSignedContract?id=' + id, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            sendPdfMail: function(data, token) {
                return $http.post(apiUrl + 'production/sendPdfMail', data, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            growerDetails: function(growerId, token) {
                return $http.get(apiUrl + 'grower/growerDetails?growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getOutgoingSeedScale: function(growerId, token) {
                return $http.get(apiUrl + 'scale/getOutgoingSeedScale?growerId=' + growerId, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            removeGrowerRating: function(growerId, token) {
                return $http.put(apiUrl + 'grower/removeGrowerRating?growerId=' + growerId, {}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getLatestProductionContract: function(token) {
                return $http.get(apiUrl + 'production/getLatestProductionContract', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            getLatestPurchaseConfirmationContract: function(token) {
                return $http.get(apiUrl + 'purchase/getLatestPurchaseConfirmationContract', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getLatestTradePurchaseContract: function(token) {
                return $http.get(apiUrl + 'tradePurchase/latest', {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            productionHistory: function(contractNumber, token) {
                return $http.get(apiUrl + `production/productionHistory?contractNumber=${contractNumber}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },

            purchaseContractHistory: function(contractNumber, token) {
                return $http.get(apiUrl + `purchase/purchaseConfirmtaionHistory?contractNumber=${contractNumber}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': "Bearer " + token
                    }
                }).then(handleSuccess, handleError);
            },
            getArchiveExcel: function(token, data) {
                return $http
                    .get(apiUrl + "commodityPricing/archive/excel?date=" + data.date + '&reportName=' + data.reportName + '&entityName=' + data.entityName, {
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': "Bearer " + token
                        }
                    }).then(handleSuccess, handleError);
            }

        };
    });
