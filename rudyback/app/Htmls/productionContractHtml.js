const IMG_URL = process.env.IMG_URL;
const PDF_WATERMARK_IMG =process.env.PDF_WATERMARK_IMG;
const image_path = process.env.IMAGE_PATH;
const {formatDate, roundOff, getContractNumber} = require('../libs/utils');

module.exports = {

    productionContractHTML: (data) => {
      const contractNumber = getContractNumber(data);
      let imgVoid = '';
      if(data.status == 2){
        imgVoid = `background-image: url(${PDF_WATERMARK_IMG}); background-repeat: repeat-y;background-repeat: no-repeat;background-position: 50% 20%;`;
      }
      const farmName = (data.farmName || data.growerId.farmName);
      let formGrowerName = data.personFarmType=='Farm' ? farmName : (data.growerId.firstName + ' ' + data.growerId.lastName);

        var grades = '';
        let listCount = 14;

        data.otherGradePrices.forEach((g) => {
            if (g && g['gradeName'] && g['gradePrice'])
                grades += `<div> <div style="margin: 0;padding: 0 0px;width: 15%;float: left;">${g.gradeName} : </div>
                   <div style="margin: 0;padding: 0 0px;width: 15%;float: left;">${g.gradePrice}</div></div>`;
        });

        var html = `
<div style="page-break-after: always;margin: 0;padding: 0px;width: 100%;">
   <div style="margin: 0 0 4px 0;padding: 0 0 65px 0;width: 100%;border-bottom: 5px solid #007e4e;">
      <div class="" style="width:30%; float: left;padding: 0 0px;">
         <div style="margin: 0;padding: 0;float: left">
            <img src="${IMG_URL}" style="margin: 0;padding: 0;float: left;width: 50%;">
         </div>
      </div>
         <div style="width: 40%; float: left;padding: 0 0px;">
            <div class="" style="margin: 0;padding: 0;width: 100%;float: left;">
               <h3 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size: 9px;">Production Contract</h3>
               <h4 style="margin: 3px 0;padding: 0;width: 100%;float: left;color: #000;font-size: 9px">Commodity: ${data.commodityId.commodityName}</h4>
               <h5 style="margin: 0;padding: 0 0px;width: 100%;float: left;color: #000;font-size: 9px;">Grade:  ${data.gradeId.gradeName}</h5>
               <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size:9px;">Contract #: ${contractNumber}</h2>
            </div>
         </div>
         <div style="width:30%; float: left;padding: 0 0px;">
            <div style="margin: 0;padding: 0;float: left;">
               <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 12px;">RUDY AGRO LTD.</h2>
               <h3 style = "margin: 3px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;" > Box 100, Outlook Sask.S0L 2N0 </h3>
               <a href="#" style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Tel (306) 867-8667</a>
               <a href="#" style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Fax (306 867-8290</a>
            </div>
         </div>
      </div>
      <div class="" style="margin: 0;padding: 0;width: 100%;float: left;${imgVoid}">

         <h3 style="color: #000;margin: 0;padding: 0;float: left;width: 100%;font-size: 16px;font-weight: 700;text-align: center;"><span style="float: right;margin: 0 16px 0 0;font-size: 11px;font-weight: 400;">${roundOff(data.CWTDel,2)}</span></h3>
         <p style="color: #000;padding: 0;float: left;width: 100%;font-size: 9px;margin-bottom: -3px;">Made in duplicate, ${formatDate(data.createdAt)}, between
            <b>Rudy Agro Ltd</b>, P.O. Box 100, Outlook, Saskatchewan (”the Buyer”) and

            <b>${formGrowerName}</b>. of postal
            <b>${data.growerId.addresses[0].street} ${(data.growerId.addresses[0].town+' '+data.growerId.addresses[0].province)} ${data.growerId.addresses[0].postal}, ${data.growerId.addresses[0].country}</b>  “the Grower”, who agree as follows:

         </p>
         <ol style="padding: 0 0 0 15px;width: 100%;float: left;max-width: 98%;">
            <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
               1. The Grower will plant, tend and harvest
               <b>${data.acres}</b> acres (“the Acres”) of the Commodity in the
               <b>${data.cropYear}</b> growing season (“the Growing Season”), on the following land:

               <div style="margin: 0px;padding: 0 0px;width: 100%;float: left;">
                  <div style="margin: 0;padding: 0 0px;width: 100%;float: left;">

                     <div style="margin: 0;padding: 0 0px;width: 63px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[0] && data.landLocation[0].numberOfAcres ? data.landLocation[0].numberOfAcres :'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 37px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Acres on</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 55px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[0] && data.landLocation[0].direction?data.landLocation[0].direction:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 30px;float: left;text-align: left; font-weight: 400;line-height: 11px;">1/4Sec</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 45px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[0] && data.landLocation[0].section?data.landLocation[0].section:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 19px;float: left;text-align: left; font-weight: 400;line-height: 11px;">TWP</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 51px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[0] && data.landLocation[0].townShip?data.landLocation[0].townShip:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 25px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Range</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 36px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[0] && data.landLocation[0].range? data.landLocation[0].range:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 10px;float: left;text-align: left; font-weight: 400;line-height: 11px;">W</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 23px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 20px;float: left;height: 10px;font-weight: 600;">${data.landLocation[0] && data.landLocation[0].meridien?data.landLocation[0].meridien:'___'}</span>
                     </div>




                     <div style="margin: 0;padding: 0 0px;width: 64px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[1] && data.landLocation[1].numberOfAcres ? data.landLocation[1].numberOfAcres :'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 36px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Acres on</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 56px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[1] && data.landLocation[1].direction?data.landLocation[1].direction:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 28px;float: left;text-align: left; font-weight: 400;line-height: 11px;">1/4Sec</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 48px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[1] && data.landLocation[1].section?data.landLocation[1].section:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 20px;float: left;text-align: left; font-weight: 400;line-height: 11px;">TWP</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 53px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[1] && data.landLocation[1].townShip?data.landLocation[1].townShip:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 25px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Range</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 35px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 18px;float: left;height: 10px;font-weight: 600;">${data.landLocation[1] && data.landLocation[1].range? data.landLocation[1].range:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 11px;float: left;text-align: left; font-weight: 400;line-height: 11px;">W</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 10px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:2px;width: 10px;float: left;height: 10px;font-weight: 600;">${data.landLocation[1] && data.landLocation[1].meridien?data.landLocation[1].meridien:'___'}</span>
                     </div>



                 <div style="margin: 0;padding: 0 0px;width: 63px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[2] && data.landLocation[2].numberOfAcres ? data.landLocation[2].numberOfAcres :'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 37px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Acres on</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 55px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[2] && data.landLocation[2].direction?data.landLocation[2].direction:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 30px;float: left;text-align: left; font-weight: 400;line-height: 11px;">1/4Sec</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 45px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[2] && data.landLocation[2].section?data.landLocation[2].section:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 19px;float: left;text-align: left; font-weight: 400;line-height: 11px;">TWP</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 51px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[2] && data.landLocation[2].townShip?data.landLocation[2].townShip:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 25px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Range</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 36px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[2] && data.landLocation[2].range? data.landLocation[2].range:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 10px;float: left;text-align: left; font-weight: 400;line-height: 11px;">W</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 23px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 20px;float: left;height: 10px;font-weight: 600;">${data.landLocation[2] && data.landLocation[2].meridien?data.landLocation[2].meridien:'___'}</span>
                     </div>




                     <div style="margin: 0;padding: 0 0px;width: 64px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[3] && data.landLocation[3].numberOfAcres ? data.landLocation[3].numberOfAcres :'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 36px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Acres on</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 56px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[3] && data.landLocation[3].direction?data.landLocation[3].direction:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 28px;float: left;text-align: left; font-weight: 400;line-height: 11px;">1/4Sec</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 48px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[3] && data.landLocation[3].section?data.landLocation[3].section:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 20px;float: left;text-align: left; font-weight: 400;line-height: 11px;">TWP</p>
                     </div>

                      <div style="margin: 0;padding: 0 0px;width: 53px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 21px;float: left;height: 10px;font-weight: 600;">${data.landLocation[3] && data.landLocation[3].townShip?data.landLocation[3].townShip:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 25px;float: left;text-align: left; font-weight: 400;line-height: 11px;">Range</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 35px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:  2px;width: 18px;float: left;height: 10px;font-weight: 600;">${data.landLocation[3] && data.landLocation[3].range? data.landLocation[3].range:'___'}</span>
                        <p style=" margin: 2px 0 0 0;padding:  0px;width: 11px;float: left;text-align: left; font-weight: 400;line-height: 11px;">W</p>
                     </div>

                     <div style="margin: 0;padding: 0 0px;width: 10px;float: left;display: flex;align-items: center;">
                        <span style="margin: 0;padding:2px;width: 10px;float: left;height: 10px;font-weight: 600;">${data.landLocation[3] && data.landLocation[3].meridien?data.landLocation[3].meridien:'___'}</span>
                     </div>



               </div>
            </li>

            <div style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
               (provided that if the Grower decides to grow the Commodity on any other land, it shall immediately notify the Buyer in writing), and the Grower agrees to sell to the Buyer on the termsset forth herein and the Buyer agrees to purchase all of the crop produced from the Acres in the Growing Season (“the Production”).
            </div>
            <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
               2. The Grower has selected the following pricing option for the sale of its Production to the Buyer:<br>(a) The <b>
                     <input type="checkbox" ${data.priceOption=='Fixed'?'checked':''}>
                     </b> fixed price option described in paragraph 3, on the first
                     <b>${data.fixedOnFirst} ${data.fixedPriceUnit}</b> of the Production (“the Fixed Production”) with the price for any additional production to be either the

                     <input type="radio" ${data.fixedAdditionalProduction=='Agreed'?'checked':''}>
                        <b>Agreed</b>
                        Price or the <input type="radio" ${data.fixedAdditionalProduction=='Pooled'?' checked   style:"background-color: black"':''}>
                           <b>Pooled</b> Price as described below. Buyer agrees to take delivery of the fixed production from
                           <b>${formatDate(data.deliveryDateFrom)}</b> to
                           <b>${formatDate(data.deliveryDateTo)}</b>.
                           <br>(b)The <b><input type="checkbox" ${data.priceOption == 'Agreed'?'checked':''}></b>
                           agreed price option, described in paragraph 4, or;<br>
                           (c)The <b><input type="checkbox" ${data.priceOption=='Pooled'?'checked':''}></b>
                           pooled price option described in paragraph 5
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 3. The fixed price will be<b> ${data.fixedPrice}</b>
                  per <b>${data.fixedPriceUnit}</b> (“the Fixed Price”)
                  <b>${data.deliveryOption}</b>  for all of the Production which is graded ${data.gradeId.gradeName} by the Buyer (and which, in the case of Kabuli Chickpeas sized 8,9,10mm or larger.  If the Production is graded by the Buyer as lower than ${data.gradeId.gradeName} (or is, in the case of Green Peas, bleached or, for Kabuli Chickpeas, undersized), then the Grower shall receive the lower of the following prices instead of the Fixed Price:<br>
                  (a) The applicable price as shown in the following table (and in the event the table does not show the particular grade of Commodity delivered by the Grower, the Buyer mayelect to apply the price shown for the next highest grade):
                  <div style="margin: 0;padding: 0 0px;width: 100%;float: left;">
                     ${grades && grades !== 'undefined'?'<b>Other Grades Price</b>'+grades:''}
                   </div>
               </li>
               <p style="margin-bottom: 4px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">or (b) The Buyer’s daily bid price for that grade of the Commodity as of the date of delivery.The Grower shall be excused from delivering the Fixed Production to the Buyer only if, and insofar as, the total amount of the Production is less than the Fixed Production as a
               direct result of an act of God occurring prior to the harvesting of the Production.</p>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                  4. The agreed price (“the Agreed Price ”) will be determined by agreement of the parties not later than June 1st of the year following the Growing Season, or such later dates as the parties may agree upon, failing which the Grower shall then be entitled to sell the portion of the Production to which the agreed price option applies or any of it to a buyer other than the Buyer only after the Buyer is provided with the full opportunity to purchase the same on a right of first refusal basis, which right of first refusal is here by granted by the Grower to the Buyer on the following terms:
                  <br>
                  (a)Upon receiving terms from a third party buyer that the Grower is prepared to accept, the Grower shall have the third party buyer forthwith provide the Buyer with full particulars of the terms of the proposed sale, including the quantity, grade and price, in the form of a “Production Transfer Request” which the Buyer will provide to the third party on request.
                   <br>
                  (b)Upon receipt of all of the said particulars, the Buyer shall have a period of 48 hours to notify the third party buyer that the Buyer is either exercising the Buyer’s right of first refusal to purchase the Production in question or that it consents to the Production Transfer Request (which consent the Grower acknowledges and agrees is acondition precedent to the sale of any of the Production to any party other than the Buyer).
                    <br>
                  (c)Should the Buyer consent to the Production Transfer Request as aforesaid, the Grower may proceed to sell to the third party buyer the Production as described in the Request provided that:(i) Such sale proceeds on the terms, including the timing of delivery and payment, set forth in the Request, failing which the Buyer’s consent shall be null and void, and its right of first refusal shall be reinstated.(ii)Any outstanding balance payable by the Grower to the Buyer for the Seed is first paid in full.
                   <br>
                  (d)The Grower acknowledges that every sale of any portion of the Production is subject to the Buyer’s first right of refusal even if a sale or sales of another portion there of to a third party have been consented to by the Buyer under the provisions above.In the event that the Agreed Price has not been determined in the manner set forth above for any portion of the Production by the end of the crop year for the GrowingSeason (“the Crop Year”), such remaining Production shall be purchased by the Buyer at the Buyer’s daily bid price for the Commodity as of the last day of the Crop Year.
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 5. (a) If the Grower has selected the pooled price option, the Production will be included in the pool which the Buyer has established for the Crop Year for the Commodity and Variety of the same grade (as determined pursuant to the provisions of this agreement) as the Production (“the Pooled Commodity”), and the Grower shall receive a price equal to the average (as calculated by the Buyer) of the prices paid by the Buyer for the Pooled Commodity throughout the Crop Year (“the Pooled Price”) (provided however that Commodities purchased by the Buyer at a Fixed Price or an Agreed Price will not be included in the calculation of the price paid to pools).
                  <br>
                  (b)All costs associated with marketing of the commodity contained within a pool, including but not limited to cleaning, bagging, handling, freight, storage, the Buyer’s carrying costs in relation to the Pooled Commodity, and the Buyer’s marketing commission as determined at its sole discretion will be for the account of the pool.
                  <br>
                  (c)The Buyer agrees to charge (or, where applicable, use all reasonable efforts to obtain) competitive cleaning, bagging, handling, freight and storage costs and to obtain the best prices available at the time of sale for the pool’s commodities, having regard to market fluctuations and delivery schedules, with a view to maximizing the return to the pool.
                  <br>
                  (d)In the event the Production contains in excess of 24% dockage or other foreign matter requiring special cleaning in addition to that required for the typical other commodities contained in the pool, the Buyer may charge the excess cleaning costs resulting there from directly to the Grower.
                  <br>
                  (e)Upon completion of delivery and determination of grade and dockage, the Buyer will make payment to the Grower of an amount equal to 85% of the price that theBuyer then estimates will eventually be paid as the Pooled Price.  Final payment to the Grower will be made not later than 60 days after closing of the pool(s).
                   <br>
                  (f) The Buyer will have option of purchasing commodities from any pool for seed purposes at a price equivalent to the Pooled Price.
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 6. In the event that the Grower has purchased seed from the Buyer for the purpose of growing the Production, The Grower shall take possession of the Seed at its own expense, and the Buyer may deduct any balance owing for such seed from the purchase price of the Production.  The Grower acknowledges that there are no agreements,warranties, conditions, terms, representations or inducements, oral or written, express or implied, legal, statutory, customary, collateral or otherwise, given or made by theBuyer with respect to, or connection with, the Seed or this agreement.   The grower acknowledges that all production from seed provided by the buyer must be returned tothe buyer other than the quantities identified in 8B below.   All production from that retained seed is automatically under a production agreement and 100% of the production must be returned to the buyer.
                  </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 7. The Buyer shall have the right to enter and inspect the fields planted to the Production, the Production and all buildings and places where the same is or may be locatedand the Grower’s records regarding the Production at any time or times deemed advisable by The Buyer. In the event of a crop failure for any reason, the Grower shallnotify The Buyer within 5 days of the same. Within 7 days of harvesting the Production, the Grower shall submit to the Buyer a 2lb. representative sample and acompleted harvest summary in the Document #F-20 form required by the Buyer (“the Harvest Summary”). The Grower acknowledges that the delivery to the Buyer of acomplete and accurate Harvest Summary is a condition precedent to the Buyer’s obligation to make any payment to the Grower for the Production.
                  </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 8. (a)The Grower will deliver, at its own expense and in good and dry condition, all of the Production, wherever grown, including any volunteer Production, and regardless of quality to the Buyer’s facility at Outlook, Saskatchewan, unless otherwise designated by the Buyer, on 24 hour notice from the Buyer (which notice will be provided for any Production subject to an Agreed Price only after the price has been determined in accordance with Clause 4). The Buyer agrees that it shall call for delivery of any Production to which a Fixed Price applies on or before December 31, and Production to which a Pooled Price applies on or before July 31st of the Crop Year. Unless otherwise specified herein, the Grower shall bear all costs of delivery, and all risk in relation to the Production until it is delivered, and a grain receipt is issued by the Buyer as set forth below. The Grower warrants free and clear title to the Production and that the Production is not, and will not be, encumbered by contract or otherwise.

                  <br>(b)Provided that the Grower delivers to the Buyer the Fixed Production (if applicable), the Grower may retain from the remaining Production up to 0 Lbs of theCommodity for the purposes of the Grower’s seeding in the next ensuing growing season, and the Grower shall describe in the Harvest Summary the quantity he wishes toretain.  It is understood that the production from future growing seasons shall remain under contract of RAL, and that all production must be delivered to the buyer’sfacility
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 9. (a) The Buyer, upon delivery of the Commodity, shall determine grade, dockage, amount of split product (inclusive of small whole product removed through the normal cleaning process), and moisture content and, if applicable, size and bleaching, in accordance with, where applicable, the procedures and official standards of the Canadian Grain Commission, and thereafter provide the Grower with a grain receipt. The Buyer shall be entitled to refuse to accept delivery of Production containing moisture in excess of the maximum percentage being accepted by the Buyer for the Commodity and Variety of the Production at the time of delivery; if the Buyer decides to accept delivery of such Production, it shall be entitled to apply a deduction to the price to be paid for the Production at a rate determined in its sole discretion. At the option of the Buyer a handling tariff on non-pea items including Chickpeas and Marrowfat peas of $8.00 per MT and on all other pea items $3.50 per MT will be deducted. Screenings on all of the Production shall be the property of the Buyer.
                                                                        <br>
                  (b) All determinations by the Buyer as set forth in paragraph (a) above shall be final and conclusive, except that in the event of a disagreement as to grade or dockage, the parties shall forward a suitable representative sample to the Canadian Grain Commission (or, at the option of the Buyer, SGS Canada Inc.) for a final determination, which shall not be subject to appeal.
                                                                           <br>
                  (c)Except as otherwise contemplated in this agreement, and provided the Grower is not in default of any provision of this Agreement, the Buyer shall make payment for the Production within 10days of delivery, except that the Buyer may elect to withhold payment until the Grower has delivered the Fixed Production (if applicable). All prices shall be paid on the basis of net, cleaned weight as determined under the provisions this agreement. The Buyer may set off against, and deduct from, any payment to the Grower for the Production, any indebtedness of the Grower to the Buyer.
               </li>
                <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 10. (a)The Grower shall be responsible for all loss, damage and expense incurred by the Buyer arising directly or indirectly from the failure or neglect of the Grower to sell and deliver to the Buyer all of the Production or to perform this agreement or any provision of it, whether such failure is within or beyond its control (including as a result of any acts of God occurring after the harvesting of the Production). As well, the Grower agrees that the Production does not constitute “specific goods” as defined in The Sale of Goods Act.
                                                                              <br>
                  (b)In the event of any such failure or neglect, the Buyer shall be entitled to pursue all remedies available under law against the Grower, including the recovery of all losses and expenses incurred by the Buyer in any default or breach by it of any contractual arrangements between it and a 3rd party or parties in relation to the Production, in replacing or attempting to replace the Production from other sources and/or from accepting late and/or partial delivery from the Grower, as the Buyer may in its sole discretion elect.
               </li>
                <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 11. The Grower hereby grants the Buyer a security interest in the Production and all proceeds of any kind derived directly or indirectly from the Production, which security interest ma y be enforced by any method permitted by law, including, without limitation, under the provisions of applicable personal property security legislation. The Grower acknowledges receipt of a copy of this contract and waives any right to receive a financing statement or financing change statement relating to it. The Limitation of Civil Rights Act and the Lands Contracts (Actions) Act, both of Saskatchewan, shall have no application to this contract or such security where the Grower is a corporate body.
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 12. It is mutually agreed that time is of the essence of the Agreement and that this Agreement shall be binding upon and enure to the benefit of the parties hereto, their heirs, executors, personal representative, successors and permitted assigns. It is further agreed that this Contract cannot be assigned by the Grower, but that it may be assigned by the Buyer at any time without notice to the Grower.
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 13. The parties hereto agree that this Contract shall be governed by and construed in accordance with the laws of the Province of Saskatchewan and the parties agree to attorn to and be bound by the jurisdiction of the Courts of Saskatchewan. The failure of the Buyer to enforce at any time any term, warranty or condition of the agreement shall not be considered a waiver of the Buyer’s right to thereafter enforce each and every term, warranty and condition of the Agreement. Any notice to be provided by the Buyer to the Grower hereunder may be provided by use of any one of the telephone or facsimile numbers or post office addresses provided below.
               </li>
                <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">
                 14. The return envelope for this contract must be postmarked on or before
                   <b>${formatDate(data.contractReturnDate)}</b> failing which this contract will be null and void at the option of the Buyer
               </li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">${++listCount}. In the event of delayed delivery requested by Rudy Agro., or nominee, the contract shall remain binding and the seller shall be compensated at the rate of $2.00/MT per month storage on any outstanding portions of this contract until delivery is completed. The payment will be made on a pro-rated basis, only for the number of days the delivery was delayed. Storage payment will be made when contract has been completed. This clause is void if delivery is delayed at producer’s request.</li>
               <li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">${data.otherComments?`${++listCount}.`:''} ${data.otherComments}</li>
               ${data.commodityId.sieveSizeNote ? `<li style="margin-bottom: 8px;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">${++listCount}. ${data.commodityId.sieveSizeNote}</li>` : ''}
         </ol>
         <div style="margin:10px 20px 0 30px;padding: 0;width: 100%;float: left;">
            <div class="row" style="width: 100%;float: left;">
               <div class="col-md-6" style="width: 50%;float: left;text-align:left;">
                   <h6 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size: 7px;">Per:</h6>
                   <img src="${image_path}${data.createdBy.signature}"  style="width: 120px;height:40px;margin: 0 0 0 22%;">
                   <h6 class="ext" style="color: #000;font-size: 7px;margin:10px 0 0 0;border-top: 2px solid #000;padding: 10px 0 0 0;width:80%">Rudy Agro Ltd - Buyer</h6>
               </div>
                <div class="col-md-6" style="width: 50%;float: left;margin: 40px 0 0px 0">
                  <h6 style="margin: 0;padding: 0;  width: 100%;float: left;color: #000;font-size: 7px;">Per: ${data.growerId.firstName} ${data.growerId.lastName}</h6>
                  <h6 style="margin: 0;padding: 0;  width: 100%;float: left;color: #000;font-size: 7px;">${farmName}</h6>
                  <h6 style="color: #000;font-size: 7px;margin: 20px 0 0 0;border-top: 2px solid #000;padding: 10px 0 0 0;width:80%">Grower or Authorized Signing Office</h6>
                  <h6 style="color: #000;font-size: 7px;margin: 0;width:80%">(Contract #: ${contractNumber})</h6>
               </div>
            </div>
         </div>
      </div style="page-break-after: always;">
   </div style="page-break-after: always;">

   <div style="page-break-before: always;margin:0px 0px 0px;padding: 0;width: 100%;background: #fff;">
      <div  style="margin: 0;padding: 0;width: 100%;">
      <div style="margin: 0 0 4px 0;padding: 0 0 4px 0;width: 100%;float: left;  border-bottom: 5px solid #007e4e;">
      <div class="" style="width:30%; float: left;padding: 0 0px;">
         <div style="margin: 0;padding: 0;float: left">
            <img src="${IMG_URL}" style="margin: 0;padding: 0;float: left;width: 50%;">
         </div>
      </div>
         <div style="width: 37%; float: left;padding: 0 0px;">
            <div class="" style="margin: 0;padding: 0;width: 100%;float: left;">
               <h3 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size: 9px;">Production Contracts</h3>
               <h4 style="margin: 3px 0;padding: 0;width: 100%;float: left;color: #000;font-size: 9px">Commodity: ${data.commodityId.commodityName}</h4>
               <h5 style="margin: 0;padding: 0 0px;width: 100%;float: left;color: #000;font-size: 9px;">Grade:  ${data.gradeId.gradeName}</h5>
               <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #000;font-size:9px;">Contract #: ${contractNumber}</h2>
            </div>
         </div>
         <div style="width:33%; float: left;padding: 0 0px;">
            <div style="margin: 0;padding: 0;float: left;">
               <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 12px;">RUDY AGRO LTD.</h2>
               <h3 style="margin: 3px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Box 100, Outlook Sask.S0L 2N0 </h3>
               <a href="#" style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Tel (306) 867-8667</a>
               <a href="#" style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Fax (306 867-8290</a>
            </div>
         </div>
      </div>
      </div>
      <div style="width:100%;padding:0;margin:0">
         <h3 style="color: #000;text-align:center;font-weight: 700;margin: 0;padding: 0;float: left;width: 100%;font-size: 12px;">Chemical Declaration Form</h3>
            <h4 style="color: #000;margin: 0;padding: 0;float: left;width: 100%;font-size: 9px;">
              <b style="color: #000;font-weight: 700;margin: 0 12px 0 0;padding: 0;float: left;width: auto;font-size: 9px;">Date:</b>
              ${formatDate(data.createdAt)}
            </h4>
            <h4 style="color: #000; margin: 0;padding: 0;float: left;width: 100%;font-size: 9px;">
             <b style="color: #000;font-weight: 700;margin: 0 12px 0 0;padding: 0; float: left;width: auto;font-size: 9px;">Grower Name/Farm Name:</b>
             ${formGrowerName}
            </h4>
            <h4 style="color: #000;margin: 0;padding: 0;float: left; width: 100%;font-size: 9px;">
                  <b style="color: #000;font-weight: 700; margin: 0 12px 0 0; padding: 0;float: left;
                     width: auto;font-size: 9px;">Purchase/Production Contract:</b>
                   ${contractNumber}
            </h4>
            <p style="color: #000; padding: 0;padding-right:5px;
               font-size: 10px;text-align: justify;">We hereby confirm the following crop production products were applied to the above crop during
               the current growing season. All products were applied within the established rates and guidelines
               as per the manufacturers label. (Check those that were applied)</p>
              <p> <h4 style="color: #000;text-align:center;font-weight: 700;margin-bottom:5px;padding: 0;float: left;width: 100%;font-size: 12px;">
               Peas – Lentils – Chickpeas – Dry Bean (In Crop)
               </h4></p>

               <div style="margin: 0;padding: 0 0px;width: 100%;">
                              <table style="width: 100%;background:none;border-collapse: collapse;">
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
