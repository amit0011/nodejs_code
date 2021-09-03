var IMG_URL = process.env.IMG_URL;
const PDF_WATERMARK_IMG =process.env.PDF_WATERMARK_IMG;
const {
  formatDate,
  roundOff,
  inWords,
  getContractNumber,
} = require("../libs/utils");

const checkboxImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABtklEQVQ4T6WTUWoCMRBAM9GAorCCIKIsLCr4IdIFL9CeoPYE9gj2Ju0N7A3sCbpH2Ar7oSy6ICgsiPrh12KmzNAs27J+NV+ZJO8lM0lA/LMB8aPRyNJaz4UQ93k+RBz7vv+RN8eC4XD4CQC5sJTy2ff9dwPTZkmSeEIIb7FYvLBgMBjgz4KZlHJmFmutT0EQfJm40+lYpVLJAwCXBEEQPLCg3++zABHd1WqVAtkjE6yUop0JpjZdLpdvLOj1eiwIw5Djbrc7AYCp1vp+vV6fCZZSZuF5GIZPtJYBx3FYEEUROI4zEUKYNHwAGCMiFdjsHEkpXRKnAtu2WbDdbsH0b91usVh0N5sNp2nb9iOfoNVqsWC320G73Z4gYlrIrAgRp/v9/o3Gms3mhArOgkajwYI4jjmmSa31X8k8jmPOO8swUK/XWXA4HDj+GcvWItJau8fjkfPOMgxYlsWC8/mcCiiu1WqUzis9stPp9Ot6DcNAtVpN38Hlcsl9B9laVCqVOwDwaYwF5XLZCGbX6/U1SZKbEqXUXaFQmALAcypQSn3e+kjZnXP6nsnZAoD5rQ+VJ0FEj37pN4I+tsMaAXGoAAAAAElFTkSuQmCC';
function getGrowerName(data) {
  if (data.growerOrBuyer === "Buyer") {
    return data.buyerId ? data.buyerId.businessName : "";
  }

  if (data.displayOnTicket) {
    if (data.displayOnTicket == "Grower Name") {
      return data.growerId.firstName + " " + data.growerId.lastName;
    } else {
      return data.growerId.farmName;
    }
  } else return data.growerId.farmName;
}

function getShowAllowValue(data) {
  if (data.commodityId.commodityTypeId == "5ba535fde623a2362e4b3685") {
    return true;
  }
  return [
    "Small Green Lentils (Eston)",
    "Richlea Lentils",
    "Large Green Lentils",
    "Large Green Lentils (Laird type)",
    "Crimson Lentils",
    "Small Green Lentils (Eston Type)",
  ].includes(data.commodityId.commodityName);
}

