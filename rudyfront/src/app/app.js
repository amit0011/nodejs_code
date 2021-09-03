require("angular");
require("angular-ui-router");
require("ng-ui-router-state-events");
require("angular-aria");
require("angular-animate");
require("angular-material");
require("angularjs-datepicker");
require('angucomplete-alt');

require("angular-paging");
require("./services/httpServices.js");
require("./services/commonServices.js");
require("./services/jsonService.js");
require("./services/wordService.js");
require("./services/accessService.js");

require("./services/ckEditorService.js");
require("./directives/directive.js");
require("./directives/filter.js");
require("./directives/angularSpinners.js");
require("./lib/dirPagination.js");
// require('./lib/autocomplete.js');
require("./lib/isteven-multi-select.js");
require("./lib/customSelect.js");
require("./components/login/login.js");
require("./components/forgot/forgot.js");
require("./components/resetPassword/reset.js");
require("./components/dashboard/dashboard.js");
require("./components/subAdmin/subAdmin.js");
require("./components/subAdmin/accessRole.js");
require("./components/receiver/receiver.js");
require("./components/subAdmin/sudAdminHttpService.js");
require("./components/addCommodity/addCommodity.js");
require("./components/brokers/brokers.js");
require("./components/brokers/brokerHttpServices.js");
require("./components/salesContract/salesContract.js");
require("./components/salesContract/salesContractHttpServices.js");
require("./components/salesContract/salesContractPDF.js");
require("./components/salesContract/salesSummary.js");
require("./components/report/forexReport.js");
require("./components/report/areaReport.js");
require("./components/report/targetPrice.js");
require("./components/report/growerMassReport.js");
require("./components/report/outStandingReport.js");
require("./components/report/performanceReport.js");
require("./components/report/performanceDetails.js");

require("./components/fxContract/fxContract.js");
require("./components/fxContract/fxContractService.js");
require("./components/report/fxHedgeReport.js");
require("./components/salesStamp/salesStamp.js");
require("./components/salesStamp/salesStampHttpServices.js");
require("./components/buyers/buyers.js");
require("./components/buyers/buyerHttpServices.js");
require("./components/buyers/buyerDetails.js");
require("./components/growers/growers.js");
require("./components/growerDetails/growerDetails.js");
require("./shared/header/header.js");
require("./shared/sidebar/sidebar.js");
require("./components/commodity/commodity.js");
require("./components/sample/sample.js");
require("./components/addSample/addSample.js");
require("./components/commodityType/commodityType.js");
require("./components/grade/grade.js");
require("./components/analysis/analysis.js");
require("./components/commodityPricing/commodityPricing.js");
require("./components/commodityPricing/pricingHttpServices.js");
require("./components/country/country.js");
require("./components/country/countryHttpServices.js");
require("./components/destinationPort/destinationPort.js");
require("./components/loadingPort/loadingPort.js");
require("./components/loadingPort/loadingPortHttpService.js");
require("./components/shippingTerms/shippingTerms.js");
require("./components/shippingTerms/shippingTermsHttpService.js");
require("./components/freight/freight.js");
require("./components/freight/freightHttpServices.js");
require("./components/freightCompany/freightCompany.js");
require("./components/freightCompany/freightCompanyHttpServices.js");
require("./components/equipment/equipment.js");
require("./components/equipment/equipmentHttpServices.js");
require("./components/variety/variety.js");
require("./components/productionContract/productionContract.js");
require("./components/addProductionContract/addProductionContract.js");
require("./components/purchaseConfirmation/purchaseConfirmation.js");
require("./components/confirmProductionContract/confirmProductionContract.js");
require("./components/tradePurchase/tradePurchase.js");
require("./components/tradePurchase/addEditTradePurchase.js");
require("./components/tradePurchase/tradePurchaseHttpServices.js");
require("./components/tradePurchase/tradePurchaseStamp.js");
require("./components/tradePurchaseScale/tradePurchaseScale.js");
require("./components/tradePurchaseScale/addTradePurchaseTicket.js");
require("./components/growerDetails/addLoadSheet.js");
require("./components/tradePurchaseScale/tradeScaleTicketPdf.js");
require("./components/tradePurchaseScale/tradePurchaseScaleHttpServices.js");
require("./components/scaleTickets/incoming.js");
require("./components/scaleTickets/outgoing.js");

require("./components/scaleTickets/scaleTicket.js");
require("./components/scaleTickets/addOutgoingScaleTicket.js");
require("./components/scaleTickets/scaleTicketHttpServices.js");
require("./components/scaleTickets/incomingScaleTicketPDF.js");

