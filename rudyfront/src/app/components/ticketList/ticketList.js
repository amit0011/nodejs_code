angular
    .module('myApp.ticketList', [])
    .controller('ticketListCtrl', function($scope, httpService, $rootScope, $state, $stateParams, ckEditorService, spinnerService, scaleTicketHttpServices) {

        $scope.contractNumber = $stateParams.contractNumber;
        $scope.seqNo = $stateParams.seqNo;
        $scope.token = JSON.parse(localStorage.getItem('token'));

        $scope.emailSending = false;
        $scope.tradeTickets = [];



        spinnerService.show("html5spinner");

        $scope.list = function() {
            scaleTicketHttpServices.ticketList($stateParams, $scope.token).then(function(res) {
                spinnerService.hide("html5spinner");
                $scope.tickets = [];
                if (res.data.status == 200) {
                    res.data.data.docs.forEach(function(scale) {
                        if (scale.isSplitTicket && scale.splits.length > 0) {
                            var split = scale.splits.find(function (s) {
                                return s.contractNumber == $scope.contractNumber;
                            });
                            var ratio = split.netWeight / scale.netWeight;
                            scale.dockageTotal = scale.dockageTotal * ratio;
                            scale.dockageTotalWeight = scale.dockageTotalWeight * ratio;
                            scale.netWeight = split.netWeight;
                            scale.contractNumber = split.contractNumber + (split.contractNumber != scale.contractNumber ? '-S' : '');
                        }

                        $scope.tickets.push(scale);
                    });
                }
            });

            if ($stateParams.contractNumber.startsWith('S')) {
                scaleTicketHttpServices.tradeTicketList($stateParams, $scope.token).then(function(res) {
                    $scope.tradeTickets = [];
                    if (res.data.status == 200) {
                        $scope.tradeTickets = res.data.data;
                    }
                });
            }
        };
        $scope.list();


        if ($scope.seqNo == '0' || $scope.seqNo == '1') {
            $scope.preFix = "RI-";
        } else if ($scope.seqNo == '2') {
            $scope.preFix = "RO-";
        }
        $scope.getName = (t) => {
            var name = t.personFarmType == 'Person' ? t.growerId.firstName + ' ' + t.growerId.lastName : ((t.purchase_confirmation && t.purchase_confirmation.farmName) || t.growerId.farmName);
            return name || t.farmName || t.growerId.farmName || (t.growerId.firstName + ' ' + t.growerId.lastName);
        };

        $scope.getValue = (list, type) => {
            $scope.value = list.filter((val) => {
                return val.analysisId.analysisName == type;
            });
            if ($scope.value && $scope.value.length && $scope.value[0].weight ){
                return $scope.value[0].weight.toFixed(3);
            }
            else return '--';
        };

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        $scope.addEmailInCC = () => {
            if (validateEmail($scope.emailform.cc)) {
                if ($scope.cc_email.indexOf($scope.emailform.cc.toLowerCase()) != -1) {
                    swal("Info", "Email already added in CC", "info");
                } else if ($scope.to_email.indexOf($scope.emailform.cc.toLowerCase()) != -1) {
                    swal("Info", "Email already added in To", "info");
                } else {
                    $scope.cc_email.push($scope.emailform.cc.toLowerCase());
                    $scope.emailform.cc = '';
                }
            }
        };
        $scope.removeEmailFromCC = (index) => {
            $scope.co.splice(index, 1);
        };

        $scope.scalePdfUrl = '';

        httpService.getProductionContractByContractNo($scope.contractNumber, $scope.token).then(function(res) {

            if (res.data.status == 200) {
                $scope.scalePdfUrl = res.data.data.scalePdfUrl;
            }
        });

        $scope.openComposeMailPopUp = function() {
            $scope.cc_email = [];
            var data = $scope.tickets[0];
            $scope.ticketId = data._id;
            $scope.to_email = [];
            if ($scope.seqNo == '0' || $scope.seqNo == '1') {
                if (data.growerId.email) {
                    if (validateEmail(data.growerId.email)) {
                        $scope.to_email.push(data.growerId.email);
                        $scope.name = data.growerId.firstName;
                    } else {
                        swal('Error', 'Invalid email attched with this grower');
                        return;
                    }
                } else {
                    swal('Error', 'Email not attched with this grower');
                    return;
                }
            } else {
                if (data.buyerId.email) {
                    if (validateEmail(data.buyerId.email)) {
                        $scope.to_email.push(data.buyerId.email);
                        $scope.name = data.buyerId.businessName;
                    } else {
                        swal('Error', 'Invalid email attched with this buyer');
                        return;
                    }
                } else {
                    swal('Error', 'Email not attched with this Buyer');
                    return;
                }
            }

            $(".compose_mail").fadeIn();
            $(".popup_overlay").fadeIn();

            ckEditorService.showEditor();

            $scope.emailSending = false;
            $scope.listWithHtml = "";

            $scope.emailform = {
                "body": `<p><strong>Hi ${$scope.name},</strong></p>

                            <p>Please click below link to review your scale ticket details. If you have any questions or concerns please give me a call anytime.</p>

                            <p>&nbsp;</p>

                            <p><a href="${$scope.scalePdfUrl}" style="font-size:16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
                                font-weight:normal;color:#ffffff;text-decoration:none;background-color:#3698d1;border-top:15px solid #3698d1;
                                border-bottom:15px solid #3698d1;border-left:25px solid #3698d1;border-right:25px solid #3698d1;border-radius:3px;
                                display:inline-block">View Scale Tickets</a></p>
                            <p>&nbsp;</p>

                            <p><strong>Regards</strong></p>
                            <p>Rudy Agro.</p>`,
                "subject": "Scale Ticket of contract " + $scope.contractNumber
            };

        };

        $scope.sendMail = (valid) => {
            $scope.submitted = true;
            if ($scope.emailform.subject && CKEDITOR.instances.ckeditor.getData() && valid && $scope.ticketId) {
                var mailObj = {
                    email: [...$scope.to_email, ...$scope.cc_email],
                    subject: $scope.emailform.subject,
                    body: CKEDITOR.instances.ckeditor.getData(),
                    _id: $scope.tickets.map((val) => val._id)
                };
                $scope.emailSending = true;

                scaleTicketHttpServices.sendTicketMail(mailObj, $scope.token)
                    .then((objS) => {
                        if (objS.data.status == 200) {
                            $scope.closepop();
                            $scope.list();
                        } else {
                            swal('Error', objS.data.userMessage);
                        }
                        $scope.emailSending = false;
                    }, (objE) => {
                        swal('Error', objE.data.userMessage);
                        $scope.emailSending = false;
                    });
            }
        };

        $scope.closepop = function() {
            $(".popup_overlay").fadeOut();
            $(".compose_mail").fadeOut();
        };

        $('body').on('click', '.popup_overlay', function() {
            $scope.closepop();
        });
        $scope.getClass = (data) => {
            if (data.void) return "clsRed";
            else return "";
        };

    });