module.exports = {
  incomingScaleTicket: (data) => {
    if (
      data.commodityId &&
      data.commodityId.commodityShowDeliveryAnalysis &&
      data.commodityId.commodityShowDeliveryAnalysis.length
    ) {
      var allCommodity = data.commodityId.commodityShowDeliveryAnalysis.map(
        (e) => {
          return e.toString();
        }
      );

      data.analysis.forEach((val) => {
        val.show =
          allCommodity.indexOf(val.analysisId._id.toString()) != -1
            ? true
            : false;
      });
    }
    let imgVoid = '';
    if(data.void){
      imgVoid = `background-image: url(${PDF_WATERMARK_IMG}); background-repeat: repeat-y;background-repeat: no-repeat;background-position: 50% 20%;`;
    }

    var cancel_icon_base_64 =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABMUlEQVRIia2WQUoDQRBF3528Qu4guFCCoG4EDSZEkqzEhRgFPYkeQm/g1lVAceVmFiKoi6REOnnUxJkPvemuqjf076lugA3gCXgBjmhHO8AMeAY6AK/A958xaAjoFvUqiokYk38CDqQeh7LQWxOwK3XOImAgAeOagH3JvywDJxKYeVR6EOPWEnqSYB6ZBxfJhzGSxGERZx7cZICQeRSgbVlf8iCTeXQn89frAkJDKdgaIHQKfEjxT+CqKSB0L5CHtgBd4F0gFdBvCrBjmh3v2rIf7bEtkLWK6WLdOkPta2JPCpTH1I73KAOYB/YfGEi3ztr11BIW6kveUlM1D+o2u7Hk/3q0JQFpuy5kW3cM8LViQS+cRNZUqYqJzINMq64JOszfR2/AeUNA6IT5U2sGbP4AdHcAmGH7hq8AAAAASUVORK5CYII=";
    var analysis = "";
    var showKabuliSize =
      data.commodityId.commodityName == "Kabuli Chick Peas" ? true : false;
    var growerFullName = getGrowerName(data);
    var showAllow = getShowAllowValue(data);
    var netWeightInWord = inWords(roundOff(data.netWeight), 3);
    var unloadWeidhtInWord = inWords(roundOff(data.unloadWeidht), 3);
    var specialImg = "",
      interimImg = "",
      primaryImg = "",
      nonCgaImg = "",
      nonProducerImg = "";
    const addresses =
      data.growerOrBuyer === "Buyer"
        ? data.buyerId.addresses
        : data.growerId.addresses;

    if (data.receiptType == "Special Bin Elevator Receipt") {
      specialImg = cancel_icon_base_64;
    } else if (data.receiptType == "Interim Primary Elevator Receipt") {
      interimImg = cancel_icon_base_64;
    } else if (data.receiptType == "Primary Elevator Receipt") {
      primaryImg = cancel_icon_base_64;
    }else if (data.receiptType == "Non CGA Grain "){
      nonCgaImg = cancel_icon_base_64;
    }else if (data.receiptType == "Non Producer purchase "){
      nonProducerImg = cancel_icon_base_64;
    }
    let countAnalysis = 2;
    data.analysis.forEach((val) => {
      let places = val.analysisId.analysisName === "Dockage" ? 2 : 3;
      if (val && val.show) {
        countAnalysis++;
        analysis += `
          <tr>
            <td style="padding: 0px 8px;font-size: 6px;">
                <div style="margin: 0;padding: 0;float: left;width: 40%;color: #000000;font-size: 6px;">${
                  val.analysisId.analysisName
                }</div>
                <div style="margin: 0;font-size: 6px;padding: 0;float: left;width: 30%;text-align: center;color: #000000;">${roundOff(
                  val.value,
                  places
                )}%${
                ["Damage", "Green"].includes(val.analysisId.analysisName) && showAllow
                  ? `(${data.allow}%)`
                  : ""
              }</div>
                <div style="margin: 0;padding: 0;font-size: 6px;float: left;width: 30%;text-align: right;color: #000000;">${roundOff(
                  val.weightMT,
                  3
                )}</div>
            </td>
            <td style="padding: 0px 8px;font-size: 6px;">
                <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;"></div>
                <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;"></div>
            </td>
          </tr>`;
      }
    });
    const isCanayseed = data.commodityId.commodityName.toLowerCase() === 'canaryseed';
    // const isTradePurchse = data.commodityId.commodityName === 'tradeScaleTicket'
    
    // Don't show total damage on commodity of Peas, Beans and Marrowfat Peas category
    const totalDamage = ![
      "5ba53606e623a2362e4b3686",
      "5ba535f7e623a2362e4b3684",
      "5ba535fde623a2362e4b3685",
      "5e442e6940e43115611d31b9",
    ].includes(data.commodityId.commodityTypeId.toString())
      ? `<div style="margin: 0;padding: 0;float: left;width: 45.3%;color: #000000;font-size: 6px;">Total Damage</div>
            <div style="margin: 0;padding: 0;float: left;width: 14%;text-align: right;color: #000000;font-weight:400;">${roundOff(
              data.totalDamage,
              3
            )}%</div>
            <div style="margin: 0;padding: 0;font-size: 6px;float: left;width: 40.5%;text-align: right;color: #000000;">${roundOff(
              data.totalDamageMT,
              3
            )}</div>`
      : "";

    const gradeToBeShown =
      data.gradeType == "Contract" ? data.gradeId.gradeName : data.delGrade;
  
    const getTicket = (label) => {
      return `<div style="margin: 4px 0 0 0;padding: 0;width: 100%;float: left;">
                     <div style="margin: 0;padding: 0;width: 35%;float: left;">
                        <img src="${IMG_URL}" style="margin: 0 2% 0 0;padding: 0;float: left;width: 23%;">
                        <div style="margin: 0;padding: 0;width: 75%;float: left;text-align: left;">
                           <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;font-weight: 700;">Rudy Agro Ltd,</div>
                           <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;font-weight: 700;">Box 100, Outlook SK,S0L 2N0</div>
                           <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;font-weight: 700;">Tel : (306) 867-8667  Fax : (306) 867-8290</div>
                        </div>
                     </div>
                     <div style="margin: 0;padding: 0;width: 40%;float: left;color: #000000;font-weight:600;font-size: 9px;font-weight: 700;text-align: center;">COMBINED PRIMARY ELEVATOR RECEIPT</div>
                     <div style="margin: 0;padding: 0;width: 25%;float: left;text-align: right;">
                        <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;">Elevator receipt number</div>
                        <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;">RI-${
                          data.ticketNumber
                        }</div>
                        <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;">${formatDate(
                          data.date
                        )}</div>
                     </div>
                  </div>
                  <div style="margin:0;padding:0;width:100%;float:left;text-transform:uppercase;">
                     <table class="table" style="margin: 0;padding: 0;width: 100%;text-transform:uppercase;">
                        <tbody style="margin: 0;padding: 0;width: 100%;float: left;">
                           <tr style="margin: 0;padding: 0;width: 100%;float: left;">
                              <td style="margin: 0;padding: 0 5px;;color: #000000;font-size: 5px;">This document is</td>
                              <td style="margin: 0;padding: 0 10px;width: 3%;color: #000000;font-size: 5px;text-align: center;">
                                 <img style="height:8px;padding: 1px;" src="${specialImg}">
                              </td>
                              <td style="margin: 0;padding: 0 1%;color: #000000;font-size: 5px;">SPECIAL BIN ELEVATOR RECEIPT</td>
                              <td style="margin: 0;padding: 0 10px;width: 3%;color: #000000;font-size: 5px;text-align: center;">
                                 <img style="height:8px;padding: 1px;" src="${interimImg}">
                              </td>
                              <td style="margin: 0;padding: 0 3%;color: #000000;font-size: 5px;">INTERIM PRIMARY ELEVATOR RECEIPT <br/>(subject to grade and dockage)</td>
                              <td style="margin: 0;padding: 0 10px;width: 3%;color: #000000;font-size: 5px;text-align: center;">
                                 <img style="height:8px;padding: 1px;" src="${primaryImg}">
                              </td>
                              <td style="margin: 0;padding: 0 5px;color: #000000;font-size: 5px;">PRIMARY ELEVATOR RECEIPT</td>
                              <td style="margin: 0;padding: 0 10px;width: 3%;color: #000000;font-size: 5px;text-align: center;">
                              <img style="height:8px;padding: 1px;" src="${nonCgaImg}">
                               </td>
                              <td style="margin: 0;padding: 0 5px;color: #000000;font-size: 5px;">Non CGA Grain</td>
                              <td style="margin: 0;padding: 0 10px;width: 3%;color: #000000;font-size: 5px;text-align: center;">
                              <img style="height:8px;padding: 1px;" src="${nonProducerImg}">
                               </td> 
                              <td style="margin: 0;padding: 0 5px;color: #000000;font-size: 5px;">Non Producer Purchase</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
                  <div style="margin: 1px 0 0 0;padding: 0;width: 100%;float: left;text-transform:uppercase;">
                     <table class="table table-bordered" style="margin-bottom: 0;width: 100%;text-transform:uppercase;">
                        <thead>
                           <tr>
                              <th style="color: #000000;font-size: 6px;">Scale Record in Metric Tonnes</th>
                              <th style="color: #000000;font-size: 6px;">Received this day for storage from</th>
                              <th style="color: #000000;font-size: 6px;"></th>
                           </tr>
                        </thead>
                        <tbody >
                           ${
                             data.ticketStatus == "VOID"
                               ? '<div class="watermark">VOID</div>'
                               : ""
                           }
                           <tr>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">GROSS WEIGHT</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${roundOff(
                                   data.grossWeightMT,
                                   3
                                 )}</div>
                              </td>
                              <td style="padding: 0 8px;font-size: 6px;color: #000000;">Producer’s Name and Address (surname first)</td>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">CONTRACT #</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${getContractNumber(
                                   data
                                 )}</div>
                              </td>
                           </tr>
                           <tr>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">TARE WEIGHT</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${roundOff(
                                   data.tareWeightMT,
                                   3
                                 )}</div>
                              </td>
                              <td style="padding: 0 8px;font-size: 6px;color: #000000;">${growerFullName}</td>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">STATION NAME</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">RUDY AGRO</div>
                              </td>
                           </tr>
                           <tr>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">UNLOAD WEIGHT</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${roundOff(
                                   data.unloadWeidhtMT,
                                   3
                                 )}</div>
                              </td>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 100%;color: #000000;">${
                                   addresses[0].street
                                 }</div>
                                 <!-- <div style="padding: 0;float: left;width: 100%;color: #000000;">Chester, MT 59522</div> -->
                              </td>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">STATION NO.</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;"></div>
                              </td>
                           </tr>

                           <tr>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;color: #000000;"></div>
                                 <div style="margin: 0;padding: 0;float: left;width: 30%;text-align: center;color: #000000;"></div>
                                 <div style="margin: 0;padding: 0;float: left;width: 30%;text-align: right;color: #000000;"></div>
                              </td>
                              <td style="padding: 0;font-size: 6px;" rowspan="${countAnalysis}">
                                <table class="table table-bordered" style="margin: 0;height: 100%;width: 100%;text-transform:uppercase;border-width: 0px">
                                  <tbody>
                                    <tr>
                                      <td style="padding: 0 8px;font-size: 6px;">
                                        <div style="margin: 0;padding: 0;float: left;width: 100%;color: #000000;">${
                                          addresses[0].town +
                                          " " +
                                          addresses[0].country +
                                          " " +
                                          addresses[0].province +
                                          " " +
                                          addresses[0].postal
                                        }</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 0 8px;font-size: 6px;">
                                        <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">Grain</div>
                                        <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;color: #000000;">${
                                          data.commodityId.commodityName
                                        }</div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 0 8px;font-size: 6px;">
                                        ${
                                          !data.dockageCompleted
                                            ? `<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">INTERIM GRADE</div>`
                                            : ""
                                        }
                                        ${
                                          data.dockageCompleted
                                            ? `<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">FINAL GRADE</div>`
                                            : ""
                                        }
                                          <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${gradeToBeShown}</div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">BIN NO.</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${
                                   data.binNumber ? data.binNumber.binName : ""
                                 }</div>
                              </td>
                           </tr>

                           ${analysis}

                           <tr>
                              ${
                                !showAllow
                                  ? `<td style="padding: 0 8px;font-size: 6px;">
                                    <div style="margin: 0;padding: 0;float: left;width: 40%;color: #000000;font-size: 6px;;">Split Total</div>
                                    <div style="margin: 0;padding: 0;float: left;width: 30%;text-align: center;color: #000000;"></div>
                                    <div style="margin: 0;padding: 0;float: left;width: 60%;text-align: right;color: #000000;font-size: 6px;">${roundOff(
                                      data.splitTotalWeight,
                                      3
                                    )}</div>
                                  </td>`
                                  : `<td style="padding: 0 8px;font-size: 6px;${
                                      [
                                        "Kabuli Chick Peas",
                                        "Organic Kabuli Chickpeas",
                                      ].includes(data.commodityId.commodityName)
                                        ? "visibility: hidden;"
                                        : ""
                                    }">
                                    <div style="margin: 0;padding: 0;float: left;width: 40%;color: #000000;font-size: 6px;;">Allow</div>
                                    <div style="margin: 0;padding: 0;float: left;width: 30%;text-align: center;color: #000000;font-weight:400;">${roundOff(
                                      data.allow,
                                      3
                                    )}%</div>
                                    <div style="margin: 0;padding: 0;float: left;width: 60%;text-align: right;color: #000000;font-size: 6px;"></div>
                                  </td>`
                              }
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">SAMPLE TICKET</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;"></div>
                              </td>
                           </tr>
                           <tr>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 ${totalDamage}
                              </td>
                              <td style="padding: 0 8px;font-size: 6px;">
                                 <div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">MOISTURE</div>
                                 <div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${
                                   data.moisture
                                 }</div>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
                  ${
                    showKabuliSize
                      ? `<div style="margin: 0 10% 0 0;padding: 0;width: 20%;float: left;text-transform:uppercase;">
                     <table class="table table-bordered" style="margin-bottom: 0;width: 100%;text-transform:uppercase;">
                        <tbody>

                           <tr>
                              <td style="color: #000000;font-size: 6px;padding: 2px">Size 7</td>
                              <td style="color: #000000;font-size: 6px;padding: 2px">${data.sizeKabuli[0]["size7"]}</td>
                              <td style="color: #000000;font-size: 6px;padding: 2px">Size 8</td>
                              <td style="color: #000000;font-size: 6px;padding: 2px">${data.sizeKabuli[0]["size8"]}</td>
                           </tr>
                           <tr>
                              <td style="color: #000000;font-size: 6px;padding: 2px">Size 9</td>
                              <td style="color: #000000;font-size: 6px;padding: 2px">${data.sizeKabuli[0]["size9"]}</td>
                              <td style="color: #000000;font-size: 6px;padding: 2px">Size 10</td>
                              <td style="color: #000000;font-size: 6px;padding: 2px">${data.sizeKabuli[0]["size10"]}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>`
                      : ""
                  }

                  ${
                    !showKabuliSize
                      ? `<div style="margin: 0 10% 0 0;padding: 0;width: 20%;float: left;text-transform:uppercase;">
                        <table class="table table-bordered" style="margin-bottom: 0;width: 100%;text-transform:uppercase;"></table>
                      </div>`
                      : ""
                  }

                  <div style="margin: 0;padding: 0;width: 70%;float: right;text-transform:uppercase;">
                     <div style = "margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-size: 6px;" > Grain Unloaded(In Words): ${unloadWeidhtInWord} </div>
                     <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-size: 6px;">Net Weight(In Words): ${netWeightInWord}</div>
                     <div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-size: 6px;">Comment: ${
                       data.comments
                     }</div>
                  </div>
                  <div style="margin: 0;padding: 0;width: 100%;float: left;text-transform:uppercase;">
                     <div style="margin: 0;padding: 0;width: 30%;float: left;">
                        <div style="margin: 0;padding: 0;width: 50%;float: left;color: #000000;font-size: 6px;">NET WEIGHT:</div>
                        <div style="margin: 0 0 0 -20px;padding: 0;width: 50%;float: left;color: #000000;font-size: 6px;text-align: right;">${roundOff(
                          data.netTotalWeight,
                          3
                        )}</div>
                     </div>
                     <div style="margin: 0;padding: 0;width: 40%;float: right;">
                        <div style="margin: 0;padding: 0;width: 50%;float: left;color: #000000;font-size: 6px;;">Authorized Signature</div>
                        <div style="margin: 16px 0 0 0;padding: 0;width: 50%;float: left;height: 1px;"></div>
                     </div>
                  </div>
                  <hr style="margin: 1px 0;padding: 0;width: 100%;float: left;height: 1px;">
                  <div style="margin: 0 0 8px 0;padding: 0;width: 100%;float: left;text-transform:uppercase;">
                     <div style="margin: 0;padding: 0;width: 30%;float: left;">
                        <div style="color: #000000;font-size: 6px;">${label}</div>
                     </div>
                     <div style="margin: 0;padding: 0;width: 60%;float: right;">
                        <div style="color: #000000;font-size: 6px;">SUBJECT TO WARNING,TERMS AND CONDITIONS ON REVERSE</div>
                     </div>
                  </div>
                  <div style="clear:both;"></div>`;
    };

    var html = `<div class="" style="padding: 0 15px;">
                  <div>
                     <style type="text/css">
                        table, tbody, tr, th, td {
                          background-color: rgba(0, 0, 0, 0.0) !important;
                        }
                        .watermark {
                           display: inline;
                           position: absolute !important;
                           opacity: 0.25;
                           font-size: 4.5em;
                           width: 13%;
                           text-align: center;
                           z-index: 1000;
                           top: 300px;
                           right: 42%;
                           color: red;
                           transform: rotate(-20deg);
                           border-top: 5px solid red;
                           border-bottom: 5px solid red;
                        }
                        .watermark.watermark2 {top:680px;}
                        .watermark.watermark3 {top:1120px;}
                        table {
                           border-collapse: collapse;
                        }
                        table, th, td {
                           border: 1px solid #dddddd;
                        }
                        @page {
                           size: letter potrait;
                        }
                        @page :left {
                           margin: 1mm;
                        }
                        @page :right {
                           margin: 2mm;
                        }
                     </style>
                     <div style="min-height:100%;width: 100%; float: left;">
                        <div style="min-height:33%;margin: 0;width: 100%;${imgVoid}">
                           ${getTicket("PRODUCER COPY")}
                        </div>

                        <div style="min-height:33%;padding:5px 0;margin: 0;width: 100%;border-bottom:1px dashed;border-top:1px dashed;${imgVoid}">
                           ${getTicket("OFFICE COPY")}
                        </div>

                        <div style="min-height:33%;margin: 0;width: 100%;float: left;${imgVoid}">
                           ${getTicket("NUMERICAL COPY")}
                        </div>
                     </div>
                  </div>
               </div>`;

    return html;
  },
};
