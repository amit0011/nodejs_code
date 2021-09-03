angular
  .module("myApp.accessRole", [])
  .controller("accessRoleCtrl", function(
    $scope,
    $rootScope,
    sudAdminHttpService,
    $state,
    $stateParams,
    accessService
  ) {
    $scope.$on("access", (event, data) => {
      if (
        !data ||
        !data.setting ||
        !data.setting.subAdmin ||
        !data.setting.subAdmin.edit
      ) {
        $rootScope.isLogin = false;
        localStorage.removeItem("token");
        localStorage.removeItem("loginUserInfo");
        $state.go("login");
        swal("ERROR", "Access denied", "error");
      }
    });

    $scope.active = {
      page: "RollAccess"
    };

    $scope.all = {};

    // get login user token form local storage
    $scope.token = JSON.parse(localStorage.getItem("token"));

    $scope.purchaseSelectAll = () => {
      _.set($scope.data, "purchase.growers.selectAll", $scope.all.purchase);
      $scope.selectAll($scope.data.purchase.growers);

      _.set(
        $scope.data,
        "purchase.productionRecords.selectAll",
        $scope.all.purchase
      );
      $scope.selectAll($scope.data.purchase.productionRecords);

      _.set(
        $scope.data,
        "purchase.productionContracts.selectAll",
        $scope.all.purchase
      );
      $scope.selectAll($scope.data.purchase.productionContracts);

      _.set(
        $scope.data,
        "purchase.sampleDumpList.selectAll",
        $scope.all.purchase
      );
      $scope.selectAll($scope.data.purchase.sampleDumpList);

      _.set(
        $scope.data,
        "purchase.purchaseConfirmation.selectAll",
        $scope.all.purchase
      );
      $scope.selectAll($scope.data.purchase.purchaseConfirmation);

      _.set($scope.data, "purchase.bidSheet.selectAll", $scope.all.purchase);
      $scope.selectAll($scope.data.purchase.bidSheet);
    };

    $scope.rolloverSelectAll = () => {
      _.set(
        $scope.data,
        "rollover.productionContracts.selectAll",
        $scope.all.rollover
      );
      $scope.selectAll($scope.data.rollover.productionContracts);

      _.set(
        $scope.data,
        "rollover.purchaseConfirmation.selectAll",
        $scope.all.rollover
      );
      $scope.selectAll($scope.data.rollover.purchaseConfirmation);

      _.set(
        $scope.data,
        "rollover.salesContract.selectAll",
        $scope.all.rollover
      );
      $scope.selectAll($scope.data.rollover.salesContract);
    };

    $scope.salesSelectAll = () => {
      _.set($scope.data, "sales.brokers.selectAll", $scope.all.sales);
      $scope.selectAll($scope.data.sales.brokers);

      _.set($scope.data, "sales.buyers.selectAll", $scope.all.sales);
      $scope.selectAll($scope.data.sales.buyers);

      _.set($scope.data, "sales.salesContract.selectAll", $scope.all.sales);
      $scope.selectAll($scope.data.sales.salesContract);

      _.set($scope.data, "sales.commodityPricing.selectAll", $scope.all.sales);
      $scope.selectAll($scope.data.sales.commodityPricing);

      _.set(
        $scope.data,
        "sales.tradePurchaseContract.selectAll",
        $scope.all.sales
      );
      $scope.selectAll($scope.data.sales.tradePurchaseContract);
    };

    $scope.truckScaleSelectAll = () => {
      _.set(
        $scope.data,
        "truckScale.incoming.selectAll",
        $scope.all.truckScale
      );
      $scope.selectAll($scope.data.truckScale.incoming);

      _.set(
        $scope.data,
        "truckScale.outgoing.selectAll",
        $scope.all.truckScale
      );
      $scope.selectAll($scope.data.truckScale.outgoing);

      _.set(
        $scope.data,
        "truckScale.outgoingSeedSales.selectAll",
        $scope.all.truckScale
      );
      $scope.selectAll($scope.data.truckScale.outgoingSeedSales);

      _.set(
        $scope.data,
        "truckScale.tradePurchase.selectAll",
        $scope.all.truckScale
      );
      $scope.selectAll($scope.data.truckScale.tradePurchase);

      _.set(
        $scope.data,
        "truckScale.incomingInventory.selectAll",
        $scope.all.truckScale
      );
      $scope.selectAll($scope.data.truckScale.incomingInventory);

      _.set(
        $scope.data,
        "truckScale.outgoingInventory.selectAll",
        $scope.all.truckScale
      );
      $scope.selectAll($scope.data.truckScale.outgoingInventory);
    };

    $scope.reportsSelectAll = () => {
      _.set($scope.data, "reports.commission.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.commission);

      _.set($scope.data, "reports.failedQuotes.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.failedQuotes);

      _.set($scope.data, "reports.freightVariance.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.freightVariance);

      _.set(
        $scope.data,
        "reports.shippedWeightAnalysis.selectAll",
        $scope.all.reports
      );
      $scope.selectAll($scope.data.reports.shippedWeightAnalysis);

      _.set($scope.data, "reports.position.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.position);

      _.set($scope.data, "reports.salesSummary.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.salesSummary);

      _.set($scope.data, "reports.forex.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.forex);

      _.set(
        $scope.data,
        "reports.productionRecord.selectAll",
        $scope.all.reports
      );
      $scope.selectAll($scope.data.reports.productionRecord);

      _.set($scope.data, "reports.sample.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.sample);

      _.set($scope.data, "reports.sampleDump.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.sampleDump);

      _.set(
        $scope.data,
        "reports.productionContract.selectAll",
        $scope.all.reports
      );
      $scope.selectAll($scope.data.reports.productionContract);

      _.set(
        $scope.data,
        "reports.purchaseConfirmation.selectAll",
        $scope.all.reports
      );
      $scope.selectAll($scope.data.reports.purchaseConfirmation);

      _.set($scope.data, "reports.area.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.area);

      _.set($scope.data, "reports.openContracts.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.openContracts);

      _.set($scope.data, "reports.performance.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.performance);

      _.set($scope.data, "reports.groupEmail.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.groupEmail);

      _.set($scope.data, "reports.targetPrice.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.targetPrice);

      _.set($scope.data, "reports.fxContract.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.fxContract);

      _.set($scope.data, "reports.fxHedge.selectAll", $scope.all.reports);
      $scope.selectAll($scope.data.reports.fxHedge);

      _.set(
        $scope.data,
        "reports.growerCallBackReport.selectAll",
        $scope.all.reports
      );
      $scope.selectAll($scope.data.reports.growerCallBackReport);
    };

    $scope.settingSelectAll = () => {
      _.set($scope.data, "setting.subAdmin.selectAll", $scope.all.setting);
      $scope.selectAll($scope.data.setting.subAdmin);

      _.set($scope.data, "setting.commodities.selectAll", $scope.all.setting);
      $scope.selectAll($scope.data.setting.commodities);

      _.set($scope.data, "setting.commodityType.selectAll", $scope.all.setting);
      $scope.selectAll($scope.data.setting.commodityType);

      _.set($scope.data, "setting.grade.selectAll", $scope.all.setting);
      $scope.selectAll($scope.data.setting.grade);

      _.set($scope.data, "setting.analysisList.selectAll", $scope.all.setting);
      $scope.selectAll($scope.data.setting.analysisList);

      _.set($scope.data, "setting.variety.selectAll", $scope.all.setting);
      $scope.selectAll($scope.data.setting.variety);
    };

    $scope.salesContractSettingSelectAll = () => {
      _.set(
        $scope.data,
        "setting.pricingTerms.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.pricingTerms);

      _.set(
        $scope.data,
        "setting.tags.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.tags);

      _.set(
        $scope.data,
        "setting.documents.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.documents);

      _.set(
        $scope.data,
        "setting.tradeRules.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.tradeRules);

      _.set(
        $scope.data,
        "setting.paymentTerms.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.paymentTerms);

      _.set(
        $scope.data,
        "setting.paymentMethod.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.paymentMethod);

      _.set(
        $scope.data,
        "setting.variance.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.variance);

      _.set(
        $scope.data,
        "setting.certificateCost.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.certificateCost);

      _.set(
        $scope.data,
        "setting.eDC.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.eDC);

      _.set(
        $scope.data,
        "setting.maxWeight.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.maxWeight);

      _.set(
        $scope.data,
        "setting.baggings.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.baggings);

      _.set(
        $scope.data,
        "setting.bagCategory.selectAll",
        $scope.all.salesContractSetting
      );
      $scope.selectAll($scope.data.setting.bagCategory);
    };

    $scope.shipmentSettingSelectAll = () => {
      _.set(
        $scope.data,
        "setting.equipment.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.equipment);

      _.set(
        $scope.data,
        "setting.freight.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.freight);

      _.set(
        $scope.data,
        "setting.freightCompany.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.freightCompany);

      _.set(
        $scope.data,
        "setting.shippingLine.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.shippingLine);

      _.set(
        $scope.data,
        "setting.shippingTerms.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.shippingTerms);

      _.set(
        $scope.data,
        "setting.loadingPort.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.loadingPort);

      _.set(
        $scope.data,
        "setting.newDestination.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.newDestination);

      _.set(
        $scope.data,
        "setting.freightSettings.selectAll",
        $scope.all.shipmentSettingSetting
      );
      $scope.selectAll($scope.data.setting.freightSettings);
    };

    $scope.othercontrolSelectAll = () => {
      _.set(
        $scope.data,
        "setting.weather.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.weather);

      _.set(
        $scope.data,
        "setting.currency.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.currency);

      _.set(
        $scope.data,
        "setting.country.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.country);

      _.set(
        $scope.data,
        "setting.city.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.city);

      _.set(
        $scope.data,
        "setting.container.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.container);

      _.set(
        $scope.data,
        "setting.origin.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.origin);

      _.set(
        $scope.data,
        "setting.town.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.town);

      _.set(
        $scope.data,
        "setting.trucker.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.trucker);

      _.set(
        $scope.data,
        "setting.bidPeriod.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.bidPeriod);

      _.set(
        $scope.data,
        "setting.scaleTicketNumber.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.scaleTicketNumber);

      _.set(
        $scope.data,
        "setting.receiver.selectAll",
        $scope.all.othercontrolSetting
      );
      $scope.selectAll($scope.data.setting.receiver);
    };

    // action select all
    $scope.actionSelectAll = action => {
      // purchase

      _.set($scope.data, `dashboard.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.dashboard);

      _.set($scope.data, `purchase.growers.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.purchase.growers);

      _.set(
        $scope.data,
        `purchase.productionRecords.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.purchase.productionRecords);

      _.set(
        $scope.data,
        `purchase.sampleDumpList.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.purchase.sampleDumpList);

      _.set(
        $scope.data,
        `purchase.productionContracts.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.purchase.productionContracts);

      _.set(
        $scope.data,
        `purchase.purchaseConfirmation.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.purchase.purchaseConfirmation);

      _.set($scope.data, `purchase.bidSheet.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.purchase.bidSheet);

      // rollover

      _.set(
        $scope.data,
        `rollover.productionContracts.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.rollover.productionContracts);

      _.set(
        $scope.data,
        `rollover.purchaseConfirmation.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.rollover.purchaseConfirmation);

      _.set(
        $scope.data,
        `rollover.salesContract.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.rollover.salesContract);

      //sales

      _.set($scope.data, `sales.brokers.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.sales.brokers);

      _.set($scope.data, `sales.buyers.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.sales.buyers);

      _.set($scope.data, `sales.brokers.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.sales.brokers);

      _.set($scope.data, `sales.buyers.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.sales.buyers);

      _.set($scope.data, `sales.salesContract.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.sales.salesContract);

      _.set(
        $scope.data,
        `sales.commodityPricing.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.sales.commodityPricing);

      _.set(
        $scope.data,
        `sales.tradePurchaseContract.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.sales.tradePurchaseContract);

      //truck scale

      _.set($scope.data, `truckScale.incoming.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.truckScale.incoming);

      _.set($scope.data, `truckScale.outgoing.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.truckScale.outgoing);

      _.set(
        $scope.data,
        `truckScale.outgoingSeedSales.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.truckScale.outgoingSeedSales);

      _.set(
        $scope.data,
        `truckScale.tradePurchase.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.truckScale.tradePurchase);

      _.set(
        $scope.data,
        `truckScale.incomingInventory.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.truckScale.incomingInventory);

      _.set(
        $scope.data,
        `truckScale.outgoingInventory.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.truckScale.outgoingInventory);

      //Reports
      _.set($scope.data, `reports.position.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.position);

      _.set($scope.data, `reports.salesSummary.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.salesSummary);

      _.set($scope.data, `reports.forex.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.forex);

      _.set($scope.data, `reports.commission.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.commission);

      _.set($scope.data, `reports.failedQuotes.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.failedQuotes);

      _.set($scope.data, `reports.freightVariance.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.freightVariance);

      _.set(
        $scope.data,
        `reports.shippedWeightAnalysis.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.reports.shippedWeightAnalysis);

      _.set(
        $scope.data,
        `reports.productionRecord.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.reports.productionRecord);

      _.set($scope.data, `reports.sample.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.sample);

      _.set($scope.data, `reports.sampleDump.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.sampleDump);

      _.set(
        $scope.data,
        `reports.productionContract.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.reports.productionContract);

      _.set(
        $scope.data,
        `reports.purchaseConfirmation.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.reports.purchaseConfirmation);

      _.set($scope.data, `reports.area.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.area);

      _.set($scope.data, `reports.openContracts.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.openContracts);

      _.set($scope.data, `reports.performance.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.performance);

      _.set($scope.data, `reports.groupEmail.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.groupEmail);

      _.set($scope.data, `reports.targetPrice.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.targetPrice);

      _.set($scope.data, `reports.fxContract.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.fxContract);

      _.set($scope.data, `reports.fxHedge.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.reports.fxHedge);

      _.set(
        $scope.data,
        `reports.growerCallBackReport.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.reports.growerCallBackReport);

      //setting

      _.set($scope.data, `setting.subAdmin.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.subAdmin);

      _.set($scope.data, `setting.commodities.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.commodities);

      _.set($scope.data, `setting.commodityType.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.commodityType);

      _.set($scope.data, `setting.grade.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.grade);

      _.set($scope.data, `setting.analysisList.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.analysisList);

      _.set($scope.data, `setting.variety.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.variety);

      //sales contract setting

      _.set($scope.data, `setting.pricingTerms.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.pricingTerms);

      _.set($scope.data, `setting.tags.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.tags);

      _.set($scope.data, `setting.documents.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.documents);

      _.set($scope.data, `setting.tradeRules.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.tradeRules);

      _.set($scope.data, `setting.paymentMethod.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.paymentMethod);

      _.set($scope.data, `setting.paymentTerms.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.paymentTerms);

      _.set($scope.data, `setting.variance.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.variance);
      _.set(
        $scope.data,
        `setting.certificateCost.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.setting.certificateCost);

      _.set($scope.data, `setting.baggings.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.baggings);

      _.set($scope.data, `setting.bagCategory.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.bagCategory);

      _.set($scope.data, `setting.eDC.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.eDC);

      _.set($scope.data, `setting.maxWeight.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.maxWeight);

      //Shipment settings

      _.set($scope.data, `setting.equipment.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.equipment);

      _.set($scope.data, `setting.freight.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.freight);

      _.set(
        $scope.data,
        `setting.freightCompany.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.setting.freightCompany);

      _.set($scope.data, `setting.shippingLine.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.shippingLine);

      _.set($scope.data, `setting.shippingTerms.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.shippingTerms);

      _.set($scope.data, `setting.loadingPort.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.loadingPort);

      _.set(
        $scope.data,
        `setting.newDestination.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.setting.newDestination);

      _.set(
        $scope.data,
        `setting.freightSettings.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.setting.freightSettings);

      //Other Controls

      _.set($scope.data, `setting.weather.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.weather);

      _.set($scope.data, `setting.currency.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.currency);

      _.set($scope.data, `setting.country.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.country);

      _.set($scope.data, `setting.city.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.city);

      _.set($scope.data, `setting.container.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.container);

      _.set($scope.data, `setting.origin.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.origin);

      _.set($scope.data, `setting.town.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.town);

      _.set($scope.data, `setting.trucker.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.trucker);

      _.set($scope.data, `setting.bidPeriod.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.bidPeriod);

      _.set(
        $scope.data,
        `setting.scaleTicketNumber.${action}`,
        $scope.all[action]
      );
      $scope.checkAllOptionSelected($scope.data.setting.scaleTicketNumber);

      _.set($scope.data, `setting.receiver.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.receiver);

      _.set($scope.data, `setting.bin.${action}`, $scope.all[action]);
      $scope.checkAllOptionSelected($scope.data.setting.bin);
    };

    // add select all
    $scope.addSelectAll = () => {
      $scope.actionSelectAll("add");
    };

    // edit select all
    $scope.editSelectAll = () => {
      $scope.actionSelectAll("edit");
    };

    // view select all
    $scope.viewSelectAll = () => {
      $scope.actionSelectAll("view");
    };

    // delete select all
    $scope.deleteSelectAll = () => {
      $scope.actionSelectAll("delete");
    };

    // checked all value true
    $scope.selectAll = data => {
      if (data.selectAll) {
        data.view = data.edit = data.add = data.delete = true;
      } else {
        data.view = data.edit = data.add = data.delete = false;
      }
      updateViewMenuValue(data);
      //Object.keys(data).forEach(v => data[v] = data.selectAll);
    };

    // if view,edit,delete & add is true the update selectAll is true
    function updateSelectAllValue(data) {
      if (data.view && data.edit && data.add && data.delete)
        data.selectAll = true;
      else data.selectAll = false;
    }

    // if atlist one option true then enable viewmenu
    function updateViewMenuValue(data) {
      if (data.view || data.edit || data.add || data.delete)
        data.viewMenu = true;
      else data.viewMenu = false;
    }

    // call function
    $scope.checkAllOptionSelected = data => {
      updateSelectAllValue(data);
      updateViewMenuValue(data);
    };

    //@ get selected user access form database
    sudAdminHttpService.getAccess($stateParams.id, $scope.token).then(
      objS => {
        if (objS.data.status == 200) {
          $scope.id = objS.data.data._id;
          $scope.fullName = objS.data.data.fullName;
          $scope.data = objS.data.data.access;
          // if access roll not exit then assign default access
          if (!$scope.data || _.isEmpty($scope.data)) {
            $scope.data = $scope.defaultAccess;
          }
        }
      },
      objE => {}
    );

    $scope.update = () => {
      //@ check every object submenu value is true the
      // check atlist one object value is true then assign viewMenu is true otherwise false
      for (var key in $scope.data) {
        if ($scope.data[key].subMenu) {
          for (var inner_key in $scope.data[key]) {
            console.log(key);
            if (["viewMenu", "subMenu"].indexOf(inner_key) == -1) {
              console.log(inner_key);
              if ($scope.data[key][inner_key].viewMenu) {
                $scope.data[key].viewMenu = true;
                break;
              }
            }
            $scope.data[key].viewMenu = false;
          }
        }
      }

      // request object
      var obj = {
        _id: $scope.id,
        access: $scope.data
      };
      sudAdminHttpService.updateAccess(obj, $scope.token).then(
        objS => {
          if (objS.data.status == 200) {
            swal("Updated", objS.data.userMessage, "success");
          } else {
            swal("ERROR", objS.data.userMessage, "error");
          }
        },
        objE => {
          console.log(objE);
        }
      );
    };

    // default access menu & submenu
    $scope.defaultAccess = accessService.defaultAccess();

    $scope.selectAllHander = {};
    _.keys($scope.defaultAccess).forEach(section => {
      $scope.selectAllHander[section] = () => {
        _.set($scope.all, section, true);

        _.keys($scope.defaultAccess[section]).forEach(task => {
          if (typeof $scope.defaultAccess[section][task] !== "object") {
            return;
          }
          $scope.all[section] =
            $scope.all[section] &&
            _.get($scope.data, `${section}.${task}.selectAll`);
        });
      };
    });

    $scope.sectionSelectAll = section => {
      const sectionObj = $scope.defaultAccess[section];
      const sectionKeys = _.keys(sectionObj);

      sectionKeys.forEach(key => {
        if (typeof $scope.defaultAccess[section][key] !== "object") {
          return;
        }

        $scope.$watch(
          `data.${section}.${key}.selectAll`,
          $scope.selectAllHander[section]
        );
      });
    };

    $scope.sectionSelectAll("purchase");
    $scope.sectionSelectAll("rollover");
    $scope.sectionSelectAll("sales");
    $scope.sectionSelectAll("truckScale");
    $scope.sectionSelectAll("reports");
    $scope.sectionSelectAll("setting");
  });