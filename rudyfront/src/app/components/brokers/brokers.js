angular.module('myApp.brokers', [])
    .controller('brokersCtrl', function($scope,
        brokerHttpService,
        httpService,
        $timeout,
        spinnerService,
        $stateParams,
        quoteHttpService,
        salesContractHttpServices,
        sudAdminHttpService,
        weatherHttpService,
        imageUrl,
        $rootScope,
        $state,
        ckEditorService) {


        $scope.$on('access', (event, data) => {
            if (!data || !data.sales || !data.sales.brokers || !data.sales.brokers.viewMenu) {
                $rootScope.isLogin = false;
                localStorage.removeItem('token');
                localStorage.removeItem('loginUserInfo');
                $state.go('login');
                swal("ERROR", "Access denied", "error");
            }
        });

        $scope.brokerDetails = (brokerId) => {
            if ($rootScope.loginUserAccess.sales.brokers.view) {
                $state.go('brokerDetails', {
                    brokerId: brokerId
                });
            }
        };

        $scope.active = {
            page: 'brokers'
        };
        $scope.imagePath = imageUrl;
        $scope.myForm = {};
        $scope.arr = [];
        $scope.allChecked = true;
        var i, item;
        var pageNo = localStorage.getItem('broker_page_No') || 1;
        $scope.sendMail = false;
        $scope.dayList = [{
            "dayName": "Monday"
        }, {
            "dayName": "Tuesday"
        }, {
            "dayName": "Wednesday"
        }, {
            "dayName": "Thursday"
        }, {
            "dayName": "Friday"
        }, {
            "dayName": "Saturday"
        }, {
            "dayName": "Sunday"
        }];
        $scope.brokerId = $stateParams.brokerId;
        $scope.userType = JSON.parse(localStorage.getItem('userType'));
        $scope.token = JSON.parse(localStorage.getItem('token'));

        sudAdminHttpService.getadmin(pageNo, $scope.token, 'All').then(function(res) {
            if (res.data.status == 200) {
                $scope.adminsList = res.data.data;
            }
            spinnerService.hide("html5spinner");
        });

        $scope.matchingDay = function(matchingDayName) { 
            return function (x) { return x.dayName == matchingDayName;};
        };

        if ($scope.brokerId) {
            $scope.brokerDetailsInit = () => {
                brokerHttpService.getBrokerDetails($scope.brokerId, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.brokerDetails = res.data.data;
                        if (res.data.data.days) {
                            $timeout(function() {
                                $scope.dayList.map(function(el) {
                                    for (var i = 0; i < res.data.data.days.length; i++) {
                                        if (res.data.data.days[i].dayName == el.dayName) {
                                            var index = $scope.dayList.findIndex($scope.matchingDay(res.data.data.days[i].dayName));
                                            $scope.dayList[index].ticked = true;
                                        }
                                    }
                                });
                            }, 500);
                        }
                        $scope.initPhoneNote();
                        $scope.initEmployees(pageNo);
                    }
                });
            };
            $scope.brokerDetailsInit();
        }
        if ($scope.brokerId) {

            brokerHttpService.getPurchaseConfirmation($scope.brokerId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.purchaseConfirmationList = res.data.data;
                }
            });

            brokerHttpService.getsalesContract($scope.brokerId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.salesContractList = res.data.data;
                    for (var i = 0; i < $scope.salesContractList.length; i++) {
                        $scope.salesContractList[i].status = $scope.salesContractList[i].status.toString();
                    }
                    spinnerService.hide("html5spinner");
                }
            });
        }

        $scope.initSalesContractList = () => {
            brokerHttpService.getsalesContract($scope.brokerId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.salesContractList = res.data.data;
                    for (var i = 0; i < $scope.salesContractList.length; i++) {
                        $scope.salesContractList[i].status = $scope.salesContractList[i].status.toString();
                    }
                    spinnerService.hide("html5spinner");
                }
            });
        };

        $scope.paginateEmployee = function(text, page, pageSize, total) {
            $scope.initEmployees(page);
            $scope.myForm = {};
        };

        $scope.initEmployees = function(pageNo) {
            spinnerService.show("html5spinner");
            brokerHttpService.getEmployees(pageNo, $scope.brokerId, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.employeesList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    spinnerService.hide("html5spinner");
                }
            });
        };


        $scope.saveEmployee = function() {
            $scope.myForm.brokerId = $scope.brokerId;
            brokerHttpService.addEmployees($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initEmployees(1);
                    $scope.myForm = {};
                    $scope.closepop();
                } else {
                    swal("Message", res.data.userMessage, "error");
                }
            });
        };

        $scope.updateEmployee = function() {
            brokerHttpService.updateEmployees($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initEmployees(1);
                    $scope.myForm = {};
                    $scope.closepop();
                } else {
                    swal("Message", res.data.userMessage, "error");
                }
            });
        };


        $scope.employeeDelete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one employees.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this employees!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            brokerHttpService.removeEmployees($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initEmployees(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal({
                                        title: "Deleted!",
                                        text: "Your employees has been deleted.",
                                        type: "success",
                                        timer: 2000
                                    });
                                }
                            });
                        } else {
                            swal({
                                title: "Cancelled!",
                                text: "Your employees info is safe :)",
                                type: "error",
                                timer: 1000
                            });
                        }
                    });
            }
        };



        $scope.search = function(page) {

            localStorage.setItem('broker_page_filter', JSON.stringify($scope.myForm));
            localStorage.setItem('broker_page_No', page);

            spinnerService.show("html5spinner");
            brokerHttpService.getBrokerSearch(page, $scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.brokerList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    spinnerService.hide("html5spinner");
                } else {
                    swal("Error", res.data.userMessage, "error");
                    spinnerService.hide("html5spinner");
                }
            });
        };
        $scope.initBroker = function(pageNo) {
            spinnerService.show("html5spinner");
            brokerHttpService.getBroker(pageNo, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.brokerList = res.data.data.docs;
                    $scope.page = res.data.data.page;
                    $scope.totalPages = res.data.data.total;
                    spinnerService.hide("html5spinner");
                }
            });
        };
        $scope.DoCtrlPagingAct = function(text, page, pageSize, total) {
            page = page || pageNo;
            localStorage.setItem('broker_page_No', page);
            var prev_filter = localStorage.getItem('broker_page_filter');
            if (prev_filter) {
                $scope.myForm = JSON.parse(prev_filter);
            } else {
                $scope.myForm = {};
            }
            var keys = Object.keys($scope.myForm);
            if (keys.length) {
                $scope.search(page);
            } else {
                $scope.initBroker(page);
            }
        };

        $scope.clear = () => {
            localStorage.setItem('broker_page_No', 1);
            localStorage.removeItem('broker_page_filter');
            $scope.myForm = {};
            $scope.initBroker(1);
        };



        $scope.checkValueLength = (key) => {
            if ($scope.myForm[key]) {
                var copy_value = (angular.copy($scope.myForm[key])).toString();
                if (copy_value.length > 17) {
                    var new_value = copy_value.substring(0, 17);
                    $scope.myForm[key] = Number(new_value);
                }
            }
        };

        $scope.changethumbnail = function(input) {
            var file = input.files[0];
            $scope.myForm.filePath = file;
            var data = {
                'filePath': $scope.myForm.filePath
            };
            if (data) {
                spinnerService.show("html5spinner");
                brokerHttpService.uploadBroker(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initBroker(pageNo);
                        spinnerService.hide("html5spinner");
                    } else {
                        spinnerService.hide("html5spinner");
                        swal("Error", res.data.userMessage, "error");
                    }
                });
            } else {
                console.log('select file');
            }
        };
        $scope.selected = {};
        $scope.selectAll = function() {
            $scope.arr = [];
            if ($scope.allChecked) {
                for (i = 0; i < $scope.brokerList.length; i++) {
                    item = $scope.brokerList[i];
                    $scope.selected[item._id] = true;
                    $scope.arr.push($scope.brokerList[i]._id);
                    $scope.allChecked = false;
                }
            } else {
                for (i = 0; i < $scope.brokerList.length; i++) {
                    item = $scope.brokerList[i];
                    $scope.selected[item._id] = false;
                    $scope.arr.pop($scope.brokerList[i]._id);
                    $scope.allChecked = true;
                }
            }
        };
        $scope.checkBox = function(id) {
            if ($scope.arr.indexOf(id) > -1) {
                $scope.arr.splice(id, 1);
            } else {
                $scope.arr.push(id);
            }
        };

        $scope.save = function() {

            $scope.myForm.addresses = [{
                'street': $scope.myForm.street,
                'city': $scope.myForm.city,
                'province': $scope.myForm.province,
                'postal': $scope.myForm.postal,
                'country': $scope.myForm.country
            }];
            $scope.myForm.fullAddress = $scope.myForm.street;
            brokerHttpService.addBroker($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initBroker(1);
                    $scope.myForm = '';
                    $scope.closepop();
                    $('#analysisFrom').trigger('reset');
                } else {
                    swal("Message", res.data.userMessage, "success");
                }
            });
        };
        $scope.assignUserFunction = (data) => {
            if (data) {
                $scope.myForm = data;
                $scope.saveChanges('assign');
            }

        };
        $scope.saveChanges = function(type) {
            if (type != 'assign') {
                $scope.myForm.addresses = [{
                    'street': $scope.myForm.street,
                    'city': $scope.myForm.city,
                    'province': $scope.myForm.province,
                    'postal': $scope.myForm.postal,
                    'country': $scope.myForm.country
                }];
                $scope.myForm.fullAddress = $scope.myForm.street;
            }
            brokerHttpService.updateBroker($scope.myForm, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    $scope.initBroker(1);
                    if ($scope.brokerId) {
                        $scope.brokerDetailsInit();
                    }
                    $scope.closepop();
                } else {
                    swal("ERROR", res.data.userMessage, "error");
                }
            });
        };



        $scope.delete = function(id) {
            if (id) {
                $scope.arr = [id];
            }
            if ($scope.arr.length == 0) {
                swal("Here's a message!", 'Select atleast one broker.', "error");
            } else {
                $scope.data = {
                    idsArray: $scope.arr
                };
                swal({
                        title: "Are you sure?",
                        text: "Your will not be able to recover this broker!",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, delete it!",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    },
                    function(isConfirm) {
                        if (isConfirm) {
                            brokerHttpService.removeBroker($scope.data, $scope.token).then(function(res) {
                                if (res.data.status == 200) {
                                    $scope.initBroker(pageNo);
                                    $scope.arr = [];
                                    $scope.allChecked = true;
                                    swal({
                                        title: "Deleted!",
                                        text: "Your broker has been deleted.",
                                        type: "success",
                                        timer: 1000
                                    });
                                }
                            });
                        } else {
                            swal({
                                title: "Cancelled!",
                                text: "Your broker file is safe :)",
                                type: "error",
                                timer: 1000
                            });
                        }
                    });
            }
        };
        $scope.initPhoneNote = () => {
            httpService.getPhoneNote($scope.token, '', '', $scope.brokerId, '').then(function(res) {
                if (res.data.status == 200) {
                    $scope.phoneNoteList = res.data.data.reverse();
                    for (i = 0; i < $scope.phoneNoteList.length; i++) {
                        if ($scope.phoneNoteList[i].createdBy) {
                            $scope.phoneNoteList[i].fullName = $scope.phoneNoteList[i].createdBy.fullName;
                        } else {
                            $scope.phoneNoteList[i].fullName = $scope.phoneNoteList[i].userName;
                        }
                    }
                }
            });
        };
        $scope.phoneNoteSubmit = () => {
            if (!$scope.myForm.message) {
                swal("Error", 'Please enter value first.', "error");
            } else {
                var data = {
                    brokerId: $scope.brokerDetails._id,
                    message: $scope.myForm.message,
                    referenceNumber: $scope.brokerDetails.reference || ''
                };
                httpService.addPhoneNote(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        $scope.initPhoneNote();
                        $scope.myForm = {};
                    }
                });
            }
        };
        $scope.changeSalesContractStatus = function(contract) {
            var data = {
                _id: contract._id,
                status: Number(contract.status),
                statusChanged: true
            };
            salesContractHttpServices.changeSalesContractStatus(data, $scope.token).then(function(res) {
                if (res.data.status == 200) {
                    swal("Alert", res.data.userMessage, "success");
                } else {
                    swal("Error", res.data.userMessage, "success");
                }
            });
        };
        $scope.openPop = function(data, type) {
            if (type == 'view') {
                $(".broker_edit").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.street = data.addresses[0].street;
                $scope.myForm.city = data.addresses[0].city;
                $scope.myForm.province = data.addresses[0].province;
                $scope.myForm.postal = data.addresses[0].postal;
                $scope.myForm.country = data.addresses[0].country;
            } else if (type == 'edit') {
                $(".broker_edit").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                $scope.myForm.phone = Number(data.phone);
                $scope.myForm.cellNumber = Number(data.cellNumber);
                $scope.myForm.street = data.addresses[0].street;
                $scope.myForm.city = data.addresses[0].city;
                $scope.myForm.province = data.addresses[0].province;
                $scope.myForm.postal = data.addresses[0].postal;
                $scope.myForm.country = data.addresses[0].country;
            } else {
                $scope.myForm = {};
                $scope.inputField = 'ADD';
                $(".broker_edit").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };
        $scope.employeePop = function(data, type) {
            if (type == 'view') {
                $(".employee").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                if ($scope.myForm.phone) {
                    $scope.myForm.phone = Number($scope.myForm.phone);
                }
                if ($scope.myForm.cellNumber) {
                    $scope.myForm.cellNumber = Number($scope.myForm.cellNumber);
                }
            } else if (type == 'edit') {
                $(".employee").fadeIn();
                $(".popup_overlay").fadeIn();
                $scope.inputField = type;
                $scope.myForm = _.clone(data);
                if ($scope.myForm.phone) {
                    $scope.myForm.phone = Number($scope.myForm.phone);
                }
                if ($scope.myForm.cellNumber) {
                    $scope.myForm.cellNumber = Number($scope.myForm.cellNumber);
                }
            } else {
                $scope.inputField = 'Add';
                $(".employee").fadeIn();
                $(".popup_overlay").fadeIn();
            }
        };
        $scope.closepop = function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
            $(".employee").fadeOut();
            $(".broker_edit").fadeOut();
            $(".compose_mail").fadeOut();

        };
        $(".popup_overlay , .close").click(function() {
            $(".add_coomm").fadeOut();
            $(".popup_overlay").fadeOut();
            $(".employee").fadeOut();
            $(".broker_edit").fadeOut();

        });
        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });



        if ($scope.brokerId) {
            weatherHttpService.getweather(pageNo, $scope.token).then(function(res) {
                $scope.weather = res.data.status == 200 ? res.data.data.docs[0] : null;
            });


            quoteHttpService.getquote($scope.token, $scope.brokerId, 'broker').then(function(res) {
                $scope.quotes = res.data.status == 200 ? res.data.data : [];
            });
        }




        $scope.sendMailFunction = (data) => {
            if (data && data._id) {
                // if (!$scope.brokerDetails.email) {
                //     swal("Alert", "Email not attached with this broker");
                //     return;
                // }
                $scope.sendMail = true;
                quoteHttpService
                    .quoteDetail(data._id, $scope.token)
                    .then((objS) => {
                        spinnerService.hide("html5spinner");
                        if (objS.data.status == 200) {
                            $scope.quote = objS.data.data;
                        }

                        $scope.print('quotePdf', data._id);
                    }, (objE) => {
                        spinnerService.hide("html5spinner");
                        $scope.sendMail = false;
                    });
            } else {
                swal("Alert", "First create atleast one quote", "error");
            }

        };

        $scope.print = function(printSectionId, quoteId) {
            spinnerService.show("html5spinner");
            $timeout(function() {
                $scope.sendMail = false;
                var html = document.getElementById(printSectionId).innerHTML;
                var data = {
                    html: html,
                    subject: 'Rudy Agro Quote',
                    name: $scope.brokerDetails.businessName,
                    email: [],
                    orientation: 'landscape',
                    pdfType: "Quote",
                    quoteId: quoteId
                };

                if ($scope.brokerDetails && $scope.brokerDetails.email) {
                    data.email.push($scope.brokerDetails.email);
                }

                if ($scope.brokerDetails && $scope.brokerDetails.assignedUserId && $scope.brokerDetails.assignedUserId.email) {
                    data.email.push($scope.brokerDetails.assignedUserId.email);
                }

                if (data.email.length == 0) {
                    data.email.push("info@rudyagro.ca");
                }

                httpService.sendContract(data, $scope.token).then(function(res) {
                    if (res.data.status == 200) {
                        spinnerService.hide("html5spinner");
                    } else {
                        swal("Error", res.data.userMessage, "error");
                    }
                });

            }, 1000);

        };



        $scope.send_mail = function(data, type) {
            if (!data.pdfUrl || data.mailSent || data.status == 2) return;
            else if (!data.brokerId.email) {
                swal('Error', 'Email not attched with this broker');
            } else {
                $(".compose_mail").fadeIn();
                $(".popup_overlay").fadeIn();
                ckEditorService.showEditor();
                $scope.data = data;
                $scope.type = type;
                $scope.emailSending = false;
                $scope.to_email = [data.brokerId.email];
                $scope.cc_email = [data.createdBy.email];
                $scope.to_email = $scope.to_email.filter((val) => val).map((val1) => val1);
                $scope.cc_email = $scope.cc_email.filter((val) => val).map((val1) => val1);

                $scope.emailform = {
                    "body": `<p><strong>Hi ${$scope.data.brokerId.firstName},</strong></p>

                        <p>Please click the link below to review your sales contract.  If you have any questions or concerns please give me a call anytime.</p>

                        <p><strong>${$scope.data.pdfUrl}</strong></p>

                        <p>&nbsp;</p>

                        <p>&nbsp;</p>

                        <p><strong>Regards</strong></p>

                        <p>Rudy Agro.</p>`,
                    "subject": "Sales Contract pdf"
                };
            }
        };
        // <p>To view your quote , please click on the below link :</p>
        $scope.sendMailToUser = (valid) => {
            if ($scope.emailform.subject && CKEDITOR.instances.ckeditor.getData() && valid) {
                var mailObj = {
                    email: [...$scope.to_email, ...$scope.cc_email],
                    subject: $scope.emailform.subject,
                    _id: $scope.data._id,
                    type: $scope.type,
                    body: CKEDITOR.instances.ckeditor.getData()
                };
                $scope.emailSending = true;
                httpService.sendPdfMail(mailObj, $scope.token)
                    .then((objS) => {
                        $scope.closepop();
                        if (objS.data.status == 200) {
                            $scope.initSalesContractList();
                        }
                        $scope.emailSending = false;

                    }, (objE) => {
                        $scope.emailSending = false;
                    });
            }
        };
    });