require("./components/bidsheet/bidsheet.js");
require("./components/bidsheet/bidSheetHttpService.js");
require("./components/currency/currency.js");
require("./components/currency/currencyHttpServices.js");
require("./components/bags/bags.js");
require("./components/bags/bagBalance.js");
require("./components/bags/bagCategoryBalance.js");
require("./components/bags/bagInventory.js");
require("./components/bags/bagInventoryCategorized.js");
require("./components/bags/bagsHttpServices.js");
require("./components/freightSetting/freightSetting.js");
require("./components/freightSetting/freightSettingHttpServices.js");
require("./components/weather/weather.js");
require("./components/weather/weatherHttpServices.js");
require("./components/certificateCost/certificateCost.js");
require("./components/certificateCost/certificateCostHttpServices.js");
require("./components/pricingTerms/pricingTerms.js");
require("./components/pricingTerms/pricingTermsHttpService.js");
require("./components/tags/tags.js");
require("./components/tags/tagsHttpService.js");
require("./components/documents/documents.js");
require("./components/documents/documentsHttpService.js");
require("./components/tradeRules/tradeRules.js");
require("./components/tradeRules/tradeRulesHttpService.js");
require("./components/paymentMethod/paymentMethod.js");
require("./components/paymentMethod/paymentMethodHttpService.js");
require("./components/paymentTerms/paymentTerms.js");
require("./components/paymentTerms/paymentTermsHttpService.js");
require("./components/variance/variance.js");
require("./components/variance/varianceHttpService.js");
require("./components/quote/addQuote.js");
require("./components/quote/quotePdf.js");
require("./components/quote/quoteHttpService.js");
require("./components/report/report.js");
require("./components/edc/edc.js");
require("./components/maxWeight/maxWeight.js");
require("./components/ticketList/ticketList.js");
require("./components/loadSheetList/loadSheetList.js");
require("./components/report/reportHttpServices.js");
require("./components/report/purchaseConfirmationReport.js");
require("./components/report/commissionPayable.js");
require("./components/report/failedQuotes.js");
require("./components/report/freightVariance.js");
require("./components/report/shippedWeightAnalysis.js");
require("./components/report/productContractReport.js");
require("./components/positionReport/positionReport.js");
require("./components/report/packagingReport.js");
require("./components/report/rollover/productionRollover.js");
require("./components/report/rollover/purchaseRollover.js");
require("./components/report/rollover/salesRollover.js");
require("./components/report/rollover/rolloverHttpServices.js");
require("./components/bidPeriod/bidPeriod.js");
require("./components/bidPeriod/bidPeriodHttpService.js");
require("./components/scaleTicketNumber/scaleTicketNumber.js");
require("./components/scaleTicketNumber/scaleTicketNumberHttp.js");
require("./components/shipline/shipline.js");
require("./components/shipline/shiplineHttpServices.js");
require("./components/profile/profile.js");
require("./components/profile/profileHttpService.js");
require("./components/bin/bin.js");
require("./components/bags/bagCategory.js");
require("./components/bin/binHttpService.js");
require("./components/edc/edcHttpService.js");
require("./components/maxWeight/maxWeightHttpService.js");
require("./components/scaleTickets/outgoingSeedScaleTicket.js");
require("./components/scaleTickets/addScaleTicket.js");
require("./components/salesContract/salesContractHistory.js");
require("./components/scaleTickets/scaleHistory.js");
require("./components/scaleTickets/scaleOutgoingHistory.js");
require("./components/productionContract/productionContractHistory.js");
require("./components/origin/origin.js");
require("./components/origin/originHttpServices.js");
require("./components/town/town.js");
require("./components/town/townHttpServices.js");
require("./components/trucker/trucker.js");
require("./components/trucker/truckerHttpServices.js");
require("./components/purchaseConfirmation/purchaseConfirmationHistory.js");
require("./components/report/growerCallBackReport.js");
require("./components/country/city.js");
require("./components/country/cityHttpServices.js");
require("./components/containerInventory/container.js");
require("./components/containerInventory/containerHttpServices.js");

