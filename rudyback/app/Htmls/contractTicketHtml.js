var moment = require('moment');
var IMG_URL = process.env.IMG_URL;
var date = moment().format('LL');
var image_path = process.env.IMAGE_PATH;

function formatDate(date) {
    return moment(date).format('YYYY-MM-DD');
}

getValue = (list, type) => {
    var value = list.filter((val) => {
        return val.analysisId.analysisName == type;
    });
    if (value && value.length && value[0].weight ){
       return value[0].weight.toFixed(3);
    }
    else return 0;
};

module.exports = {

        contractTicketHtml: (data) => {
            var scalePdf ='';
            var totalNetWeight = 0;
            var totalDockage = 0;
            var totalSplits = 0;
            var contractNumber = '';
            var commodityName = '';
            var name = '';
           data.forEach(scale => {

            if (scale.ticketType == 'Incoming' ) {
                scale.preFix = "RI";
                var netWeight = scale.netWeight ? scale.netWeight.toFixed(3) : 0;
            } else if (scale.ticketType == 'Outgoing') {
                scale.preFix = "RO";
                var netWeight = scale.unloadWeidht ? scale.unloadWeidht.toFixed(3) : 0;

            }
            name = (scale.personFarmType == 'Person' && scale.growerId) ? scale.growerId.firstName + ' ' + scale.growerId.lastName : scale.growerId.farmName;
            name = name || scale.growerId.farmName || (scale.growerId.firstName + ' ' + scale.growerId.lastName);



                var dockage = getValue(scale.analysis,'Dockage');
                var splits = getValue(scale.analysis,'Splits');
                contractNumber = scale.contractNumber;
                commodityName = scale.commodityId.commodityName;
                scalePdf += `<tr >
               <td style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border: 1px solid #000; ">
                ${name}</td>
               <td style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border: 1px solid #000; "">
                ${scale.preFix}-${scale.ticketNumber}</td>
               <td style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border: 1px solid #000; ">
               ${moment(scale.date).format('MMM-DD-Y')}</td>
               <td style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border: 1px solid #000; ">
               ${netWeight}</td>
               <td style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border: 1px solid #000; ">
               ${dockage}</td>
               <td style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border: 1px solid #000; ">
               ${splits}</td>

            </tr>`;

             totalNetWeight += (netWeight - 0);
             totalDockage += (dockage - 0);
             totalSplits += (splits - 0);

           });
            //console.log(data);
            var html = `
<div style="margin: 0;padding: 0px;width: 100%;">
    <div style="margin: 0 0 4px 0;padding: 0 0 65px 0;width: 100%;border-bottom: 2px solid #007e4e;">
        <div class="" style="width:30%; float: left;padding: 0 0px;">
         <div style="margin: 0;padding: 0;float: left">
            <img src="${IMG_URL}" style="margin: 0;padding: 0;float: left;width: 50%;">
         </div>
      </div>

         <div style="width:70%; float: right;padding: 0 0px;">
            <div style="margin: 0;padding: 0;float: right;text-align:right">
               <h2 style="margin: 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 12px;">RUDY AGRO LTD.</h2>
               <h3 style = "margin: 3px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;" > Box 100, Outlook Sask.S0L 2N0 </h3>
               <a href="#" style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Tel (306) 867-8667</a>
               <a href="#" style="margin: 2px 0;padding: 0;width: 100%;float: left;color: #007e4e;font-size: 9px;">Fax (306 867-8290</a>
            </div>
         </div>
      </div>
      <div class="" style="margin: 0;padding: 0;width: 100%;float: left;">
            <div>
            <p style="color: #000; padding: 0; float: left;width: 50%;
               font-size: 10px;">Received	from  <b>${name}</b> <br/>
               <b>${commodityName}</b>
            </p>
            <p style="color: #000; padding: 0; float: right;width: 50%;
            font-size: 10px;text-align:right;"> <b>Contract #:</b> ${contractNumber}  </p>
            </div>
                  <div class="" style="width: 100%;">
                  <table cellpadding="0" class="" style="width: 100%;max-width: 98%;background:none;border-collapse: collapse;">
                     <thead>
                        <tr>
                           <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 6px;border: 1px solid #000; ">Name On Contract</th>
                           <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 6px;border: 1px solid #000; ">Ticket #</th>
                           <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 6px;border: 1px solid #000; ">Date</th>
                           <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 6px;border: 1px solid #000; ">Net Weight</th>
                           <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 6px;border: 1px solid #000; ">Dockage</th>
                           <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 6px;border: 1px solid #000; ">Splits</th>
                        </tr>
                     </thead>
                     <tbody>
                        ${scalePdf}
                     </tbody>
                     <tfoot>
                     <tr>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; ">Total</th>

                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; "></th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px;"></th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border-bottom: 1px solid #000; ">${totalNetWeight.toFixed(3)}</th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border-bottom: 1px solid #000; ">
                     ${totalDockage.toFixed(3)}</th>
                     <th style="text-align:left;font-size: 9px;color: #000000;text-align: center; padding: 4px; border-bottom: 1px solid #000; ">${totalSplits.toFixed(3)} &nbsp;KGS</th>

                     </tr>
                     </tfoot>
                  </table>
                           </div>

               </div>
            </div>

        `;

        return html;
    }
}

