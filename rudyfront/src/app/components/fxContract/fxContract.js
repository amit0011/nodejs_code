angular.module('myApp.fxContract', [])
    .controller('fxContractCtrl', function($scope, $filter, $rootScope, spinnerService, fxContractService, $state, $sce, commonService) {

        $scope.$on('access', (event, data) => {
            if (!data || !data.reports || !data.reports.fxContract || !data.reports.fxContract.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.active = {
            page: 'fxContract'
        };

        $scope.searchForm = {isClose: null};
        $scope.myForm = {};
        $scope.page = localStorage.getItem('fx_Contract_page') || 1;
        $scope.enableChatBox = false;
        $scope.note = {
            contractNumber: '',
            list: [],
            contractId: ''
        };

        $scope.messageForm = {};

        $scope.token = JSON.parse(localStorage.getItem('token'));

        $(function() {
            $('.fa-minus').click(function() {
                $(this).closest('.chatbox').toggleClass('chatbox-min');
            });
            $('.fa-close').click(function() {
                $scope.$apply(function() {
                    $scope.enableChatBox = false;
                });

            });
        });

        $scope.calculateStrikeRate = function () {
            var cadAmount = $scope.myForm.cadAmount - 0;
            var usdAmount = $scope.myForm.usdAmount - 0;
            $scope.myForm.strikeRate = cadAmount && usdAmount ? ((cadAmount / usdAmount).toFixed(4) - 0) : 0;
        };

        $scope.openComment = (l) => {
            if ($scope.note.contractNumber != l.contractNumber) {
                $scope.note.contractId = l._id;
                $scope.note.contractNumber = l.contractNumber;
                $scope.commentRequest = true;
                fxContractService
                    .noteList(l._id, $scope.token)
                    .then(function(res) {
                        $scope.commentRequest = false;
                        var objDiv = document.getElementById("scrollArea");
                        objDiv.scrollTop = objDiv.scrollHeight;
                        $scope.note.list = res.data.status == 200 ? res.data.data : [];

                    });
            }
            $scope.enableChatBox = true;
        };

        $scope.addNote = () => {
            if ($scope.messageForm.message) {
                var req = {
                    contractId: $scope.note.contractId,
                    message: $scope.messageForm.message
                };
                $scope.noteRequest = true;
                fxContractService
                    .addNote(req, $scope.token)
                    .then(function(res) {
                        $scope.noteRequest = false;
                        if (res.data.status == 200) {
                            $scope.note.list.push(res.data.data);
                            $scope.messageForm.message = '';

                        }
                    });
            }
        };

        $scope.closeOptionList = [{label: 'Yes', value: true}, {label: 'No', value: false}];

        $scope.structureSign = {
            "Collar": 1, "Forward Confirmation": 1, "Ratio Forward": 1,
            "Roll": -1, "Drawdown": -1, "Collar Expiry": -1
        };

        $scope.formatAmount = function(c) {
          var formattedText = $scope.structureSign[c.structure] < 0 ? ('<span style="color:red;">(' + $filter('number')(Math.abs(c.usdAmount),2) + ')</span>') : ('<span>' + $filter('number')(c.usdAmount, 2) + '</span>');

          return $sce.trustAsHtml(formattedText);
        };

        $scope.getTotal = () => {
            $scope.totalUSDAmount = 0;
            $scope.totalCADAmount = 0;
            $scope.totalStrikeRate = 0;
            $scope.contractList.forEach((val) => {
                if (val && val.usdAmount) {
                    $scope.totalUSDAmount += val.usdAmount * $scope.structureSign[val.structure];
                }
                if (val && val.cadAmount) {
                    $scope.totalCADAmount += val.cadAmount * $scope.structureSign[val.structure];
                }
            });
            $scope.totalStrikeRate = $scope.totalUSDAmount ? $scope.totalCADAmount / $scope.totalUSDAmount : 0;
        };

        $scope.init = function() {
            spinnerService.show("html5spinner");
            localStorage.setItem('fx_Contract_page', $scope.page);

            var searchParam = Object.assign({}, $scope.searchForm);
            searchParam.fromDate = commonService.adjustDate(searchParam.fromDate);
            searchParam.toDate = commonService.adjustDate(searchParam.toDate, ']');

            fxContractService.list(searchParam, $scope.page, $scope.token).then(function(res) {
                if (res.data.status == 200) {

                   // $scope.page = res.data.data.page;
                   // $scope.totalPages = res.data.data.total;
                    $scope.contractList = res.data.data;
                    $scope.getTotal();

                }
                spinnerService.hide("html5spinner");
            });
        };

        $scope.initList = (page) => {
            $scope.page = page;
            $scope.init();
        };
        $scope.init();

        $scope.save = (valid) => {
            $scope.submitted = true;
            if (valid) {
                spinnerService.show("html5spinner");
                var formData = new FormData();
                _.keys($scope.myForm).forEach(function(field) {
                    formData.append(field, $scope.myForm[field]);
                });

                fxContractService.addOrUpdate($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.closepop();
                        $scope.init();
                    } else {
                        swal("ERROR", res.data.userMessage, "error");
                    }
                    spinnerService.hide("html5spinner");
                });
            }
        };

        $scope.pdfSelectedFile = function (input) {
            $scope.myForm.pdfFile = input.files[0];
            var ext = $scope.myForm.pdfFile.name.split('.').pop() ;
            if ( ['pdf'].includes(ext)) {
                $scope.errMsg = "Invalid file selected for upload";
                $scope.file = '';
            }
        };

        $scope.saveChanges = (valid) => {
            $scope.submitted = true;
            if (valid) {
                spinnerService.show("html5spinner");

                var formData = new FormData();
                _.keys($scope.myForm).forEach(function(field) {
                    formData.append(field, $scope.myForm[field]);
                });

                fxContractService.addOrUpdate($scope.myForm, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.contractList[$scope.index] = res.data.data;
                        $scope.getTotal();
                        $scope.closepop();
                    } else {
                        swal("ERROR", res.data.userMessage, "error");
                    }
                    spinnerService.hide("html5spinner");
                });
            }
        };

        $scope.openPop = function(type, data, index) {
            $scope.submitted = false;
            if (type == 'Edit') {
                $scope.inputField = type;
                $scope.index = index;
                $scope.myForm = angular.copy(data);

                $scope.myForm.tradeDate = moment($scope.myForm.tradeDate).format('YYYY-MM-DD');
                $scope.myForm.expiryDate = moment($scope.myForm.expiryDate).format('YYYY-MM-DD');

                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            } else {
                $scope.inputField = type;
                $scope.myForm = {isClose:false};
                $(".add_coomm").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };
        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
        };
        $(".popup_overlay , .close").click(function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
        });
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
    });
