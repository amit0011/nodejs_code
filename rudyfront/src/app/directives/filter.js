angular.module('myApp.filter', [])
    .filter('customFilter', function() {
        return function(data, key, valueKey) {
          var value = 0;
          var vKey = valueKey || 'weightMT';
          for (let d of data) {
              if ((d.analysisId._id || d.analysisId) == key) {
                  value = d[vKey];
                  break;
              }
          }
          return value;
      };
    })
    .filter('roundOff', function() {
        return function(value, pos) {
            if (value) {
                var converted = Number(value);
                var newValue = converted.toFixed(pos);
                return newValue;
            }

        };
    })
    .filter('formatCommission', function () {
      return function (value, commissionType) {
        switch (commissionType) {
          case "$":
            return "$"+value+"/CWT";
          case "%":
            return value + "%";
          case "$pmt":
            return "$"+value+"/MT";
          default:
            return value;
        }
      };
    })
    .filter('trim', function() {
        return function(value, pos) {
            if (value) {
                var temp = value.split('/');
                var newValue = temp[0].substring(0, 3) + '/' + temp[1].substring(0, 3);
                return newValue;
            }

        };
    });