var app = angular.module("myApp", [
  "ui.router",
  "ui.router.state.events",
  "ngMaterial",
  "angucomplete-alt",

  "angularUtils.directives.dirPagination",
  "bw.paging",
  "angularSpinners",
  "myApp.httpService",
  "myApp.commonService",
  "myApp.jsonService",
  "myApp.wordService",
  "myApp.accessService",
  "myApp.ckEditorService",
  "myApp.directive",
  "myApp.filter",
  "720kb.datepicker",
  "ui.select",
  "isteven-multi-select",
  "myApp.header",
  "myApp.login",
  "myApp.forgot",
  "myApp.resetPassword",
  "myApp.brokers",
  "myApp.salesContract",
  "myApp.salesSummary",
  "myApp.forexReport",
  "myApp.targetPrice",
  "myApp.productionRollover",
  "myApp.purchaseRollover",
  "myApp.salesRollover",
  "myApp.rolloverHttpServices",
  "myApp.growerMassReport",
  "myApp.performanceReport",
  "myApp.performanceDetails",
  "myApp.areaReport",
  "myApp.outStandingReport",
  "myApp.salesContractHttpServices",
  "myApp.salesContractPDF",
  "myApp.salesStamp",
  "myApp.salesStampHttpServices",
  "myApp.brokerHttpService",
  "myApp.buyers",
  "myApp.buyerHttpServices",
  "myApp.buyerDetails",
  "myApp.growers",
  "myApp.growerDetails",
  "myApp.sidebar",
  "myApp.dashboard",
  "myApp.subAdmin",
  "myApp.accessRole",
  "myApp.receiver",
  "myApp.sudAdminHttpService",
  "myApp.addCommodity",
  "myApp.commodity",
  "myApp.sample",
  "myApp.addSample",
  "myApp.commodityType",
  "myApp.productionContract",
  "myApp.addProductionContract",
  "myApp.purchaseConfirmation",
  "myApp.confirmProductionContract",
  "myApp.grade",
  "myApp.analysis",
  "myApp.commodityPricing",
  "myApp.pricingHttpServices",
  "myApp.country",
  "myApp.countryHttpService",
  "myApp.destinationPort",
  "myApp.loadingPort",
  "myApp.loadingPortHttpService",
  "myApp.shippingTerms",
  "myApp.shippingTermsHttpService",
  "myApp.freight",
  "myApp.freightHttpServices",
  "myApp.equipment",
  "myApp.equipmentHttpService",
  "myApp.variety",
  "myApp.freightCompany",
  "myApp.freightCompanyHttpServices",
  "myApp.scaleTicket",
  "myApp.addOutgoingScaleTicket",
  "myApp.scaleTicketHttpServices",
  "myApp.incomingScaleTicketPDF",
  "myApp.bidsheet",
  "myApp.bidSheetHttpService",
  "myApp.currencyHttpService",
  "myApp.currency",
  "myApp.bagsHttpService",
  "myApp.bags",
  "myApp.bagBalance",
  "myApp.bagCategoryBalance",
  "myApp.bagInventory",
  "myApp.bagInventoryCategorized",
  "myApp.freightSetting",
  "myApp.freightSettingHttpService",
  "myApp.weatherHttpService",
  "myApp.weather",
  "myApp.certificateCostHttpService",
  "myApp.certificateCost",
  "myApp.pricingTerms",
  "myApp.pricingTermsHttpService",
  "myApp.tags",
  "myApp.tagsHttpService",
  "myApp.documents",
  "myApp.documentsHttpService",
  "myApp.tradeRules",
  "myApp.tradeRulesHttpService",
  "myApp.paymentMethod",
  "myApp.paymentMethodHttpService",
  "myApp.paymentTerms",
  "myApp.paymentTermsHttpService",
  "myApp.variance",
  "myApp.varianceHttpService",
  "myApp.addQuote",
  "myApp.quoteHttpService",
  "myApp.quotePdfCtrl",
  "myApp.report",
  "myApp.edc",
  "myApp.maxWeight",
  "myApp.ticketList",
  "myApp.loadSheetList",
  "myApp.reportHttpServices",
  "myApp.purchaseConfirmationReport",
  "myApp.commissionPayable",
  "myApp.failedQuotes",
  "myApp.freightVariance",
  "myApp.shippedWeightAnalysis",
  "myApp.productContractReport",
  "myApp.positionReport",
  "myApp.packagingReport",
  "myApp.bidPeriod",
  "myApp.bidPeriodHttpService",
  "myApp.scaleTicketNumber",
  "myApp.scaleTicketNumberHttpService",
  "myApp.shiplineHttpServices",
  "myApp.shipline",
  "myApp.profile",
  "myApp.profileHttpServices",
  "myApp.bin",
  "myApp.bagCategory",
  "myApp.binHttpService",
  "myApp.edcHttpService",
  "myApp.maxWeightHttpService",
  "myApp.outgoingSeedScaleTicket",
  "myApp.tradePurchase",
  "myApp.addEditTradePurchase",
  "myApp.tradePurchaseStamp",
  "myApp.tradePurchaseHttpServices",
  "myApp.tradePurchaseScale",
  "myApp.addTradePurchaseTicket",
  "myApp.addLoadSheet",
  "myApp.tradeScaleTicketPdf",
  "myApp.tradePurchaseScaleHttpServices",
  "myApp.fxContractService",
  "myApp.fxHedgeReport",
  "myApp.fxContract",
  "myApp.salesContractHistory",
  "myApp.incoming",
  "myApp.outgoing",
  "myApp.addScaleTicket",
  "myApp.scaleHistory",
  "myApp.scaleOutgoingHistory",
  "myApp.productionContractHistory",
  "myApp.origin",
  "myApp.originHttpService",
  "myApp.town",
  "myApp.townHttpService",
  "myApp.trucker",
  "myApp.truckerHttpService",
  "myApp.purchaseConfirmationHistory",
  "myApp.growerCallBackReport",
  "myApp.city",
  "myApp.cityHttpServices",
  "myApp.container",
  "myApp.containerHttpServices"
]);

