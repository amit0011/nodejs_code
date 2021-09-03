angular.module("myApp.accessService", []).service("accessService", function() {
  return {
    defaultAccess: function() {
      return {
        dashboard: {
          subMenu: false,
          viewMenu: true,
          add: true,
          edit: true,
          delete: true,
          view: true,
          selectAll: true
        },
        purchase: {
          growers: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          productionRecords: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          productionContracts: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          purchaseConfirmation: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          bidSheet: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          sampleDumpList: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          viewMenu: true,
          subMenu: true
        },
        rollover: {
          productionContracts: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          purchaseConfirmation: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          salesContract: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          viewMenu: true,
          subMenu: true
        },
        sales: {
          brokers: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          buyers: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          salesContract: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          commodityPricing: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },

          tradePurchaseContract: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          viewMenu: true,
          subMenu: true
        },
        truckScale: {
          incoming: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true,
            manualWeight: true
          },
          outgoing: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true,
            manualWeight: true
          },
          outgoingSeedSales: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          tradePurchase: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          incomingInventory: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          outgoingInventory: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          viewMenu: true,
          subMenu: true
        },
        reports: {
          commission: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          failedQuotes: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          freightVariance: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          shippedWeightAnalysis: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          position: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          salesSummary: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          forex: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          productionRecord: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          sample: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          sampleDump: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          productionContract: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          purchaseConfirmation: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          area: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          openContracts: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          performance: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          groupEmail: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          targetPrice: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          fxContract: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          fxHedge: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          growerCallBackReport: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          viewMenu: true,
          subMenu: true
        },
        setting: {
          subAdmin: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          commodities: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          commodityType: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          grade: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          analysisList: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          variety: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          pricingTerms: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          tags: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          documents: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          tradeRules: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          paymentMethod: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          paymentTerms: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          variance: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          certificateCost: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          baggings: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          bagCategory: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          eDC: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          maxWeight: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          equipment: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          freight: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          freightCompany: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          shippingLine: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          shippingTerms: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          loadingPort: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          newDestination: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          freightSettings: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          weather: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          currency: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          country: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          city: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          container: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          origin: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          town: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          trucker: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          bidPeriod: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          scaleTicketNumber: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          receiver: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          bin: {
            add: true,
            edit: true,
            delete: true,
            view: true,
            selectAll: true,
            viewMenu: true
          },
          viewMenu: true,
          subMenu: true
        }
      };
    }
  };
});
