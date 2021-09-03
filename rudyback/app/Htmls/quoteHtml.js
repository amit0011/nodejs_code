const moment = require('moment');
var IMG_URL = process.env.IMG_URL;

// start quote pdf
function roundOff(value, pos) {
  if (value) {
      var converted = Number(value);
      var newValue = converted.toFixed(pos);
      return newValue;
  } else
      return 0;
}

function trimShippingPeriod(value) {
  if (value) {
      if (value) {
          var temp = value.split('/');
          var newValue = temp[0].substring(0, 3) + '/' + temp[1].substring(0, 3);
          return newValue.length > 1 ? newValue : '';
      }
  }
  return "";
}

module.exports = {
  html({quote, weather, currency, buyer}) {
    var keyArr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

    var createdAt = moment().format('LL');
    var th_list = "";
    var td_list = "";

    quote.columnsCol.forEach((col) => {
        th_list += '<th style="color: #000;font-weight: 400;font-size: 6px;text-align: center;">' +
            '<b>' + (col.shippingTerm ? col.shippingTerm.term : '') + '' + quote.commission + '</b><br>' + col.destinationPort + '<br>' + (col.bag ? col.bag.name : '') + '</th>';
    });

    quote.commoditiesRow.forEach((row) => {
        td_list +=
            '<tr>' +
            '<td style="color: #000;font-weight: 300;font-size: 7px;text-align: center;">' + (row.commodity ? row.commodity.commodityName : '') + '</td>' +
            '<td style="color: #000;font-weight: 300;font-size: 7px;text-align: center;">' + (row.grade ? row.grade.gradeName : '') + '</td>' +
            '<td style="color: #000;font-weight: 300;font-size: 7px;text-align: center;">' + (trimShippingPeriod(row.shippingPeriod) || row.shippingPeriodShort) + '</td>' +
            '<td style="color: #000;font-weight: 300;font-size: 7px;text-align: center;">' + row.cropYear + '</td>' +
            '<td style="color: #000;font-weight: 300;font-size: 7px;text-align: center;">' + row.quantity + '</td>';

        for (var i = 0; i < quote.columnsCol.length; i++) {
            var key = keyArr[i];
            td_list += '<td style="color: #000;font-weight: 300;font-size: 7px;text-align: center;">$' + roundOff(row[key], 2) + '</td>';
        }
        td_list += '</tr>';
    });

    var weather_image = '<div style="margin: 300px 0 0 0;padding: 0;width: 647px;float: left;height: 404px; text-align: center;">' +
        '<img src="data:image/jpeg;base64,' + weather.weatherMap + ' alt="" width="820px" height="500px">' +
        '</div>';
    var plant_image = '<div style="margin: 200px 0 0 0;padding: 0;width: 647px;float: left;height: 404px; text-align: center;">' +
        '<img src="data:image/jpeg;base64,' + weather.plantJpeg + ' alt="" width="820px" height="500px">' +
        '</div>';

    var quotePdf =
        '<div id="quotePdf" style="margin: 0 auto;padding: 0;display: block;width:100%;font-family: Open Sans , sans-serif!important;">' +
        '<div style="margin: 0;padding: 0px;width: 100%;float: left;background: #ffffff;">' +
        '<div style="margin: 0 0 10px 0;padding: 0 0 10px 0;float: left;width:100%;border-bottom: 2px solid #000;">' +
        '<div style="margin: 0;padding: 0;float: left;width: 20%;">' +
        '<img src=' + IMG_URL + ' style="margin: 0 5% 0 0;padding: 0;float: left;width: 30%;">' +
        '</div>' +
        '<div style="margin: 0;padding: 0;float: left;width:25%;">' +
        '<h1 style="color: #000;margin: 0;padding: 0;float: left;width:100%;font-size: 9px;font-weight: 700;">RUDY AGRO LTD</h1>' +
        '<h2 style="margin: 0;padding: 0;float: left;width:100%;font-size: 7px;font-weight: 700;color: #000;">PO BOX LTD, OUTLOOK</h2>' +
        '<h3 style="margin: 0;padding: 0;float: left;width:100%;font-size: 7px;font-weight: 700;color: #000;">SASKATCHEWAN, CANADA SOL 2NO</h3>' +
        '</div>' +
        '<div style="margin: 17px 0 0  0;padding: 0;float: left;width:35%;">' +
        '<p style="margin: 0;padding: 0;float: left;width:100%;font-size: 7px;font-weight: 400;color: #000;">Ph. 306-867-8667 Fax 306-867-8290 Mob 306-873-7733</p>' +
        '<p style="margin: 0;padding: 0;float: left;width:100%;font-size: 7px;font-weight: 400;color: #000;">E-Mail wesw@rudyagro.ca Web www.rudyagro.ca</p>' +
        '</div>' +
        '<div style="margin: 17px 0 0 0;padding: 0;float: left;width:20%;">' +
        '<p style="margin: 0;padding: 0;float: left;width:100%;font-size: 7px;font-weight: 400;color: #000;">Date : ' + createdAt + '</p>' +
        '</div>' +
        '</div>' +
        '<div style="margin: 0;padding: 0;width: 100%;float: left;">' +
        '<p style="margin: 0 0 7px 0;padding: 0;width: 100%;float: left;font-size: 6px;color: #000;"><b style="margin: 0;padding: 0;width: 12%;float: left;">Buyer Name</b> <i style="margin: 0;padding: 0;width: 88%;float: left;font-style: normal;">' + buyer.businessName + '</i></p>' +
        '<p style="margin: 0 0 7px 0;padding: 0;width: 100%;float: left;font-size: 6px;color: #000;"><b style="margin: 0;padding: 0;width: 12%;float: left;">Current USD/CAD</b> <i style="margin: 0;padding: 0;width: 88%;float: left;font-style: normal;">' + currency.currencyCADUSD + '</i></p>' +
        '<p style="margin: 0 0 7px 0;padding: 0;width: 100%;float: left;font-size: 6px;color: #000;"><b style="margin: 0;padding: 0;width: 12%;float: left;">Currency</b> <i style="margin: 0;padding: 0;width: 88%;float: left;font-style: normal;">' + currency.currencyUpdate + '</i></p>' +
        '<p style="margin: 0 0 7px 0;padding: 0;width: 100%;float: left;font-size: 6px;color: #000;"><b style="margin: 0;padding: 0;width: 12%;float: left;">Weather Update :</b> <i style="margin: 0;padding: 0;width: 88%;float: left;font-style: normal;">' + weather.weather + '</i></p>' +
        '<p style="margin: 0;padding: 0;width: 100%;float: left;font-size: 6px;color: #000;"><b>We are pleased to provide you with the following price indications updates based on todays date, subject to reconfirmation by Rudy Agro Ltd. Prices in ' + quote.currency + '</b></p>' +
        '</div>' +
        '<div style="margin: 50px 0 0 0;padding: 0;width: 100%;float: left;color: #000;">' +
        '<div class="table-responsive">' +
        '<table class="table table-striped">' +
        '<thead>' +
        '<tr>' +
        '<th style="color: #000;font-weight: 400;font-size: 6px;text-align: center;">COMMODITY</th>' +
        '<th style="color: #000;font-weight: 400;font-size: 6px;text-align: center;width: 100px;">GRADE</th>' +
        '<th style="color: #000;font-weight: 400;font-size: 6px;text-align: center;">Shipping Period</th>' +
        '<th style="color: #000;font-weight: 400;font-size: 6px;text-align: center;">Crop Year</th>' +
        '<th style="color: #000;font-weight: 400;font-size: 6px;text-align: center;">Quantity Available</th>' + th_list + '</tr>' +
        '</thead>' +
        '<tbody>' + td_list + '</tbody>' +
        '</table>' +
        '</div>' +
        '</div>' + weather_image + plant_image + '</div>' +
        '</div>';

      return quotePdf;
  }
};