app.config(function(
  $stateProvider,
  $urlRouterProvider,
  $locationProvider,
  $httpProvider
) {
  $urlRouterProvider.otherwise("/login");
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  //$httpProvider.interceptors.push('AuthInterceptor');

  $stateProvider
    .state("login", {
      url: "/login",
      views: {
        "": {
          templateUrl: "app/components/login/login.html",
          controller: "loginCtrl"
        }
      }
    })
    .state("forgot", {
      url: "/forgot",
      views: {
        "": {
          templateUrl: "app/components/forgot/forgot.html",
          controller: "forgotCtrl"
        }
      }
    })
    .state("reset", {
      url: "/reset",
      views: {
        "": {
          templateUrl: "app/components/resetPassword/reset.html",
          controller: "resetPasswordCtrl"
        }
      }
    })
    .state("dashboard", {
      url: "/dashboard",
      views: {
        "": {
          templateUrl: "app/components/dashboard/dashboard.html",
          controller: "dashboardCtrl"
        }
      }
    })
    .state("subAdmin", {
      url: "/subAdmin",
      views: {
        "": {
          templateUrl: "app/components/subAdmin/subAdmin.html",
          controller: "subAdminCtrl"
        }
      }
    })
    .state("accessRole", {
      url: "/accessRole/:id",
      views: {
        "": {
          templateUrl: "app/components/subAdmin/accessRole.html",
          controller: "accessRoleCtrl"
        }
      }
    })
    .state("addSubAdmin", {
      url: "/addSubAdmin",
      views: {
        "": {
          templateUrl: "app/components/subAdmin/addSubAdmin.html",
          controller: "subAdminCtrl"
        }
      }
    })
    .state("receiver", {
      url: "/receiver",
      views: {
        "": {
          templateUrl: "app/components/receiver/receiver.html",
          controller: "receiverCtrl"
        }
      }
    })
    .state("brokers", {
      url: "/brokers",
      views: {
        "": {
          templateUrl: "app/components/brokers/brokers.html",
          controller: "brokersCtrl"
        }
      }
    })
    .state("brokerDetails", {
      url: "/brokerDetails/:brokerId",
      views: {
        "": {
          templateUrl: "app/components/brokers/brokerDetails.html",
          controller: "brokersCtrl"
        }
      }
    })
    .state("salesSummary", {
      url: "/salesSummary",
      views: {
        "": {
          templateUrl: "app/components/salesContract/salesSummary.html",
          controller: "salesSummaryCtrl"
        }
      }
    })

    .state("forexReport", {
      url: "/forexReport",
      views: {
        "": {
          templateUrl: "app/components/report/forexReport.html",
          controller: "forexReportCtrl"
        }
      }
    })

    .state("targetPrice", {
      url: "/targetPrice",
      views: {
        "": {
          templateUrl: "app/components/report/targetPrice.html",
          controller: "targetPriceCtrl"
        }
      }
    })

    .state("growerMassReport", {
      url: "/growerMassReport",
      views: {
        "": {
          templateUrl: "app/components/report/growerMassReport.html",
          controller: "growerMassReportCtrl"
        }
      }
    })

    .state("performanceReport", {
      url: "/performanceReport",
      views: {
        "": {
          templateUrl: "app/components/report/performanceReport.html",
          controller: "performanceReportCtrl"
        }
      }
    })

    .state("performanceDetails", {
      url: "/performanceDetails/:adminId",
      views: {
        "": {
          templateUrl: "app/components/report/performanceDetails.html",
          controller: "performanceDetailsCtrl"
        }
      }
    })

    .state("areaReport", {
      url: "/areaReport",
      views: {
        "": {
          templateUrl: "app/components/report/areaReport.html",
          controller: "areaReportCtrl"
        }
      }
    })

    .state("outStandingReport", {
      url: "/outStandingReport",
      views: {
        "": {
          templateUrl: "app/components/report/outStandingReport.html",
          controller: "outStandingReportCtrl"
        }
      }
    })

    .state("salesContract", {
      url: "/salesContract",
      views: {
        "": {
          templateUrl: "app/components/salesContract/salesContract.html",
          controller: "salesContractCtrl"
        }
      }
    })

    .state("addsalesContract", {
      url: "/addSalesContract/:buyerId",
      views: {
        "": {
          templateUrl: "app/components/salesContract/addsalesContract.html",
          controller: "salesContractCtrl"
        }
      }
    })
    .state("editsalesContract", {
      url: "/editSalesContract/:buyerId/:contractNumber/:type",
      views: {
        "": {
          templateUrl: "app/components/salesContract/addsalesContract.html",
          controller: "salesContractCtrl"
        }
      }
    })
    .state("salesContractPDF", {
      url: "/salesContractPDF/:contractNumber",
      views: {
        "": {
          templateUrl: "app/components/salesContract/salesContractPDF.html",
          controller: "salesContractPDFCtrl"
        }
      }
    })
    .state("salesStamp", {
      url: "/salesStamp/:buyerId/:contractNumber",
      views: {
        "": {
          templateUrl: "app/components/salesStamp/salesStamp.html",
          controller: "salesStampCtrl"
        }
      }
    })
    .state("buyers", {
      url: "/buyers",
      views: {
        "": {
          templateUrl: "app/components/buyers/buyers.html",
          controller: "buyersCtrl"
        }
      }
    })
    .state("buyerDetails", {
      url: "/buyerDetails/:buyerId",
      views: {
        "": {
          templateUrl: "app/components/buyers/buyerDetails.html",
          controller: "buyerDetailsCtrl"
        }
      }
    })
    .state("quotePdf", {
      url: "/quotePdf/:quoteId",
      views: {
        "": {
          templateUrl: "app/components/quote/quotePdf.html",
          controller: "quotePdfCtrl"
        }
      }
    })
    .state("viewQuotePdf", {
      url: "/viewQuotePdf/:quoteId",
      views: {
        "": {
          templateUrl: "app/components/buyers/buyerDetails.html",
          controller: "buyerDetailsCtrl"
        }
      }
    })
    .state("addQuote", {
      url: "/addQuote/:type/:userId",
      views: {
        "": {
          templateUrl: "app/components/quote/addQuote.html",
          controller: "addQuoteCtrl"
        }
      }
    })
    .state("updateQuote", {
      url: "/updateQuote/:buyerId/:quoteId",
      views: {
        "": {
          templateUrl: "app/components/quote/addQuote.html",
          controller: "addQuoteCtrl"
        }
      }
    })
    .state("growers", {
      url: "/growers",
      views: {
        "": {
          templateUrl: "app/components/growers/growers.html",
          controller: "growersCtrl"
        }
      }
    })
    .state("growerDetails", {
      url: "/growerDetails/:id",
      views: {
        "": {
          templateUrl: "app/components/growerDetails/growerDetails.html",
          controller: "growerDetailsCtrl"
        }
      }
    })
    .state("addCommodity", {
      url: "/addCommodity",
      views: {
        "": {
          templateUrl: "app/components/addCommodity/addCommodity.html"
        }
      }
    })
    .state("commodity", {
      url: "/commodity",
      views: {
        "": {
          templateUrl: "app/components/commodity/commodity.html"
        }
      }
    })
    .state("sample", {
      url: "/sample",
      views: {
        "": {
          templateUrl: "app/components/sample/sample.html",
          controller: "sampleCtrl"
        }
      }
    })
    .state("addSample", {
      url: "/addSample",
      views: {
        "": {
          templateUrl: "app/components/addSample/addSample.html"
        }
      }
    })
    .state("productionContract", {
      url: "/productionContract",
      views: {
        "": {
          templateUrl:
            "app/components/productionContract/productionContract.html",
          controller: "productionContractCtrl"
        }
      }
    })
    .state("addProductionContract", {
      url: "/addProductionContract/:growerId/:type/:contractNo",
      views: {
        "": {
          templateUrl:
            "app/components/addProductionContract/addProductionContract.html",
          controller: "addProductionContractCtrl"
        }
      }
    })
    .state("confirmProductionContract", {
      url: "/confirmProductionContract/:growerId/:contractNo",
      views: {
        "": {
          templateUrl:
            "app/components/confirmProductionContract/confirmProductionContract.html",
          controller: "confirmProductionContractCtrl"
        }
      }
    })
    .state("purchase", {
      url: "/purchase",
      views: {
        "": {
          templateUrl: "app/components/purchaseConfirmation/purchase.html",
          controller: "purchaseConfirmationCtrl"
        }
      }
    })
    .state("purchaseConfirmation", {
      url: "/purchaseConfirmation/:growerId",
      views: {
        "": {
          templateUrl:
            "app/components/purchaseConfirmation/purchaseConfirmation.html",
          controller: "purchaseConfirmationCtrl"
        }
      }
    })
    .state("confirmation", {
      url: "/purchaseConfirmation/:growerId/:type/:contractNo",
      views: {
        "": {
          templateUrl:
            "app/components/purchaseConfirmation/purchaseConfirmation.html",
          controller: "purchaseConfirmationCtrl"
        }
      }
    })
    .state("purchaseConfirmationPdf", {
      url: "/purchaseConfirmationPdf/:growerId/:contractNo",
      views: {
        "": {
          templateUrl:
            "app/components/purchaseConfirmation/purchaseConfirmationPdf.html",
          controller: "purchaseConfirmationCtrl"
        }
      }
    })

    .state("purchaseConfirmationHistory", {
      url: "/purchaseConfirmation/history/:contractNo",
      views: {
        "": {
          templateUrl:
            "app/components/purchaseConfirmation/purchaseConfirmationHistory.html",
          controller: "purchaseConfirmationHistoryCtrl"
        }
      }
    })

    .state("grade", {
      url: "/grade",
      views: {
        "": {
          templateUrl: "app/components/grade/grade.html"
        }
      }
    })
    .state("commodityType", {
      url: "/commodityType",
      views: {
        "": {
          templateUrl: "app/components/commodityType/commodityType.html"
        }
      }
    })
    .state("commodityPricing", {
      url: "/commodityPricing",
      views: {
        "": {
          templateUrl: "app/components/commodityPricing/commodityPricing.html",
          controller: "commodityPricingCtrl"
        }
      }
    })
    .state("country", {
      url: "/country",
      views: {
        "": {
          templateUrl: "app/components/country/country.html",
          controller: "countryCtrl"
        }
      }
    })
    .state("city", {
      url: "/city",
      views: {
        "": {
          templateUrl: "app/components/country/city.html",
          controller: "cityCtrl"
        }
      }
    })
    .state("container", {
      url: "/container",
      views: {
        "": {
          templateUrl: "app/components/containerInventory/container.html",
          controller: "containerCtrl"
        }
      }
    })
    .state("destinationPort", {
      url: "/destinationPort",
      views: {
        "": {
          templateUrl: "app/components/destinationPort/destinationPort.html",
          controller: "destinationPortCtrl"
        }
      }
    })
    .state("loadingPort", {
      url: "/loadingPort",
      views: {
        "": {
          templateUrl: "app/components/loadingPort/loadingPort.html",
          controller: "loadingPortCtrl"
        }
      }
    })
    .state("shippingTerms", {
      url: "/shippingTerms",
      views: {
        "": {
          templateUrl: "app/components/shippingTerms/shippingTerms.html",
          controller: "shippingTermsCtrl"
        }
      }
    })
    .state("freight", {
      url: "/freight",
      views: {
        "": {
          templateUrl: "app/components/freight/freight.html",
          controller: "freightCtrl"
        }
      }
    })
    .state("freightCompany", {
      url: "/freightCompany",
      views: {
        "": {
          templateUrl: "app/components/freightCompany/freightCompany.html",
          controller: "freightCompanyCtrl"
        }
      }
    })
    .state("equipment", {
      url: "/equipment",
      views: {
        "": {
          templateUrl: "app/components/equipment/equipment.html",
          controller: "equipmentCtrl"
        }
      }
    })
    .state("report", {
      url: "/report",
      views: {
        "": {
          templateUrl: "app/components/report/report.html",
          controller: "reportCtrl"
        }
      }
    })
    .state("variety", {
      url: "/variety",
      views: {
        "": {
          templateUrl: "app/components/variety/variety.html",
          controller: "varietyCtrl"
        }
      }
    })
    .state("analysis", {
      url: "/analysis",
      views: {
        "": {
          templateUrl: "app/components/analysis/analysis.html",
          controller: "analysisCtrl"
        }
      }
    })
    .state("scaleTicket", {
      url: "/scale/:type",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/scaleTicket.html",
          controller: "scaleTicketCtrl"
        }
      }
    })
    .state("addScaleTicket", {
      url: "/addscale/:tickertNo",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/addScaleTicket.html",
          controller: "scaleTicketCtrl"
        }
      }
    })
    .state("incomingScale", {
      url: "/incomingScale/:ticketNo",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/addScaleTicket.html",
          controller: "addScaleTicketCtrl"
        }
      }
    })
    .state("addOutgoingScaleTicket", {
      url: "/addoutgoingscale/:ticketNo",
      views: {
        "": {
          templateUrl:
            "app/components/scaleTickets/addOutgoingScaleTicket.html",
          controller: "addOutgoingScaleTicketCtrl"
        }
      }
    })
    .state("outgoingSeedScale", {
      url: "/outgoingSeedScale/:growerId",
      views: {
        "": {
          templateUrl:
            "app/components/scaleTickets/outgoingSeedScaleTicket.html",
          controller: "outgoingSeedScaleTicketCtrl"
        }
      }
    })
    .state("editoutgoingSeedScale", {
      url: "/editoutgoingSeedScale/:growerId/:ticketNumber",
      views: {
        "": {
          templateUrl:
            "app/components/scaleTickets/outgoingSeedScaleTicket.html",
          controller: "outgoingSeedScaleTicketCtrl"
        }
      }
    })
    .state("incomingScaleTicketPDF", {
      url: "/incomingScaleTicketPDF/:ticketNo",
      views: {
        "": {
          templateUrl:
            "app/components/scaleTickets/incomingScaleTicketPDF.html",
          controller: "incomingScaleTicketPDFCtrl"
        }
      }
    })
    .state("bidsheet", {
      url: "/bidsheet",
      views: {
        "": {
          templateUrl: "app/components/bidsheet/bidsheet.html",
          controller: "bidsheetCtrl"
        }
      }
    })
    .state("bidsheetPDF", {
      url: "/bidsheetPDF",
      views: {
        "": {
          templateUrl: "app/components/bidsheet/bidsheetPDF.html",
          controller: "bidsheetCtrl"
        }
      }
    })
    .state("currency", {
      url: "/currency",
      views: {
        "": {
          templateUrl: "app/components/currency/currency.html",
          controller: "currencyCtrl"
        }
      }
    })
    .state("bags", {
      url: "/bags",
      views: {
        "": {
          templateUrl: "app/components/bags/bags.html",
          controller: "bagsCtrl"
        }
      }
    })
    .state("bagBalance", {
      url: "/bagBalance/:bagId",
      views: {
        "": {
          templateUrl: "app/components/bags/bagBalance.html",
          controller: "bagBalanceCtrl"
        }
      }
    })
    .state("bagCategoryBalance", {
      url: "/bagCategoryBalance/:bagCategoryId",
      views: {
        "": {
          templateUrl: "app/components/bags/bagCategoryBalance.html",
          controller: "bagCategoryBalanceCtrl"
        }
      }
    })
    .state("bagInventory", {
      url: "/bagInventory",
      views: {
        "": {
          templateUrl: "app/components/bags/bagInventory.html",
          controller: "bagInventoryCtrl"
        }
      }
    })
    .state("bagInventoryCategorized", {
      url: "/bagInventoryCategorized",
      views: {
        "": {
          templateUrl: "app/components/bags/bagInventoryCategorized.html",
          controller: "bagInventoryCategorizedCtrl"
        }
      }
    })
    .state("freightSetting", {
      url: "/freightSetting",
      views: {
        "": {
          templateUrl: "app/components/freightSetting/freightSetting.html",
          controller: "freightSettingCtrl"
        }
      }
    })
    .state("weather", {
      url: "/weather",
      views: {
        "": {
          templateUrl: "app/components/weather/weather.html",
          controller: "weatherCtrl"
        }
      }
    })
    .state("certificateCost", {
      url: "/certificateCost",
      views: {
        "": {
          templateUrl: "app/components/certificateCost/certificateCost.html",
          controller: "certificateCostCtrl"
        }
      }
    })
    .state("pricingTerms", {
      url: "/pricingTerms",
      views: {
        "": {
          templateUrl: "app/components/pricingTerms/pricingTerms.html",
          controller: "pricingTermsCtrl"
        }
      }
    })
    .state("tags", {
      url: "/tags",
      views: {
        "": {
          templateUrl: "app/components/tags/tags.html",
          controller: "tagsCtrl"
        }
      }
    })
    .state("documents", {
      url: "/documents",
      views: {
        "": {
          templateUrl: "app/components/documents/documents.html",
          controller: "documentsCtrl"
        }
      }
    })
    .state("tradeRules", {
      url: "/tradeRules",
      views: {
        "": {
          templateUrl: "app/components/tradeRules/tradeRules.html",
          controller: "tradeRulesCtrl"
        }
      }
    })
    .state("paymentMethod", {
      url: "/paymentMethod",
      views: {
        "": {
          templateUrl: "app/components/paymentMethod/paymentMethod.html",
          controller: "paymentMethodCtrl"
        }
      }
    })
    .state("paymentTerms", {
      url: "/paymentTerms",
      views: {
        "": {
          templateUrl: "app/components/paymentTerms/paymentTerms.html",
          controller: "paymentTermsCtrl"
        }
      }
    })
    .state("variance", {
      url: "/variance",
      views: {
        "": {
          templateUrl: "app/components/variance/variance.html",
          controller: "varianceCtrl"
        }
      }
    })
    .state("purchaseConfirmationReport", {
      url: "/report/purchaseConfirmation",
      views: {
        "": {
          templateUrl: "app/components/report/purchaseConfirmationReport.html",
          controller: "purchaseConfirmationReportCtrl"
        }
      }
    })
    .state("commissionPayable", {
      url: "/report/commissionPayable",
      views: {
        "": {
          templateUrl: "app/components/report/commissionPayable.html",
          controller: "commissionPayableCtrl"
        }
      }
    })
    .state("failedQuotes", {
      url: "/report/failedQuotes",
      views: {
        "": {
          templateUrl: "app/components/report/failedQuotes.html",
          controller: "failedQuotesCtrl"
        }
      }
    })
    .state("freightVariance", {
      url: "/report/freightVariance",
      views: {
        "": {
          templateUrl: "app/components/report/freightVariance.html",
          controller: "freightVarianceCtrl"
        }
      }
    })
    .state("shippedWeightAnalysis", {
      url: "/report/shippedWeightAnalysis",
      views: {
        "": {
          templateUrl: "app/components/report/shippedWeightAnalysis.html",
          controller: "shippedWeightAnalysisCtrl"
        }
      }
    })
    .state("productContractReport", {
      url: "/report/productContractReport",
      views: {
        "": {
          templateUrl: "app/components/report/productContractReport.html",
          controller: "productContractReportCtrl"
        }
      }
    })
    .state("positionReport", {
      url: "/report/positionReport",
      views: {
        "": {
          templateUrl: "app/components/positionReport/positionReport.html",
          controller: "positionReportCtrl"
        }
      }
    })
    .state("packagingReport", {
      url: "/report/packagingReport",
      views: {
        "": {
          templateUrl: "app/components/report/packagingReport.html",
          controller: "packagingReportCtrl"
        }
      }
    })
    .state("productionRollover", {
      url: "/report/productionRollover",
      views: {
        "": {
          templateUrl: "app/components/report/rollover/productionRollover.html",
          controller: "productionRolloverCtrl"
        }
      }
    })
    .state("purchaseRollover", {
      url: "/report/purchaseRollover",
      views: {
        "": {
          templateUrl: "app/components/report/rollover/purchaseRollover.html",
          controller: "purchaseRolloverCtrl"
        }
      }
    })
    .state("salesRollover", {
      url: "/report/salesRollover",
      views: {
        "": {
          templateUrl: "app/components/report/rollover/salesRollover.html",
          controller: "salesRolloverCtrl"
        }
      }
    })
    .state("bidPeriod", {
      url: "/bidPeriod",
      views: {
        "": {
          templateUrl: "app/components/bidPeriod/bidPeriod.html",
          controller: "bidPeriodCtrl"
        }
      }
    })
    .state("scaleTicketNumber", {
      url: "/scaleTicketNumber",
      views: {
        "": {
          templateUrl:
            "app/components/scaleTicketNumber/scaleTicketNumber.html",
          controller: "scaleTicketNumberCtrl"
        }
      }
    })
    .state("shipline", {
      url: "/shipline",
      views: {
        "": {
          templateUrl: "app/components/shipline/shipline.html",
          controller: "shiplineCtrl"
        }
      }
    })
    .state("profile", {
      url: "/profile",
      views: {
        "": {
          templateUrl: "app/components/profile/profile.html",
          controller: "profileCtrl"
        }
      }
    })
    .state("bin", {
      url: "/bin",
      views: {
        "": {
          templateUrl: "app/components/bin/bin.html",
          controller: "binCtrl"
        }
      }
    })
    .state("bagCategory", {
      url: "/bagCategory",
      views: {
        "": {
          templateUrl: "app/components/bags/bagCategory.html",
          controller: "bagCategoryCtrl"
        }
      }
    })
    .state("edc", {
      url: "/edc",
      views: {
        "": {
          templateUrl: "app/components/edc/edc.html",
          controller: "edcCtrl"
        }
      }
    })
    .state("maxWeight", {
      url: "/maxWeight",
      views: {
        "": {
          templateUrl: "app/components/maxWeight/maxWeight.html",
          controller: "maxWeightCtrl"
        }
      }
    })

    .state("ticketList", {
      url: "/ticketList/:seqNo/:contractNumber/",
      views: {
        "": {
          templateUrl: "app/components/ticketList/ticketList.html",
          controller: "ticketListCtrl"
        }
      }
    })

    .state("loadSheetList", {
      url: "/loadSheetList/:cropYear/:contractNumber",
      views: {
        "": {
          templateUrl: "app/components/loadSheetList/loadSheetList.html",
          controller: "loadSheetListCtrl"
        }
      }
    })

    .state("tradePurchase", {
      url: "/tradePurchase",
      views: {
        "": {
          templateUrl: "app/components/tradePurchase/tradePurchase.html",
          controller: "tradePurchaseCtrl"
        }
      }
    })
    .state("addTradePurchase", {
      url: "/addTradePurchase/:buyerId",
      views: {
        "": {
          templateUrl: "app/components/tradePurchase/addEditTradePurchase.html",
          controller: "addEditTradePurchaseCtrl"
        }
      }
    })
    .state("editTradePurchase", {
      url: "/editTradePurchase/:tradeId",
      views: {
        "": {
          templateUrl: "app/components/tradePurchase/addEditTradePurchase.html",
          controller: "addEditTradePurchaseCtrl"
        }
      }
    })
    .state("tradePurchaseStamp", {
      url: "/tradePurchaseStamp/:tradeId/:contractNumber",
      views: {
        "": {
          templateUrl: "app/components/tradePurchase/tradePurchaseStamp.html",
          controller: "tradePurchaseStampCtrl"
        }
      }
    })
    .state("tradePurchaseScale", {
      url: "/tradePurchaseScale",
      views: {
        "": {
          templateUrl:
            "app/components/tradePurchaseScale/tradePurchaseScale.html",
          controller: "tradePurchaseScaleCtrl"
        }
      }
    })
    .state("addTradePurchaseScale", {
      url: "/addTradePurchaseScale/:buyerId",
      views: {
        "": {
          templateUrl:
            "app/components/tradePurchaseScale/addEditTradePurchaseScale.html",
          controller: "addTradePurchaseTicketCtrl"
        }
      }
    })
    .state("addLoadSheetGrower", {
      url: "/addLoadSheet/:growerId/:type",
      views: {
        "": {
          templateUrl:
            "app/components/growerDetails/addLoadSheet.html",
          controller: "addLoadSheetCtrl"
        }
      }
    })
    .state("editTradePurchaseScale", {
      url: "/editTradePurchaseScale/:scaleId",
      views: {
        "": {
          templateUrl:
            "app/components/tradePurchaseScale/addEditTradePurchaseScale.html",
          controller: "addTradePurchaseTicketCtrl"
        }
      }
    })
    .state("tradeScaleTicketPdf", {
      url: "/tradeScaleTicketPdf/:scaleId",
      views: {
        "": {
          templateUrl:
            "app/components/tradePurchaseScale/tradeScaleTicketPdf.html",
          controller: "tradeScaleTicketPdfCtrl"
        }
      }
    })
    .state("fxContract", {
      url: "/fxContract",
      views: {
        "": {
          templateUrl: "app/components/fxContract/fxContract.html",
          controller: "fxContractCtrl"
        }
      }
    })
    .state("fxHedgeReport", {
      url: "/fxHedgeReport",
      views: {
        "": {
          templateUrl: "app/components/report/fxHedgeReport.html",
          controller: "fxHedgeReportCtrl"
        }
      }
    })
    .state("salesHistory", {
      url: "/salesHistory/:contractNumber",
      views: {
        "": {
          templateUrl: "app/components/salesContract/salesContractHistory.html",
          controller: "salesContractHistoryCtrl"
        }
      }
    })
    .state("productionHistory", {
      url: "/productionContract/history/:contractNumber",
      views: {
        "": {
          templateUrl:
            "app/components/productionContract/productionContractHistory.html",
          controller: "productionContractHistoryCtrl"
        }
      }
    })

    .state("incoming", {
      url: "/incoming",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/incoming.html",
          controller: "incomingCtrl"
        }
      }
    })
    .state("outgoing", {
      url: "/outgoing",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/outgoing.html",
          controller: "outgoingCtrl"
        }
      }
    })
    .state("scaleHistory", {
      url: "/scaleHistory/:ticketNumber/:scaleId",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/scaleHistory.html",
          controller: "scaleHistoryCtrl"
        }
      }
    })
    .state("dumpList", {
      url: "/sample/dumpList",
      views: {
        "": {
          templateUrl: "app/components/sample/dumped.html",
          controller: "sampleCtrl"
        }
      }
    })
    .state("scaleOutgoingHistory", {
      url: "/scaleOutgoingHistory/:ticketNumber/:scaleId",
      views: {
        "": {
          templateUrl: "app/components/scaleTickets/scaleOutgoingHistory.html",
          controller: "scaleOutgoingHistoryCtrl"
        }
      }
    })
    .state("origin", {
      url: "/origin",
      views: {
        "": {
          templateUrl: "app/components/origin/origin.html",
          controller: "originCtrl"
        }
      }
    })
    .state("town", {
      url: "/town",
      views: {
        "": {
          templateUrl: "app/components/town/town.html",
          controller: "townCtrl"
        }
      }
    })
    .state("trucker", {
      url: "/trucker",
      views: {
        "": {
          templateUrl: "app/components/trucker/trucker.html",
          controller: "truckerCtrl"
        }
      }
    })

    .state("growerCallBackReport", {
      url: "/growerCallBackReport",
      views: {
        "": {
          templateUrl: "app/components/report/growerCallBackReport.html",
          controller: "growerCallBackReportCtrl"
        }
      }
    });
});

