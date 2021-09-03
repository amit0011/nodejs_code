angular.module('myApp.commonService', [])
    .service('commonService', function() {
        return {
            adjustDate: function (date, $boundary = '[') {
                if (!date) {
                    return undefined;
                }
                var whichFucntion = $boundary == '[' ? 'startOf' : 'endOf';

                return moment(date)[whichFucntion]('day').toISOString();
            },
            getDateToCurrentTime: function (date) {
              var ctime = (new Date()).toISOString().split('T')[1];
              return date + 'T' + ctime;
            },
            canChangeStatus: function (contract, loggedInUser, createdBy = 'createdBy') {
                return (contract[createdBy]==loggedInUser._id || loggedInUser.type=='SUPERADMIN');
            },
            getDuration: function(incoming, outgoing) {
              if (!incoming || !outgoing) {
                return;
              }

              var inTime = moment(incoming);
              var outTime = moment(outgoing); // another date
              var duration = moment.duration(outTime.diff(inTime));

              var formats = [];
              //Get Days and subtract from duration
              var days = Math.floor(duration.asDays());
              if (days > 0) {
                formats.push(days + (days == 1 ? " day" : " days"));
                duration.subtract(moment.duration(days, 'days'));
              }

              //Get hours and subtract from duration
              var hours = Math.floor(duration.hours());
              if (hours > 0) {
                formats.push(hours + (hours == 1 ? " hour" : " hours"));
                duration.subtract(moment.duration(hours, 'hours'));
              }

              //Get Minutes and subtract from duration
              var minutes = Math.floor(duration.minutes());
              if (minutes > 0) {
                formats.push(minutes + (minutes == 1 ? " minute" : " minutes"));
              }

              return formats.join(", ");
            },
            compareObjects: function(a, b, options = {}) {
              options = options || {};
              var comparators = options.comparators || {};
              var modifiers = options.comparatorModifiers || {};
              var keys = Array.isArray(options.keys) && options.keys.length > 0 ? options.keys : [...new Set(Object.keys(a), ...new Set(Object.keys(b)))];
              var skipKeys = Array.isArray(options.skipKeys) ? options.skipKeys : [];

              var isSame = true;
              var defaultComparator = (a, b) => a === b;

              keys.forEach(key => {
                if (skipKeys.includes(key)) return;
                var args = [a[key], b[key]];
                if(modifiers[key]) args.push(modifiers[key]);
                var comparator = comparators[key] || defaultComparator;
                var comparisionResult = comparator.apply(null, args);
                isSame = isSame && comparisionResult;
              });
              return isSame;
            },
            dateComparator: function (a, b, modifier) {
              if (!(a || b)) return true;

              if (!a && typeof b === 'object' && !b.isValid()) return true;

              if (!b && typeof a === 'object' && !a.isValid()) return true;

              if (a && b) {
                var args = modifier ? [modifier] : [];
                if (typeof a === 'object' && a.isSame.apply(a, [b, ...args])) return true;

                if (typeof b === 'object' && b.isSame.apply(b, [a, ...args])) return true;

                if (a === b) return true;
              }

              return false;
            },
            idObjectComparator: function (a, b, reverse) {
              return reverse ? (b && a === b._id) : (a && a._id === b);
            },
            arrayComparator: function (a, b, modifier) {
              var diffs = [];

              if (modifier) {
                diffs = _.differenceWith(a, b, modifier);
              } else {
                diff = _.difference(a, b);
              }
              return diffs.length === 0;
            },
            cropYears: function(last = 2016) {
              var currentYear = moment().year();
              var edgeDate = currentYear + "-08-31T23:59:59.999Z";
              var start = moment().isAfter(edgeDate) ? (currentYear + 1) : currentYear;

              var years = [];
              for(var year = start; year >= last; year--) {
                years.push(year + "");
              }
              return years;
            },
            salesCheckLists: function() {
              return [
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
            },
        };
    });
