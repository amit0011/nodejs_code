const IMG_URL = process.env.IMG_URL;
const PDF_WATERMARK_IMG =process.env.PDF_WATERMARK_IMG;
const {formatDate, roundOff, inWords, getContractNumber} = require('../libs/utils');
const checkboxImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABtklEQVQ4T6WTUWoCMRBAM9GAorCCIKIsLCr4IdIFL9CeoPYE9gj2Ju0N7A3sCbpH2Ar7oSy6ICgsiPrh12KmzNAs27J+NV+ZJO8lM0lA/LMB8aPRyNJaz4UQ93k+RBz7vv+RN8eC4XD4CQC5sJTy2ff9dwPTZkmSeEIIb7FYvLBgMBjgz4KZlHJmFmutT0EQfJm40+lYpVLJAwCXBEEQPLCg3++zABHd1WqVAtkjE6yUop0JpjZdLpdvLOj1eiwIw5Djbrc7AYCp1vp+vV6fCZZSZuF5GIZPtJYBx3FYEEUROI4zEUKYNHwAGCMiFdjsHEkpXRKnAtu2WbDdbsH0b91usVh0N5sNp2nb9iOfoNVqsWC320G73Z4gYlrIrAgRp/v9/o3Gms3mhArOgkajwYI4jjmmSa31X8k8jmPOO8swUK/XWXA4HDj+GcvWItJau8fjkfPOMgxYlsWC8/mcCiiu1WqUzis9stPp9Ot6DcNAtVpN38Hlcsl9B9laVCqVOwDwaYwF5XLZCGbX6/U1SZKbEqXUXaFQmALAcypQSn3e+kjZnXP6nsnZAoD5rQ+VJ0FEj37pN4I+tsMaAXGoAAAAAElFTkSuQmCC';