// app.constant('apiUrl', 'http://localhost:9095/api/');
// app.constant('imageUrl', 'http://localhost:9095');

// app.constant('apiUrl', 'http://test.rudyagro.ca:9095/api/'); //client test server api url
// app.constant('imageUrl', 'http://test.rudyagro.ca:9095'); //client test server api url

app.constant("apiUrl", "https://erp.rudyagro.ca/api/"); //client new live server api url
app.constant("imageUrl", "https://erp.rudyagro.ca");

app.run(function($window, $rootScope) {
  $rootScope.online = navigator.onLine;
  $window.addEventListener(
    "offline",
    function() {
      $rootScope.$apply(function() {
        $rootScope.online = false;
        console.log("offline");
        swal(
          "Offline",
          "Internet not available, Cross check your internet connectivity and try again",
          "error"
        );
      });
    },
    false
  );

  $window.addEventListener(
    "online",
    function() {
      $rootScope.$apply(function() {
        $rootScope.online = true;
        console.log("online");
      });
    },
    false
  );
});

app.run(function($rootScope, $location, $window, $state) {
  $rootScope.$on("$stateChangeStart", function(
    event,
    toState,
    toParams,
    fromState,
    fromParams
  ) {
    $rootScope.previousState = fromState;
    if ($rootScope.isLogin == false && !localStorage.getItem("token")) {
      $location.path("/login");
    }
  });
});
