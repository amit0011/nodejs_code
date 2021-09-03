angular
  .module("myApp.header", [])
  .directive("header", function(
    $state,
    $rootScope,
    httpService,
    sudAdminHttpService,
    accessService
  ) {
    return {
      restrict: "EA",
      templateUrl: "app/shared/header/header.html",
      link: function(scope) {
        scope.token = JSON.parse(localStorage.getItem("token"));
        scope.loginUser = JSON.parse(localStorage.getItem("loginUserInfo"));

        //@default access menu & submenu
        scope.allAccess = accessService.defaultAccess();

        function setAllFalse(obj) {
          obj = _.clone(obj);
          Object.keys(obj).forEach(function(key) {
            if (typeof obj[key] == "object") {
              obj[key] = setAllFalse(obj[key]);
            } else {
              obj[key] = false;
            }
          });
          return obj;
        }

        sudAdminHttpService.getAccess("", scope.token).then(
          objS => {
            //scope.access = scope.allAccess;
            // console.log(objS);

            if (objS.data.status == 200) {
              scope.access = objS.data.data.access;
              scope.loggedInUser = objS.data.data;
              delete scope.loggedInUser.access;
            } else {
              scope.access = {};
              scope.loggedInUser = {};
            }

            if (!scope.access || _.isEmpty(scope.access)) {
              if (objS.data.data.type == "SUPERADMIN") {
                scope.access = scope.allAccess;
              } else {
                scope.access = setAllFalse(scope.allAccess);
              }
            }
            scope.$emit("access", scope.access);
            $rootScope.loginUserAccess = scope.access;
            $rootScope.loggedInUser = scope.loggedInUser;
          },
          objE => {
            console.log("Error to find access level");
          }
        );

        scope.logout = () => {
          $state.go("login");
          $rootScope.isLogin = false;
          localStorage.removeItem("token");
          localStorage.removeItem("loginUserInfo");
        };

        // console.log('nav');
        $(document).ready(function() {
          $("#togss").click(function() {
            $(".navigation_header").toggleClass("active");
            $(".right_panel").toggleClass("active");
          });
        });

        var routeHistory = {
          growers: "growerSearch",
          productionContracts: "production_contract_filter",
          purchaseConfirmations: "purchase_conf_filter",
          brokers: "broker_page_filter",
          buyers: "buyer_page_filter",
          salesContracts: "sales_contract_filter",
          tradePurchases: "trade_purchase_filter",
          incomingScales: "incoming_scale_filter",
          outgoingScales: "outgoing_scale_filter",
          outgoingSeeds: "outgoing_seed_filter",
          tradePurchaseScale: "trade_purchase_scale_filter",
          incomingScaleInventories: "incoming_scale_filter",
          outgoingScaleInventories: "outgoing_scale_filter",
          openContractReport: "outStanding_report_filter",
          performanceReport: "pfmnce_page_filter",
          targetPriceReport: "target_price_report_filter",
          freights: "freight_filter",
          shippedWeightAnalysis: "shipped_weight_analysis_filter"
        };

        scope.clearSearchHistory = function(forEntity) {
          if (!(forEntity in routeHistory)) {
            return;
          }

          if (typeof routeHistory[forEntity] == "string") {
            localStorage.removeItem(routeHistory[forEntity]);
            return;
          }

          routeHistory[forEntity].forEach(function(entity) {
            localStorage.removeItem(entity);
          });
        };
      }
    };
  });
