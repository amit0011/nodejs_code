const IMG_URL = process.env.IMG_URL;
const PDF_WATERMARK_IMG = process.env.PDF_WATERMARK_IMG;
const image_path = process.env.IMAGE_PATH;
const { formatDate, getContractNumber } = require("../libs/utils");

module.exports = {
  tradePurchaseHtml: (data) => {
    var imgVoid = "";
    if (data.status == 2) {
      imgVoid = `background-image: url(${PDF_WATERMARK_IMG}); background-repeat: repeat-y;background-repeat: no-repeat;background-position: 50% 50%;`;
    }

    var div_list = "";
    var documents = "",
      document_name = "";

    data.shipmentScheldule.forEach((d) => {
      div_list += `<div style="margin: 0;padding: 0px;float: left;width: 100%;">
                                  <p style="margin: 0;padding: 0;float: left;width: 40%;font-size: 8px;color: #000;">${
                                    d.shipmentType
                                  }</p>
                                  <p style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">${d.startDate}</p>
                                  <p style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">${d.endDate}</p>
                                  <p style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;text-align: center;">${
                                    d.units
                                  }</p>
                                  <p style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;text-align: center;">${
                                    d.quantity
                                  }</p>
                                </div>`;
    });

    data.documents.forEach((doc, index) => {
      document_name += `<span>${doc.documents} ${
        index == data.documents.length - 1
          ? "."
          : index == data.documents - 2
          ? " and "
          : ","
      }</span>`;
    });

    documents = `<p style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;">Sets of documents must also include:${document_name}</p>`;

    var html =
      `<div>
            <div style="float: left;margin: 0;padding: 0;${imgVoid}">
                <div style="margin: 0;padding: 0 0 5px 0;float: left;width: 100%;border-bottom: 2px solid #cdcdcd;">
                    <div style="margin: 0;padding: 0;float: left;width: 70%;">
                        <img src="${IMG_URL}" style="margin: 0 5% 0 0;padding: 0;float: left;width: 25%;">
                    </div>
                    <div style="margin: 0;padding: 0;float: right;width: 30%;text-align:left">

                        <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 12px;">RUDY AGRO LTD.</h2>
                        <h3 style="margin: 1px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;" > Box 100, Outlook Sask.S0L 2N0</h3>
                        <a style="margin: 1px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Tel (306) 867-8667</a>
                        <a style="margin: 1px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Fax (306 867-8290</a>


                    </div>
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <h1 style="margin: 0 0 10px 0;padding: 0;float: left;width: 100%;text-align: center;font-size: 12px;color: #000;">COMMODITY PURCHASE AGREEMENT <br> Between Rudy Agro Ltd and:</h1>

                    ${
                      data.amended && data.amended == true && data.printAmended
                        ? `<div style="margin: 0;padding: 0;float: left;width: 100%;">
                        <p style="margin: 0;padding: 0;text-align: right;width: 90%;font-size: 8px;color: #000;">
                            <span style="${
                              data.amended && data.amended == true
                                ? "color:red"
                                : ""
                            }">${
                            data.amended && data.amended == true
                              ? "(Amended)"
                              : ""
                          }</span>
                        </p>
                    </div>`
                        : ""
                    }

                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">SELLER:</b>
                        <p style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;">${
                          data.buyerId.businessName
                        }
                        <br> ${data.buyerId.addresses[0].street}
                        <br> ${data.buyerId.addresses[0].city}, ${
                          data.buyerId.addresses[0].postal
                        }, ${data.buyerId.addresses[0].country}
                        <br> <span>${
                          data.buyerId.cellNumber ? "Cell" : "PH"
                        }- ${
                          data.buyerId.cellNumber ? data.buyerId.cellNumber : data.buyerId.phone
                        },
                        </span><br></p>
                    </div>
                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <div style="margin: 0;padding: 0;float: left;width: 100%;">
                            <p style="margin: 0;padding: 0;float: left;width: 50%; text-align: right;font-size: 8px;color: #000;font-weight: bold;">DATE:</p>
                            <p style="margin: 0;padding: 0;float: left;width: 30%; text-align: right;font-size: 8px;color: #000;"> ${formatDate(
                              data.date
                            )}</p>
                        </div>
                        <div style="margin: 0;padding: 0;float: left;width: 100%;">
                            <b style="margin: 0;padding: 0;float: left;width: 50%; text-align: right;font-size: 8px;color: #000;">CONTRACT #:</b>
                            <b style="margin: 0;padding: 0;float: left;width: 30%; text-align: right;font-size: 8px;color: #000;font-weight: 400;">${getContractNumber(
                              data
                            )}</b>
                        </div>

                        ${
                          data.buyerReferenceNumber
                            ? `<div style="margin: 0;padding: 0;float: left;width: 100%;">
                            <b style="margin: 0;padding: 0;float: left;width: 50%; text-align: right;font-size: 8px;color: #000;">Buyer Ref #:</b>
                            <b style="margin: 0;padding: 0;float: left;width: 30%; text-align: right;font-size: 8px;color: #000;font-weight: 400;">${data.buyerReferenceNumber}</b>
                        </div>`
                            : ""
                        }

                        ${
                          data.showBroker
                            ? `
                        <div style="margin: 0;padding: 0;float: left;width: 100%;">
                            <b style="margin: 0;padding: 0;float: left;width: 50%; text-align: right;font-size: 8px;color: #000;">Broker #:</b>
                            <b style="margin: 0;padding: 0;float: left;width: 30%; text-align: right;font-size: 8px;color: #000;font-weight: 400;">${data.brokerId.businessName}</b>
                        </div>
                        <div style="margin: 0;padding: 0;float: left;width: 100%;">
                            <b style="margin: 0;padding: 0;float: left;width: 50%; text-align: right;font-size: 8px;color: #000;">Broker Ref #:</b>
                            <b style="margin: 0;padding: 0;float: left;width: 30%; text-align: right;font-size: 8px;color: #000;font-weight: 400;">${data.brokerNumber}</b>
                        </div>`
                            : ""
                        }
                    </div>
                </div>
                <div style="margin: 20px 0 0 0;padding: 0;float: left;width: 100%;">
                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">COMMODITY:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;font-weight: 400;">${
                          data.commodityId.commodityAlias
                        }</b>
                    </div>
                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">GRADE:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;font-weight: 400;">${
                          data.gradeId.gradeName
                        }</b>
                    </div>
                </div>
                <div style="margin: 15px 0 0 0;padding: 0;float: left;width: 100%;">
                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">ORIGIN:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;font-weight: 400;">${
                          data.countryId
                        }</b>
                    </div>

                </div>
                <div style="margin: 15px 0 0 0;padding: 0;float: left;width: 100%;">
                    <div style="margin: 0;padding: 0;float: left;width: 100%;">
                        <b style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;"></b>
                    </div>
                </div>
                <div style="margin: 15px 0 0 0;padding: 0;float: left;width: 100%;">
                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">PACKING UNIT:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;font-weight: 400;">${
                          data.packingUnit.name
                        }</b>
                    </div>
                    ${
                      data.packingUnit.bulkBag != "Bulk" || data.tag == "Yes"
                        ? `
                    <div style="margin: 0;padding: 0;float: left;width: 50%;">
                        <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">WITH TAGS:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;font-weight: 400;">${
                          data.tagType ? data.tagType.tags : ""
                        }</b>
                    </div>`
                        : ""
                    }
                </div>

                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">CONTRACTED QUANTITY:</b>
                    ${
                      data.packingUnit.bulkBag == "Bag"
                        ? `
                    <p style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;">${
                      data.contractQuantity
                    } ${data.units} ${data.variance.varianceName}, packed in ${
                            data.packedIn
                          } x ${data.equipmentType.equipmentName} of ${
                            data.loadingType ==
                            `Palletized and
                        Shrink Wrapped`
                              ? data.noOfPallets + `Pallets ` + data.noOfBags
                              : data.noOfBags
                          } x ${
                            data.bagWeight
                              ? data.bagWeight
                              : data.packingUnit.bagWeightUnit
                          } each. Total of ${data.contractQuantity} ${
                            data.units
                          }</p>`
                        : ""
                    }
                      ${
                        data.packingUnit.bulkBag == "Bulk"
                          ? `
                    <p style="margin: 0;padding: 0;float: left;width: 70%;font-size: 8px;color: #000;">${data.contractQuantity} ${data.units} ${data.variance.varianceName}, packed in ${data.packedIn} x ${data.equipmentType.equipmentName} Total of ${data.contractQuantity} ${data.units}</p>`
                          : ""
                      }
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <div style="margin: 0;padding: 0;float: left;width: 100%;">
                        <b style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;"></b>
                    </div>
                </div>

                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">SHIPPING COMMENT:</b>
                    <p style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;">${
                      data.shippingOption
                    }, ${data.shippingComment}</p>
                </div>
                <div style="margin: 20px 0 0 0;padding: 0;float: left;width: 98%;">
                    <div style="margin: 0 0 5px 0;padding: 0px;float: left;width: 100%;">
                        <b style="margin: 0;padding: 0;float: left;width: 40%;font-size: 8px;color: #000;">SHIPPING SCHEDULE:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;"> START DATE</b>
                        <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">END DATE</b>
                        <b style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;text-align: center;">UNITS</b>
                        <b style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;text-align: center;">QTY</b>
                    </div>
                    <div style="margin: 0;padding: 10px 0;float: left;width: 100%;border: 2px solid #cdcdcd;border-radius: 5px;">` +
      div_list +
      `</div>
                </div>
                <div style="margin: 20px 0 0 0;padding: 0;float: left;width: 100%;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">CONTRACT PRICE:</b>
                    <b style="margin: 0;padding: 0;float: left;width: 40%;font-size: 8px;color: #000;font-weight: 400;">${
                      data.contractCurrency
                    } ${data.amount} ${data.amountUnit} ${
        data.pricingTerms && data.pricingTerms.pricingTerms
          ? data.pricingTerms.pricingTerms
          : ""
      }</b>
                    <p style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">TL UNITS: ${
                      data.packedIn
                    }</p>
                    <p style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">TL QTY: ${
                      data.contractQuantity
                    } ${data.units}</p>
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">

                        <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">DESTINATION:</b>
                        <b style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;font-weight: 400;">${
                          data.destination
                        } , ${data.country}</b>
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;font-size: 8px;color: #000;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">PAYMENT METHOD:</b>
                    <b style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;font-weight: 400;"> ${
                      data.paymentMethod && data.paymentMethod.paymentMethod
                        ? data.paymentMethod.paymentMethod
                        : ""
                    }</b>
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;font-size: 8px;color: #000;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">PAYMENT TERM:</b>
                    <b style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;font-weight: 400;"> ${
                      data.paymentTerms && data.paymentTerms.paymentTerms
                        ? data.paymentTerms.paymentTerms
                        : ""
                    }</b>
                </div>
                ${
                  data.showDocuments
                    ? `<div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">DOCUMENTS:</b>` +
                      documents
                    : ``
                }
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">TRADE RULES:</b>
                    <p style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;">When not in conflict with the terms of this contract, ${
                      data.tradeRules && data.tradeRules.tradeRules
                        ? data.tradeRules.tradeRules
                        : ""
                    } will apply.</p>
                </div>
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
                    <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">OTHER CONDITIONS:</b>
                    <p style="margin: 0;padding: 0;float: left;width: 80%;font-size: 8px;color: #000;">${
                      data.otherConditions
                    } ${
        data.sampleApproval == true ? "Subject to sample approval." : ""
      } <b>Thank-you for your business!</b></p>
                </div>
                <div style="margin: 30px 0 0 0;padding: 0;float: left;width: 100%;">
                    <p style="margin: 0;padding: 0;float: left;width: 50%;">
                        <img src="${image_path}${
        data.createdBy.signature
      }" alt="" style="width: 240px;height:80px;margin: 0;float: left;border-bottom: 2px solid #000;padding: 0 50px 0 0;">
                        <i style="margin: 5px 0 0 0;padding: 0;width: 100%;float: left;font-size: 8px;color: #000;">Accepted for Rudy Agro Ltd</i>
                    </p>
                    <p style="margin: 75px 0 0 0;padding: 0;float: right;width: 50%;">
                        <i style="margin: 5px 0 0 0;padding: 0;width: 65%;float: right;font-size: 8px;color: #000;border-top: 2px solid #000;">Accepted for Seller</i>
                    </p>
                </div>
            </div>
        </div>`;
    return html;
  },
};
