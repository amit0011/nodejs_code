angular.module('myApp.sidebar', [])
    .directive('sidebar', function($state, httpService, $rootScope) {
        return {
            restrict: 'EA',
            templateUrl: 'app/shared/sidebar/sidebar.html',
            link: function(scope) {
                // $(".navigation ul li").click(function() {
                // 	$(".sub_men").toggleClass("sub");
                // 	$(this).toggleClass("main");
                // });
                $(".navigation ul li.sales").click(function() {
                    $(".sub_men.sale_sub").toggleClass("sub");
                    $(this).toggleClass("main");
                });
                $(".navigation ul li.purchase").click(function() {
                    $(".sub_men.purchase_sub").toggleClass("sub");
                    $(this).toggleClass("main");
                });
                // $(".sub_men.sub ul li.sales").click(function() {
                // 	$(".sub_men").addClass("sub");
                // });

                $(".navigation ul li.comm").click(function() {
                    $(".sub_men.comm_sub").toggleClass("sub");
                    $(this).toggleClass("main");
                });

                $(".navigation ul li.sett").click(function() {
                    $(".sub_men.sett_sub").toggleClass("sub");
                    $(this).toggleClass("main");
                });
                $(".navigation ul li.truck").click(function() {
                    $(".sub_men.truck_sub").toggleClass("sub");
                    $(this).toggleClass("main");
                });

                scope.token = JSON.parse(localStorage.getItem('token'));
                httpService.profile(scope.token).then(function(res) {
                        if (res.data.status == 200) {
                            scope.userInfo = res.data.data;
                            localStorage.setItem('userType', JSON.stringify(res.data.data.type));
                            localStorage.setItem('userProfile', JSON.stringify(res.data.data));
                        } else {
                            swal("Here's a message!", res.data.userMessage, "error");
                            $state.go('login');
                        }
                    },
                    function(error) {
                        if (error.status == -1) {
                            swal("Here's a message!", 'Server not responding.', "error");
                        }
                    });
                scope.logout = () => {
                    $state.go('login');
                    $rootScope.isLogin = false;
                    localStorage.removeItem('token');
                    localStorage.removeItem('loginUserInfo');
                };
            }
        };
    });