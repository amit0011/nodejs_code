angular.module('myApp.filter', [])
    .filter('customFilter', function() {
        return function(data, key) {
            var value = 0;
            for (let d of data) {
                // console.log(key);
                if (d.analysisId.analysisName == key) {
                    value = d.weightMT;
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
    .filter('trim', function() {
        return function(value, pos) {
            if (value) {
                var temp = value.split('/');
                var newValue = temp[0].substring(0, 3) + '/' + temp[1].substring(0, 3);
                return newValue;
            }

        };
    });
