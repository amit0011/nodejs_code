const moment = require('moment');

const convert = from => (to, amount, options) => {
  let commodityWeight = (options && options.commodityWeight) || 60;

  let conversionFactors = {
    'mt->cwt': 1 * 22.0462,
    'mt->bu': 1 * 2204.62 / commodityWeight,
    'mt->lbs': 1 * 2204.62,
    'mt->kgs': 1 * 1000,

    'lbs->cwt': 1 / 100,
    'lbs->bu': 1 / commodityWeight,
    'lbs->mt': 1 / 2204.62,
    'lbs->kgs': 1 * 2.20462,

    'cwt->mt': 1 / 22.0462,
    'cwt->bu': 1 * 100 / commodityWeight,
    'cwt->lbs': 1 * 100,
    'cwt->kgs': 1 * 100 / 2.20462,

    'bu->cwt': 1 * commodityWeight / 100,
    'bu->mt': 1 * commodityWeight / 2204.62,
    'bu->lbs': 1 * commodityWeight,
    'bu->kgs': 1 * commodityWeight / 2.20462,

    'kgs->cwt': 1 * 2.20462 / 100,
    'kgs->mt': 1 / 1000,
    'kgs->lbs': 1 * 2.20462,
    'kgs->bu': 1 * 2.20462 / commodityWeight,
  };

  const key = `${from}->${to}`.toLowerCase();
  return (conversionFactors[key] || 1) * amount;
};

function formatDate(date) {
    // Getting time based on Central timezone
    return moment(date).utcOffset(-360).format('YYYY-MM-DD');
}

function roundOff(value, position) {
    position ? position : 2;
    if (value) {
        var a = (Number(value)).toFixed(position);
        return a.toString();
    } else return 0;
}

var a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
var b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function inWords(num) {
    if ((num = num.toString()).length > 9) return 'overflow';
    let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Hundred ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Kgs ' : 'Kgs';
    return str;
}

function getContractNumber(data) {
  return data.contractNumber.replace('-R', '');
}

const checkListsDefault = [
  {code: 'crdbrd-wll-flr', name: 'Cardboard – walls/floor', price: 75},
  {code: 'crdbrd-clintop', name: 'Cardboard – Completely Lined including top', price: 150},
  {code: 'slc-gl-stffr', name: 'Silica Gel (Stuffer)', price: 75},
  {code: 'absrb-gl', name: 'Absorb Gel (6 per fcl)', price: 125},
  {code: 'lnr-bg', name: 'Liner Bags', price: 135},
  {code: 'phts-drng-stfng', name: 'Photos (During Stuffing)', price: 35},
  {code: 'glyphst-tst-inhs', name: 'Glyphosate Test (In House)', price: 75},
  {code: 'gltn-fr-tst', name: 'Gluten Free Test (In house)', price: 75},
  {code: 'adtnl-st-docs', name: 'Additional Set of Documents', price: 150},
];

module.exports = {formatDate, roundOff, inWords, getContractNumber, checkListsDefault, convert};
