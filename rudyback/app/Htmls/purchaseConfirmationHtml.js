const IMG_URL = process.env.IMG_URL;
const PDF_WATERMARK_IMG =process.env.PDF_WATERMARK_IMG;
const image_path = process.env.IMAGE_PATH;
const {formatDate, roundOff, getContractNumber} = require('../libs/utils');

module.exports = {
        purchaseConfirmationHTML: (data) => {
            var growerPhone = (data.growerId.cellNumber || data.growerId.phone || data.growerId.phone2 || data.growerId.phoneNumber2 || data.growerId.phoneNumber3) ? `<h3 style="margin: 0;padding: 0;width: 100%;float: left;font-size: 8px;font-weight: 400;color: #000;"><b style="width: 20%;float: left;font-weight: 700;">Phone :</b> ${data.growerId.cellNumber || data.growerId.phone || data.growerId.phone2 || data.growerId.phoneNumber2 || data.growerId.phoneNumber3}</h3>` : '';
            var growerEmail = (data.growerId.email || data.growerId.email2) ? `<h3 style="margin: 0px 0 2px 0px;padding: 0;width: 100%;float: left;font-size: 5px;font-weight: 300;color: #000;"><b style="width: 20%;float: left;font-weight: 500;">Email :</b> ${data.growerId.email || data.growerId.email2}</h3>` : '';
            let formGrowerName = data.personFarmType=='Farm' ? (data.farmName || data.growerId.farmName) : (data.growerId.firstName + ' ' + data.growerId.lastName);
        var imgVoid = '';
        if(data.status == 2){
          imgVoid = `background-image: url(${PDF_WATERMARK_IMG}); background-repeat: repeat-y;background-repeat: no-repeat;background-position: 50% 30%;`;
        }

        let listCount = 11;



        var html = `
<div style="page-break-after: always;smargin: 0;padding: 0px;width: 100%;float: left;background: #fff;">
    <div style="margin: 0 0 2px 0;padding: 0 0 4px 0;width: 100%;float: left;  border-bottom: 5px solid #007e4e;">
      <div style="width:30%; float: left;padding: 0 0px;">
         <div style="margin: 0;padding: 0;float: left">
            <img src="${IMG_URL}" style="margin: 0;padding: 0;float: left;width: 50%;">
         </div>
      </div>
         <div style="width: 40%; float: left;padding: 0 0px;">
            <div style="margin: 0;padding: 0;width: 100%;float: left;">
               <h3 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">Purchase Confirmation</h3>
               <h4 style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #000;font-size: 7px">Commodity: ${data.commodityId.commodityName}</h4>
               <h5 style="margin: 0;padding: 0 0px;width: 100%;float: left;color: #000;font-size: 7px;">Grade:  ${data.gradeId.gradeName}</h5>
            </div>
         </div>
         <div style="width:30%; float: left;padding: 0 0px;">
            <div style="margin: 0;padding: 0;float: left;">
               <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 8px;">RUDY AGRO LTD.</h2>
               <h3 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Box 100, Outlook Sask.S0L 2N0</h3>
               <a style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Tel (306) 867-8667</a>
               <a style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Fax (306 867-8290</a>
            </div>
         </div>
      </div>

        <div style="margin: 0;padding: 0;width: 100%;float: left;${imgVoid}">
            <h3 style="color: #000;margin: 0;padding: 0;float: left;width: 100%;font-size: 7px;font-weight: 600;text-align: center;">COMMODITY PURCHASE AND DEFERRED DELIVERY AGREEMENT <span style="float: right;margin: 0 16px 0 0;font-size: 8px;font-weight: 400;">${roundOff(data.CWTDel,2)}</span></h3>
            <h6 style="color: #000;margin: 0 0 3px 0;padding: 0;float: left;width: 100%;font-size: 5px;text-align: center;">Between Rudy Agro Ltd and:</h6>
            <div style="width: 100%;padding: 0;margin: 0;">
                <div style="width:45%; float: left;padding: 0 15px;margin: 0;">

                    <h3 style="margin: 0;padding: 0;width: 100%;float: left;font-size: 8px;font-weight: 400;color: #000;"><b style="width: 20%;float: left;font-weight: 700;">Seller :</b> ${formGrowerName}</h3>

                    <h3 style="margin: 0;padding: 0;width: 100%;float: left;font-size: 8px;font-weight: 400;color: #000;"><b style="width: 20%;float: left;font-weight: 700;">Address :</b>
                        <p style="width: 80%;font-style: normal;float: left;">${data.growerId.addresses[0].street}<br>${(data.growerId.addresses[0].town+' '+data.growerId.addresses[0].province)}<br>${data.growerId.addresses[0].postal + ' ' + data.growerId.addresses[0].country}</p>
                    </h3>
                    ${growerPhone} ${growerEmail}
                </div>
                <div style="width: 40%; float: right;padding: 0 15px;margin: 0;text-align: right;">
                    <h3 style="margin: 0 0 5px 0;padding: 0;width: 100%;float: left;font-size: 8px;color: #000;"><b style="width: 30%;float: left;font-weight: 700;text-align: left;">Date: </b><i style="width: 70%;text-align: left;float: left;font-style: normal;">
                        ${formatDate(data.backDate) || formatDate(data.createdAt)}</i></h3>
                    <h3 style="margin: 0;padding: 0;width: 100%;float: left;font-size: 8px;font-weight: 400;color: #000;"><b style="width: 30%;float: left;font-weight: 700;text-align: left;">Contract Number: </b><i style="width: 70%;text-align: left;float: left;font-style: normal;">${getContractNumber(data)}</i></h3>
                </div>
            </div>

            <div style="width: 100%; float: left;padding: 0;margin: 0 0 0 11px;">
                <h3 style="padding: 0;width: 45%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 40%;float: left;">Commodity:</b> <span style="font-weight: 400;">${data.commodityId.commodityName}</span></h3>
                <h3 style="margin: 2px 22px 0 0;padding: 0;width: 48%;float: right;font-size: 8px;color: #000;text-align: right;"><b style="width: 30%;float: left;text-align: left;">Grade:</b> <span style="font-weight: 400;text-align: left;width: 70%;float: left;">${data.gradeId.gradeName}</span></h3>
            </div>

            <div style="width: 100%; float: left;padding: 0;margin: 0 0 0 11px;">
                <h3 style="margin: 2px 22px 0 0;padding: 0;width: 48%;float: right;font-size: 8px;color: #000;text-align: right;"><b style="width: 30%;float: left;text-align: left;">Delivery Point:</b> <span style="font-weight: 400;text-align: left;width: 70%;float: left;">${data.deliveryPoint}</span></h3>
            </div>

            <div style="width: 100%; float: left;padding: 0;margin: 0 0 0 11px;">
                <h3 style="padding: 0;width: 45%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 40%;float: left;">Contracted Quantity:</b> <span style="font-size: 8px; font-weight: 400;">${roundOff(data.contractQuantity,2)} ${data.quantityUnit} NET</span> </h3>
                <h3 style="margin: 2px 22px 0 0;padding: 0px;width: 48%;float: right;font-size: 8px;color: #000;text-align: right;"><b style="width: 30%;float: left;text-align: left;">Delivery Period:</b> <span style="font-weight: 400;text-align: left;float: left;width: 70%;">${formatDate(data.shipmentPeriodFrom)} - ${formatDate(data.shipmentPeriodTo)}</span></h3>
            </div>
            <div style="width: 100%; float: left;padding: 0;margin: 0 0 0 11px;">
                <h3 style="padding: 0;width: 45%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 40%;float: left;">Specifications:</b> <span style="font-weight: 300;" class="ng-binding">${data.specifications}</span></h3>
                <h3 style="margin: 2px 22px 0 0;padding: 0;width: 48%;float: right;font-size: 8px;color: #000;text-align: right;"><b style="width: 30%;float: left;text-align: left;">Sample Number:</b> <span style="font-weight: 400;text-align: left;width: 70%;float: left;">${data.sampleNumber && data.sampleNumber.sampleNumber ? data.sampleNumber.sampleNumber :'' }</span></h3>
            </div>
            <div style="width: 100%; float: left;padding: 0;margin: 0 0 0 11px;">
                <h3 style="padding: 0;width: 100%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 18.3%;float: left;">Purchase Price:</b> <span style="font-size: 8px; font-weight: 400;">${roundOff(data.price,4)} / ${data.priceUnit} ${data.priceCurrency}</span></h3>
                ${data.splitsPrice!=0?`<h3 ng-show="data.splitsPrice!=0" style="padding: 0;width: 100%;float: left;font-size: 8px;color: #000;margin: 2px;font-weight: 400;"><b style="width: 22.5%;float: left;color: #fff">.</b> ${roundOff(data.splitsPrice,4)} per ${data.quantityUnit} net for splits ${data.priceCurrency}</h3>`:``}
                <h3 style="padding: 0;width: 100%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 18.3%;float: left;">Payment Term:</b> <span style="font-weight: 400;font-size: 8px;">${data.paymentTerms}</span></h3>
                <h3 style="padding: 0;width: 100%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 18.3%;float: left;">Handling Tariff:</b> <span style="font-weight: 400;font-size: 8px;float: left;width: 70%;">A handling tariff will be levied against all deliveries - $8.00/MT on Lentils, Chick Peas, Edible Beans, Canaryseed, Marrowfat Peas, $3.50/mt on all other Peas, Flax and Canola</span></h3>
                <h3 style="padding: 0;width: 100%;float: left;font-size: 8px;color: #000;margin: 2px;"><b style="width: 22.5%;float: left;">Settlement Instructions:</b> <span style="font-weight: 400;font-size: 8px;">${data.settlementInstructions}
                </span></h3>
                <h3 style="padding: 0;width: 100%;float: left;font-size: 8px;color: #000;margin: 1px 0 1px 0">Other Conditions:<br> <span style="font-weight: 300;font-size: 5px;">${data.otherConditions}</span></h3>
            </div>
            <ol style="margin:2px 0 0 -17px;width: 96%;float: left;font-weight: 300;">
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    1. The Seller will deliver, at its own expense and in good and dry condition, the Commodity to the named delivery point, on a date to be specified by Rudy Agro on 5 day’s notice to the Seller during the delivery period. The Seller warrants free and clear
                    title to the Commodity and that the Commodity is not, and will not be, encumbered by contract or otherwise. The Seller shall not be entitled to receive a higher price than that specified above even if, following delivery, the Commodity
                    is graded higher than the grade stated above.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    2. The Seller shall bear all costs of delivery to the named delivery point as aforesaid, and all risk in relation to the Commodity until completion of its delivery to Rudy Agro.
                </li>
                <li style="margin-bottom: 2x;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    3. Payment shall be made on the basis of weight net of dockage less the applicable handling tariff.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    4. Upon delivery of the Commodity, Rudy Agro shall determine the weight/quantity, grade, dockage and moisture content in accordance with procedures and official standards of the Canadian Grain Commission. It is understood that the purchase price is basis
                    the commodity being delivered “dry” in accordance to the CGC and if product is received at higher moisture i.e. “tough” or “damp” it may result in additional charges or rejection of the load at the Sellers expense.In the event of a
                    disagreement, the parties shall forward a suitable representative sample to the Canadian Grain Commission, and the results thereof shall be conclusive and binding.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    5. (a) The Seller shall be responsible for all loss, damage and expense incurred by Rudy Agroarising directly or indirectly from the failure or neglect of the Seller, whether within or beyond its control, including as a result of any acts of God, to perform
                    this agreement or any provision of it, including but not limited to the delivery of Commodity of a lesser quality. As well, the Seller agrees that the Commodity does not constitute “specific goods” as defined in The Sale of Goods Act.<br>
                    (b) In the event of any such failure or neglect, Rudy Agro shall be entitled to pursue all remedies available under law against the Seller, including all losses and expenses incurred by Rudy Agro in relation any default or breach by
                    the Seller of any contractual arrangements between it and a 3rd party or parties inrelation to the Commodity, due to Rudy replacing or attempting to replace the Commodity from other sources and/or from Rudy accepting late and/or partial
                    delivery from the Seller, as Rudy Agro may in its sole discretion elect.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    6. Rudy Agro may set off against, and deduct from, any payment to the Seller for the Commodity, any indebtedness of the Seller to Rudy Agro.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    7. Time shall be essence of this contract, and any extension thereof or other forbearance by Rudy Agro hereunder shall not constitute or be construed as a waiver of its right to require strict performance of all other provisions of this agreement.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    8. Any notice given under the terms of this agreement shall be conclusively deemed to have been properly given and received if provided to a party by any one of the mailing, facsimile or email addresses specified at the beginning of this agreement for the
                    party to whom the notice is being provided.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    9. This contract shall be deemed to have been made in the Province of Saskatchewan and shall be interpreted according to the laws and by the courts of Saskatchewan.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    10. This agreement forms the entire contract between the parties and no modification or variation is valid unless in writing signed by the Seller and Rudy Agro
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;font-weight: 300;">
                    11. The Seller acknowledges having received good and valuable consideration for its entry into this agreement, including securing a price certain for the Commodity, and also that Rudy Agro shall incur risk, effort and expense in reliance on this agreement.
                </li>
                <li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">${++listCount}. In the event of delayed delivery requested by Rudy Agro., or nominee, the contract shall remain binding and the seller shall be compensated at the rate of $2.00/MT per month storage on any outstanding portions of this contract until delivery is completed. The payment will be made on a pro-rated basis, only for the number of days the delivery was delayed. Storage payment will be made when contract has been completed. This clause is void if delivery is delayed at producer’s request.</li>
                ${data.commodityId.sieveSizeNote ? `<li style="margin-bottom: 2px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">${++listCount}. ${data.commodityId.sieveSizeNote}</li>` : ''}
            </ol>
            <div style="margin-top: 0px;padding: 0;width: 100%;float: left;">
                <div class="row" style="width: 100%;float: left;">
                    <div class="col-md-6" style="width: 35%;float: left;">
                        <h2 class="ext" style="color: #000;font-size: 9px;margin: 60px 0 0px 0;border-top: 2px solid #000;padding: 5px 0 0 0; text-align: center;">Accepted for Seller</h2>
                    </div>
                    <div class="col-md-6" style="width: 25%;float: left;margin-left: 23%;">
                        <img src="${image_path}${data.signee.signature}" style="width: 160px;height:60px;margin: 0 0 0 22%;">
                        <h2 style="color: #000;font-size: 9px;margin: 0px 0 0px 0;border-top: 2px solid #000;padding: 5px 0 0 0; text-align: center;">Accepted For Buyer</h2>
                    </div>
                </div>
            </div>
    </div>
    </div>
    <div style="page-break-before: always;margin:0px 0px 0px;padding: 0;width: 100%;background: #fff;">
        <div style="margin: 0 0 4px 0;padding: 0 0 4px 0;width: 100%;float: left;  border-bottom: 5px solid #007e4e;">
              <div style="width:30%; float: left;padding: 0 0px;">
                 <div style="margin: 0;padding: 0;float: left">
                    <img src="${IMG_URL}" style="margin: 0;padding: 0;float: left;width: 50%;">
                 </div>
              </div>
                 <div style="width: 40%; float: left;padding: 0 0px;">
                    <div style="margin: 0;padding: 0;width: 100%;float: left;">
                       <h3 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size: 9px;">Purchase Confirmation</h3>
                       <h4 style="margin: 3px 0;padding: 0;width: 100%;float: left;color: #000;font-size: 9px">Commodity: ${data.commodityId.commodityName}</h4>
                       <h5 style="margin: 0;padding: 0 0px;width: 100%;float: left;color: #000;font-size: 9px;">Grade:  ${data.gradeId.gradeName}</h5>
                    </div>
                 </div>
                 <div style="width:30%; float: left;padding: 0 0px;">
                    <div style="margin: 0;padding: 0;float: left;">
                       <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 8px;">RUDY AGRO LTD.</h2>
                       <h3 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Box 100, Outlook Sask.S0L 2N0</h3>
                       <a style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Tel (306) 867-8667</a>
                       <a style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Fax (306 867-8290</a>
                    </div>
                 </div>
              </div>
        <div style="margin: 0; padding: 0 15px;width: 100%;">
        <h3 style="color: #000;text-align:center;font-weight: 700;margin: 0;padding: 0;float: left;width: 100%;font-size: 12px;">Chemical Declaration Form</h3>
        <h4 style="color: #000;margin: 0;padding: 0;float: left;width: 100%;font-size: 9px;">
          <b style="color: #000;font-weight: 700;margin: 0 12px 0 0;padding: 0;float: left;width: auto;font-size: 9px;">Date:</b>
          ${formatDate(data.createdAt)}
        </h4>
        <h4 style="color: #000; margin: 0;padding: 0;float: left;width: 100%;font-size: 9px;">
         <b style="color: #000;font-weight: 700;margin: 0 12px 0 0;padding: 0; float: left;width: auto;font-size: 9px;">Grower Name/Farm Name:</b>
         ${formGrowerName}
        </h4>
        <h4 style="color: #000;margin: 0;padding: 0;width: 100%;font-size: 9px;">
              <b style="color: #000;font-weight: 700; margin: 0 12px 0 0; padding: 0;float: left;
                 width: auto;font-size: 9px;">Purchase/Production Contract:</b>
               ${getContractNumber(data)}
        </h4>
        <p style="color: #000; padding: 0;padding-right:8px;
           font-size: 10px;text-align: justify;margin-top:5px;">We hereby confirm the following crop production products were applied to the above crop during
           the current growing season. All products were applied within the established rates and guidelines
           as per the manufacturers label. (Check those that were applied)</p>

          <p style="color: #000;text-align:center;font-weight: 700;margin-bottom:5px;padding: 0;width: 100%;font-size: 12px;">
           Peas – Lentils – Chickpeas – Dry Bean (In Crop)
           </p>
            <div class="" style="margin: 0;padding: 0 0px;width: 100%;">
            <table class=""  style="width: 100%;max-width: 98%;background:none;border-collapse: collapse;">
               <thead>
                  <tr>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 2px;border: 1px solid #000; ">HERBICIDE</th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 2px;border: 1px solid #000; "></th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 2px;border: 1px solid #000; ">FUNGICIDE</th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 2px;border: 1px solid #000; "></th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 2px;border: 1px solid #000; "></th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 2px;border: 1px solid #000; "></th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Ares</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Acapela</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Parasol WG</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Authority/Authority Charge</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Allegro 500F</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Penncozeb 75DF</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>

                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Authority Supreme</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Azoshy 250 SC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Phostrol</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>

                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Avadex</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Bravo 500</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Pivot 418EC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Bentazon (Basagran)</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Bumper 418 EC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Priaxor</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Clethodim</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Contans</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Proline 480 SC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Dual II Magnum</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Co-Op Pivot</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Propi Super 25 EC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Edge Granular</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Copper 53W</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Propulse</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Eptam Liquid EC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Cosavet DF Edge</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Propel</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Frontier Max</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Cotegra</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Quadris</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Heat Complete</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Cueva</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Quash</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Imazamox</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Delaro</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Quilt</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Imazamox/Imazethapyr</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Dithane Rainshield</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Serenade Opti</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Imazethapyr</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Dyax</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Tilt 250E</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">MCPA Sodium Salt/Amine</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Echo 720</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Vertisan</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">MCPB/MCPA</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Elatus</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Metribuzin</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Fitness</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"><b>DESICCATION</b></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Odyssey Ultra</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Headline EC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Permit WG</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Kenja 400SC</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">GLYPHOSATE</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Poast Ultra</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Lance AG</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Reflex & Basagran</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Lance WDG</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">DIQUAT</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Quizalofop</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Manzate Pro-Stick</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Solo</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Mpower Spade</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Trifluralin</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Nufarm Propiconizole</td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"><b>OTHER:</b></td>
                     <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #cdcdcd;">
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Valtera</td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               </tr>

                  <tr style="border-bottom: 1px solid #cdcdcd;">
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">Viper ADV</td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
                  <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               </tr>
               <tr style="border-bottom: 1px solid #cdcdcd;padding:2px;">
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">&nbsp;</td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               </tr>
               <tr style="border-bottom: 1px solid #cdcdcd;padding:2px;">
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;">&nbsp;</td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
               <td style="color: #000000;padding: 2px 10px;font-size: 7px;border: 1px solid #000;"></td>
            </tr>

               </tbody>
            </table>
         </div>


         <div class="row" style="margin-top: 20px;">
            <div class="col-md-6" style="width: 50%;text-align:left;">
                <h6 class="ext" style="color: #000;font-size: 7px;margin:10px 0 0 0;border-top: 2px solid #000;padding: 10px 0 0 0;width:80%">Authorized Signature</h6>
            </div>
         </div>
         <div class="row" style="margin-top: 20px;">
         <div class="col-md-6" style="width: 50%;text-align:left;">
             <h6 class="ext" style="color: #000;font-size: 7px;margin:10px 0 0 0;border-top: 2px solid #000;padding: 10px 0 0 0;width:80%">Name</h6>
         </div>
      </div>
        </div>
    </div>
</div>
        `;

        return html;
    }
}