module.exports = {
	tradePurchaseScaleTicket: data => {
		if (
			data.commodityId &&
			data.commodityId.commodityShowShipmentAnalysis &&
			data.commodityId.commodityShowShipmentAnalysis.length
		) {
		var allCommodity = data.commodityId.commodityShowShipmentAnalysis.map(e => e.toString());

		data.analysis.forEach(val => {
			val.show = allCommodity.indexOf(val.analysisId._id.toString()) != -1 ? true : false; });
    }

    let imgVoid = '';
    if(data.void){
      imgVoid = `background-image: url(${PDF_WATERMARK_IMG}); background-repeat: repeat-y;background-repeat: no-repeat;background-position: 50% 20%;`;
    }

		var analysis = "";
		var buyerName = data.buyerId.businessName;
		var unloadWeightInWord = inWords(roundOff(data.unloadWeidht), 3);
		var buyerAddress = `${data.buyerId.addresses[0].street} ${data.buyerId.addresses[0].city} ${data.buyerId.addresses[0].postal} ${data.buyerId.addresses[0].country}`;

		data.analysis.forEach(val => {
			if (val && val.show) {
				analysis += `<tr>
								<td style="padding: 0 8px;font-size: 6px;">
									<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">
										${ val.analysisId.analysisName }
									</div>
									<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">
										${roundOff(val.value, 3)}
									</div>
								</td>
								<td style="padding: 0 8px;font-size: 6px;">
									<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;"></div>
								</td>
								<td style="padding: 0 8px;font-size: 6px;">
									<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;"></div>
								</td>
							</tr>`;
			}
		});

		let ticketHtml = () => {
			return `<div style="margin: 4px 0 0 0;padding: 0;width: 100%;float: left;">
				<div style="margin: 0;padding: 0;width: 35%;float: left;">
					<img src="${IMG_URL}" style="margin: 0 2% 0 0;padding: 0;float: left;width: 23%;">
					<div style="margin: 0;padding: 0;width: 75%;float: left;text-align: left;">
						<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;font-weight: 700;">Rudy Agro Ltd,</div>
						<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;font-weight: 700;">Box 100, Outlook SK,S0L 2N0</div>
						<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;font-weight: 700;">Tel : (306) 867-8667  Fax : (306) 867-8290</div>
					</div>
				</div>
				<div style="margin: 0;padding: 0;width: 40%;float: left;color: #000000;font-weight:600;font-size: 9px;font-weight: 700;text-align: center;">PRIMARY ELEVATOR RECEIPT</div>
				<div style="margin: 0;padding: 0;width: 25%;float: left;text-align: right;">
					<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;">Elevator receipt number</div>
					<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;">RO-${data.ticketNumber}</div>
					<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 6px;">${formatDate(data.date)}</div>
				</div>
			</div>
			<div style="margin: 1px 0 0 0;padding: 0;width: 100%;float: left;text-transform:uppercase;">
				<table class="table table-bordered" style="margin-bottom: 0;width: 100%;text-transform:uppercase;">
					<tbody>
						<tr>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">Scale Record in Tons</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;"></div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">${buyerName}</div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;"></div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;"></div>
							</td>
            </tr>

            <tr>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">GROSS WEIGHT</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${roundOff(data.grossWeightMT, 3 )}</div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;color: #000000;">${buyerAddress}</td>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">CONTRACT #</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${getContractNumber(data)} - ${data.contractExtra}</div>
							</td>
						</tr>

						<tr>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">TARE WEIGHT</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${roundOff(data.tareWeightMT, 3)}</div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;color: #000000;">
								<span>
								<img style="height:5px;padding: 1px;" src="${checkboxImg}">
								NON PRODUCER PURCHASE
								</span>
							</td> 
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">TRUCK/UNIT#</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${data.trackUnit}</div>
							</td>
						</tr>
						<tr>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">LOAD</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${data.unloadWeidhtMT}</div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;color: #000000;">
								<span>
								<img style="height:5px;padding: 1px;visibility:hidden;" src="${checkboxImg}">
								PURCHASE NOT COVERED BY SECURITY UNDER THE CGA
								</span>
							</td>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">SEAL#</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align: right;color: #000000;">${data.seal}</div>
							</td>
						</tr>
						${analysis}
						<tr>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;"></div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;"></div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;">
								<div style="margin: 0;padding: 0;float: left;width: 60%;color: #000000;font-size: 6px;">Grain</div>
								<div style="margin: 0;padding: 0;float: left;width: 40%;text-align:right;color: #000000;">${data.commodityId.commodityName}</div>
							</td>
							<td style="padding: 0 8px;font-size: 6px;"></td>
						</tr>
					</tbody>
				</table>
			</div>

			<div style="margin: 0;padding: 0;width: 70%;float: right;text-transform:uppercase;">
				<div style = "margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-size: 6px;" > Grain loaded(In Words): ${unloadWeightInWord} </div>
				<div style="margin: 0;padding: 0;width: 100%;float: left;color: #000000;font-size: 6px;">${ data.printComment ? `<div style="margin: 5px 0 0 0;padding: 0;width: 100%;float: left;color: #000000;font-weight:600;font-size: 11px;">Comment: ${data.comments}</div>` : ""}</div>
			</div>
			<div style="margin: 0;padding: 0;width: 100%;float: left;text-transform:uppercase;">
				<div style="margin: 0;padding: 0;width: 40%;float: right;">
					<div style="margin: 0;padding: 0;width: 50%;float: left;color: #000000;font-size: 6px;;">Authorized Signature</div>
					<div style="margin: 16px 0 0 0;padding: 0;width: 50%;float: left;height: 1px;"></div>
				</div>
			</div>
			<hr style="margin: 1px 0;padding: 0;width: 100%;float: left;height: 1px;">
			<div style="margin: 0 0 8px 0;padding: 0;width: 100%;float: left;text-transform:uppercase;">
				<div style="margin: 0;padding: 0;width: 30%;float: left;">
					<div style="color: #000000;font-size: 6px;"></div>
				</div>
				<div style="margin: 0;padding: 0;width: 60%;float: right;">
					<div style="color: #000000;font-size: 6px;">SUBJECT TO WARNING,TERMS AND CONDITIONS ON REVERSE</div>
				</div>
			</div>
			<div style="clear:both;"></div>`;
		};

		var html = `
			<div>
				<style type="text/css">
          table, tbody, tr, th, td {
            background-color: rgba(0, 0, 0, 0.0) !important;
          }
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
				<div style="min-height:100%;width: 100%; float: left;${imgVoid}">
					<div style="min-height:33%;margin: 0;width: 100%;">
						${ticketHtml()}
					</div>
					<div style="min-height:33%;padding:5px 0;margin: 0;width: 100%;border-bottom:1px dashed;border-top:1px dashed;${imgVoid}">
						${ticketHtml()}
					</div>
					<div style="min-height:33%;margin: 0;width: 100%;${imgVoid}">
						${ticketHtml()}
					</div>
				</div>
			</div>`;
		return html;
	}
};
