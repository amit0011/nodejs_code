var IMG_URL = process.env.IMG_URL;
var moment = require('moment');
const {formatDate, roundOff, getContractNumber, checkListsDefault} = require('../libs/utils');

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

function calculateExchageRate(d, data) {
  var totalMonthDiff = monthDiff(new Date(data.date), new Date(d.endDate)) + 1;
  return (data.exchangeRate - data.exchangeDeduction * totalMonthDiff).toFixed(
    4
  );
}

module.exports = {
  salesStampHtml: (data) => {
    var shipmentSchedule = "";

    const checkLists = data.checkLists ? data.checkLists.map(clst => {
      var checkList = checkListsDefault.find(cl => cl.code === clst.code);
      return checkList ? {...clst, name: checkList.name} : clst;
    }) : [];

    data.shipmentScheldule.forEach((d) => {
      shipmentSchedule += `<div style="margin: 0;padding: 0px;float: left;width: 100%;">
                <p style="margin: 0;padding: 0;float: left;width: 40%;font-size: 8px;color: #000;">${
                  d.shipmentType
                }</p>
                <p style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">${moment(
                  d.endDate
                ).add(1, 'M').format("YYYY-MM")}</p>
                <p style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">${roundOff(
                  (d.quantity * 100) / data.contractQuantity,
                  2
                )}</p>
                <p style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;">${calculateExchageRate(
                  d,
                  data
                )}</p>
              </div>`;
    });
    let freightOption = " ";
    if (data.freightCompanyId) {
      freightOption = `${
        data.freightCompanyId.freightCompanyId.freightCompanyName
      } ${
        data.freightCompanyId.shiplineId
          ? data.freightCompanyId.shiplineId.shipLineName
          : ""
      }`;
    }
    if (data.loadingPortId) {
      freightOption += " " + data.loadingPortId.loadingPortName;
    }
    if (data.equipmentId) {
      freightOption += " " + data.equipmentId.equipmentName;
    }

    var html = `<div>
  <div style="background: #fff;float: left;margin: 0;padding: 0;">
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
    <div>
      <div style="margin: 10px 0 0 0;padding: 0;float: left;width: 100%;">
        <h2 style="margin: 0 0 10px 0;padding: 0;float: left;width: 100%;text-align: center;font-size: 12px;color: #000;">SALE STAMP</h2>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">DATE:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${formatDate(
              data.date
            )}</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <b style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;">CONTRACT #:</b>
            <b style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${getContractNumber(data)}</b>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Contract Price/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${roundOff(
              data.pricePerCWT,
              2
            )}</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Exchange Rate:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${roundOff(
              data.exchangeRate,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Contract Quantity (CWT):</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${roundOff(
              data.qtyCWT,
              4
            )}</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">No of Shipments:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
              data.noOfShipment
            }</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">FCL’s/shipment:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.packedIn
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Brokerage Commission:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${roundOff(
              data.brokerageCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Brokerage/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${roundOff(
              data.commisionCWT,
              4
            )}</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Ocean freight + $100/FC:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.oceanFreightBL,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">FCL/Shipment:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.packedIn
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Ocean frt/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.oceanFreightCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Bl/fee:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${
              data.blFee
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">BL/fee per CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.blFeeCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;color: #fff;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #fff;font-weight: bold;">Bl/fee:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #fff;">$${
              data.blFee
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Total Freight/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.totalBlFeeCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Documentation Costing:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${
              data.documentCosting
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Document cost/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.documentCostingCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">LC Costing:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
              data.lcCost
            }%</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">LC Costing/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.lcCostCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Insurance Rate:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
              data.insuranceRate
            }%</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Insurance Rate CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.insuranceRateCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">ARI Policy:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
              data.ariPolicy
            }%</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">ARI Policy CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.ariPolicyCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Price in USD:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.priceUSD,
              2
            )}</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Price in CAD:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.priceCAD,
              2
            )}</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">CA$ Price/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.cadCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Interest days:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.interestDays
            } Days @${roundOff(data.interestRate, 2)}%</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Interest Rate/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.interestRateCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Stuffing:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.stuffingType
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Stuffing/CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.stuffingCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Inland Freight:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
              data.inlineFreight
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Inland Freight CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.inlineFreightCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Bag Type:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.packingUnit.name
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Bag Cost CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.bagCostCWT,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Certificate of Analysis:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.certificateAnalysis.certificateName
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">COA Cost CWT:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.coaCost,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Inland freight stuffing buffer:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;"> ${
              data.stuffingBuffer
            }</p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Misc Type - ${
              data.missCost1
            }:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.missCostCWT1,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Freight option:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">
              ${freightOption}
            </p>
          </div>
          <div style="margin: 0;padding: 0;float: right;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Misc Type - ${
              data.missCost2
            }:</p>
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;">$${roundOff(
              data.missCostCWT2,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
          </div>
          <div style="margin: 0;padding: 0;float: right;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Adjustment:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">$${roundOff(
              data.adjustment,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">

          </div>
          <div style="margin: 0;padding: 2px;float: right;width: 50%;border-top: 2px solid #000;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Net FOB(CAD):</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;font-weight: bold;">$${roundOff(
              data.netFOBCAD,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
          </div>
          <div style="margin: 0;padding: 0;float: right;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Target FOB(CAD):</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;font-weight: bold;">$${roundOff(
              data.targetFOBCAD,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 0 0px 2px 0px;padding: 0;float: left;width: 100%;">
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Special Plant Instructions:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">
              ${checkLists.filter(cl => cl.checked).map(cl => cl.name).join(', ')}
            </p>
          </div>
          <div style="margin: 0;padding: 0;float: left;width: 50%;">
            <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Over/Under Target:</p>
            <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;font-weight: bold;">$${roundOff(
              data.underTarget,
              4
            )}</p>
          </div>
        </div>
        <div style="margin: 5px 0 0 0;padding: 0;float: left;width: 98%;">
          <div style="margin: 0 0 5px 0;padding: 0px;float: left;width: 100%;">
            <b style="margin: 0;padding: 0;float: left;width: 40%;font-size: 8px;color: #000;">CURRENCY POSITION:</b>
            <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">DATE</b>
            <b style="margin: 0;padding: 0;float: left;width: 20%;font-size: 8px;color: #000;">% Ship</b>
            <b style="margin: 0;padding: 0;float: left;width: 10%;font-size: 8px;color: #000;">Exchange</b>
          </div>
          <div style="margin: 0;padding: 10px;float: left;width: 100%;border: 2px solid #cdcdcd;border-radius: 5px;">
            ${shipmentSchedule}
          </div>
        </div>
        <div style="margin: 20px 0 0 0;padding: 0;float: left;width: 98%;">
          <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
            <div style="margin: 0;padding: 0;float: left;width: 50%;">
              <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Contract Signture Required:</p>
              <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
                data.contractSignature ? "Yes" : "No"
              }</p>
            </div>
            <div style="margin: 0;padding: 0;float: left;width: 50%;">
              <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Shipment on Hold:</p>
              <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
                data.shipmentHold ? "Yes" : "No"
              }</p>
            </div>
          </div>
          <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
            <div style="margin: 0;padding: 0;float: left;width: 50%;">
              <b style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;">Why on Hold:</b>
              <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
                data.whyOnHold ? data.whyOnHold : ""
              }</p>
            </div>
            <div style="margin: 0;padding: 0;float: left;width: 50%;">
              <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Quality Certificate (State Type):</p>
              <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
                data.certificateAnalysis
                  ? data.certificateAnalysis.certificateName
                  : ""
              }</p>
            </div>
          </div>

          <div style="margin: 0 0px 6px 0px;padding: 0;float: left;width: 100%;">
            <div style="margin: 0;padding: 0;float: left;width: 50%;">
              <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Shipping Line:</p>
              <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
                data.shipLine ? data.shipLine : ""
              }</p>
            </div>
            <div style="margin: 0;padding: 0;float: left;width: 50%;">
              <p style="margin: 0;padding: 0;float: left;width: 50%;font-size: 8px;color: #000;font-weight: bold;">Quote reference:</p>
              <p style="margin: 0;padding: 0;float: left;width: 30%;font-size: 8px;color: #000;">${
                data.quoteReference ? data.quoteReference : ""
              }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

    return html;
  },
};
