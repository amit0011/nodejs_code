const IMG_URL = process.env.IMG_URL;
const image_path = process.env.IMAGE_PATH;
const { formatDate, getContractNumber } = require("../libs/utils");

module.exports = {
  straightBillOfLadingHtml: (scales) => {
    let data = scales[0];
    var ba = data.buyerId.addresses[0];
    if (data.buyerAddressId) {
      ba = data.buyerId.addresses.find(
        (address) => address._id.toString() == data.buyerAddressId.toString()
      );
    }

    const weightInKg = scales.reduce((acc, scale) => acc + (+scale.invoicedWeight || +scale.productWeight), 0);

    var html = `<div>
            <div style="background: #fff;float: left;margin: 0;padding: 0;">
                <div style="margin: 0;padding: 0 0 5px 0;float: left;width: 100%;border-bottom: 2px solid #444;">
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
                <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;border: 1px solid #ccc; font-size: 10px;">
                    <table style="font-size:10px;margin-bottom: 0;width: 100%;border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="border-bottom: 1px solid #ccc;font-size:13px;padding:10px;" colspan="6">
                                    STRAIGHT BILL OF LADING - NOT NEGOTIABLE
                                </th>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ccc;text-align: center;padding:5px;border-left:none;" colspan="3">
                                    <table style="font-size:10px;width:98%;">
                                    <tbody>
                                        <tr>
                                            <th style="text-align:left;">Shipping Date</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${formatDate(
                                              data.date
                                            )}</td>
                                        </tr>
                                        <tr>
                                            <th style="text-align:left;">Name of Carrier</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${
                                              data.truckingCompany
                                                ? data.truckingCompany
                                                    .truckerName
                                                : ""
                                            }</td>
                                        </tr>
                                        <tr>
                                            <th style="text-align:left;">Trailer#</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${
                                              data.trackUnit || data.containeNumber || ""
                                            }</td>
                                        </tr>
                                        <tr>
                                            <th style="text-align:left;">PO No</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${
                                              data.shippingNumber || ""
                                            }</td>
                                        </tr>

                                        <tr>
                                            <th style="text-align:left;">SEAL#</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${
                                              data.seal
                                            }</td>
                                        </tr>
                                        <tr>
                                            <th style="text-align:left;">Contract #</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${getContractNumber(
                                              data
                                            )}${
                                              data.contractExtra ? "-" + data.contractExtra : ""
                                            }</td>
                                        </tr>
                                        <tr>
                                            <th style="text-align:left;">PAPS #</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${
                                              data.papsNumber || ""
                                            }</td>
                                        </tr>
                                        <tr>
                                            <th style="text-align:left;">Booking #</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${
                                              data.bookingNumber || ""
                                            }</td>
                                        </tr>
                                        ${
                                          data.morrowLoadNumber
                                            ? `
                                          <tr>
                                            <th style="text-align:left;">Broker Load #</th>
                                            <td style="border-bottom: 1px solid #ccc;text-align: left;">${data.morrowLoadNumber}</td>
                                          </tr>
                                          `
                                            : ""
                                        }

                                    </tbody>
                                    </table>
                                </td>
                                <td style="border: 1px solid #ccc;padding: 8px;border-right:none;" colspan="3">
                                    <strong>Consignee</strong><br />
                                    ${
                                      data.useNewAddress
                                        ? data.newAddress.replace(
                                            /\n/g,
                                            "<br/>"
                                          )
                                        : data.stuffer
                                        ? `${data.stuffer.freightCompanyName} <br/>
                                        ${data.stuffer.addressLine1},<br/>
                                        ${data.stuffer.province}, ${data.stuffer.postalCode} ${data.stuffer.country}`
                                        : data.buyerId.businessName +
                                          "<br/>" +
                                          ba.street +
                                          "<br/>" +
                                          ba.city +
                                          " " +
                                          ba.postal +
                                          " " +
                                          ba.country
                                    }
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th style="border: 1px solid #ccc;border-left:none;">Commodity</th>
                                <th style="border: 1px solid #ccc;">Grade</th>
                                <th style="border: 1px solid #ccc;">Lot #</th>
                                <th style="border: 1px solid #ccc;">Quantity</th>
                                <th style="border: 1px solid #ccc;">Packing</th>
                                <th style="border: 1px solid #ccc;border-right:none;">Weight</th>
                            </tr>
                            ${
                              scales.map(scale => `
                                <tr>
                                  <td style="border: 1px solid #ccc;text-align:center;border-left:none;">${
                                    scale.commodityId.commodityAlias
                                  }</td>
                                  <td style="border: 1px solid #ccc;text-align:center;">${
                                    scale.gradeId.gradeName
                                  }</td>
                                  <td style="border: 1px solid #ccc;text-align:center;">${
                                    scale.lotNumber
                                  }</td>
                                  <td style="border: 1px solid #ccc;text-align:center;">${
                                    scale.numberOfBags || ""
                                  }</td>
                                  <td style="border: 1px solid #ccc;text-align:center;">${
                                    scale.bagId
                                      ? scale.bagId.bagWeight +
                                        " " +
                                        scale.bagId.bagWeightUnit
                                      : ""
                                  }</td>
                                  <td style="border: 1px solid #ccc;text-align:center;border-right:none;">${(
                                    (scale.invoicedWeight || scale.productWeight) *
                                    2.20462
                                  ).toFixed(0)} LBS</td>
                                </tr>
                              `).join('')
                            }
                            <tr style="height: 50px">
                                <td style="border: 1px solid #ccc;text-align:center;border-left:none;">&nbsp;</td>
                                <td style="border: 1px solid #ccc;text-align:center;"></td>
                                <td style="border: 1px solid #ccc;text-align:center;"></td>
                                <td style="border: 1px solid #ccc;text-align:center;"></td>
                                <td style="border: 1px solid #ccc;text-align:center;"></td>
                                <td style="border: 1px solid #ccc;text-align:center;border-right:none;"></td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="border: 1px solid #ccc;padding:5px;text-align:right;border-left:none;" colspan="5">Weight (LBS)</td>
                                <th style="border: 1px solid #ccc;border-right:none;">${(weightInKg * 2.20462).toFixed(0)}</th>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ccc;padding:5px;text-align:right;border-left:none;" colspan="5">Weight (KG)</td>
                                <th style="border: 1px solid #ccc;border-right:none;">${weightInKg.toFixed(0)}</th>
                            </tr>
                        </tfoot>
                    </table>
                    <br/>
                    <b style="margin-left:5px;">FDA # </b> ${
                      data.fdaNumber ? data.fdaNumber : ""
                    }<br/>
                    <b style="margin-left:5px;">Freight Charges for the account of </b> ${
                      data.printAFBAsFcAccountOf ? (data.actualFreightBy.freightCompanyName || "Rudy Agro Ltd") : (data.fcAccountOf || "Rudy Agro Ltd")
                    }
                    <br/>
                    <br/>
                    <table style="font-size:10px;margin-bottom: 0;width: 100%;border-collapse: collapse;">
                        <tfoot>
                            <tr style="height:30px;">
                                <td style="border: 1px solid #ccc;width:10%;border-right:none;border-left:none;vertical-align:middle;">
                                    <span style="float: left;font-size: 10px;">Shipper:</span>
                                </td>
                                <td style="border: 1px solid #ccc;width:40%;border-left:none;vertical-align:bottom;" colspan="3" >
                                    ${"Rudy Agro Ltd."}
                                </td>
                                <td style="border: 1px solid #ccc;width:50%;border-right:none;" >
                                    <span style="float: left;font-size: 10px;">Per: </span>
                                    ${
                                      data.createdBy && data.createdBy.signature
                                        ? `<img src="${
                                            image_path +
                                            data.createdBy.signature
                                          }" />`
                                        : ""
                                    }
                                </td>
                            </tr>
                            <tr style="height:30px;">
                                <td style="border: 1px solid #ccc;width:10%;border-right:none;border-left:none;vertical-align:middle;">
                                    <span style="float: left;font-size: 10px;">Carrier: </span>
                                </td>
                                <td style="border: 1px solid #ccc;width:40%;border-left:none;vertical-align:bottom;" colspan="3" >
                                    ${
                                      data.truckingCompany
                                        ? data.truckingCompany.truckerName
                                        : ""
                                    }
                                </td>
                                <td style="border: 1px solid #ccc;width:50%;border-right:none;" >
                                    <span style="float: left;font-size: 10px;">Per: </span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                    <table style="font-size:10px;width: 100%;margin-bottom: 0;border-collapse: collapse;">
                        <tbody>
                            <tr>
                                <td style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;padding:10px;">
                                    <div>
                                      ${
                                        data.blComments
                                          ? `<div style="float: left;overflow: hidden;max-height:50px"><b>Comment: </b> ${data.blComments}</div>`
                                          : ""
                                      }
                                        <table style="font-size:10px;width: 100px;border-collapse:collapse;float:right;">
                                            <tr>
                                                <td style="border:1px solid #ccc;padding:6px;">BL</td>
                                                <td style="border:1px solid #ccc;padding:6px;">${
                                                  scales.reduce((acc, scale) => (
                                                    (scale.invoicedWeight || scale.productWeight) > acc.weight ? {weight: (scale.invoicedWeight || scale.productWeight), ticketNumber: scale.ticketNumber} : acc),
                                                    {weight: 0, ticketNumber: ''}).ticketNumber
                                                }</td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <br/>
                    <br/>
                    <table style="font-size:10px;margin-bottom: 0;width: 100%;border-collapse: collapse;">
                        <tfoot>
                            <tr>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%;border-left:none;">EMAIL</td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%"></td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%">INV</td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%">BINV</td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%"></td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%"></td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%">TU</td>
                                <td style="border: 1px solid #ccc;padding:6px;width:12.5%;border-right:none;">SI</td>
                            </tr>
                            <tr>
                                <td style="border: 1px solid #ccc;padding:10px;border-left:none;">&nbsp;</td>
                                <td style="border: 1px solid #ccc;padding:10px;"></td>
                                <td style="border: 1px solid #ccc;padding:10px;"></td>
                                <td style="border: 1px solid #ccc;padding:10px;"></td>
                                <td style="border: 1px solid #ccc;padding:10px;"></td>
                                <td style="border: 1px solid #ccc;padding:10px;"></td>
                                <td style="border: 1px solid #ccc;padding:10px;"></td>
                                <td style="border: 1px solid #ccc;padding:10px;border-right:none;"></td>
                            </tr>
                            ${
                              data.commodityId.organic &&
                              data.buyerId.addresses &&
                              data.buyerId.addresses[0] &&
                              data.buyerId.addresses[0].country === "USA"
                                ? `<tr><td style="vertical-align: bottom; padding: 5px 15px 5px 5px; text-align:center;font-size:8px;" colspan="8">
                                  Certified in compliance with the terms of the US-Canada Organic Equivalency Arrangement.
                                  </td></tr>`
                                : ""
                            }
                            <tr>
                                <td style="vertical-align: bottom; padding: 5px 15px 5px 5px; text-align:center;font-size:8px;" colspan="8">
                                    HARVESTED IN CANADA; ELIGIBLE UNDER THE W.G.T.A; THE PROPERTY IS BEING
                                    SHIPPED FOR EXPORT AND THE FREIGHT TRANSPORTATION SERVICE TO BE SUPPLIED
                                    BY THE CARRIER IS PART OF A CONTINUOUS OUTBOUND FREIGHT MOVEMENT IN
                                    RESPECT OF THE PROPERTY.
                                </td>
                            </tr>

                        </tfoot>
                    </table>
                </div>
            </div>
        </div>`;
    return html;
  },
};
