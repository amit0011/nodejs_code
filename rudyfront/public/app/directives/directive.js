angular.module('myApp.directive', [])
    .directive('onlyNumber', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    })
    .directive("numbersOnly", function() {
        return {
            require: 'ngModel',
            link: function(scope, ele, attr, ctrl) {

                ctrl.$parsers.push(function(inputValue) {
                    var afterDecimalPosition = attr.position ? Number(attr.position) : 3;
                    const sign = attr.sign ? attr.sign : "+";
                    var pattern = new RegExp("^([-+])?([0-9]{0,9})+(\.[0-9]{1,4})?$", "g");
                    if (inputValue == '')
                        return '';
                    var dotPattern = /^[.]*$/;

                    if (dotPattern.test(inputValue)) {
                        ctrl.$setViewValue('');
                        ctrl.$render();
                        return '';
                    }
                    var newInput = inputValue.replace(/[^0-9.]/g, '');
                    
                    if (inputValue.startsWith('-') && ['-', '*'].includes(sign)) {
                        newInput = '-' + newInput;
                    } else {
                        newInput += '';
                    }

                    if (newInput != inputValue) {
                        ctrl.$setViewValue(newInput);
                        ctrl.$render();
                    }
                    var result;
                    var dotCount;
                    var newInputLength = newInput.length;

                    if (result == (pattern.test(newInput))) {
                        dotCount = newInput.split(".").length - 1; // count of dots present
                        if (dotCount == 0 && newInputLength > 10) { //condition to restrict "integer part" to 9 digit count
                            newInput = newInput.slice(0, newInputLength - 1);
                            ctrl.$setViewValue(newInput);
                            ctrl.$render();
                        }
                    } else { //pattern failed

                        dotCount = newInput.split(".").length - 1; // count of dots present
                        if (newInputLength > 0 && dotCount > 1) { //condition to accept min of 1 dot
                            newInput = newInput.slice(0, newInputLength - 1);
                        }
                        if (dotCount > 0 && (newInput.slice(newInput.indexOf(".") + 1).length) > afterDecimalPosition) { //condition to restrict "fraction part" to 4 digit count only.
                            newInput = newInput.slice(0, newInputLength - 1);
                        }
                        ctrl.$setViewValue(newInput);
                        ctrl.$render();
                    }

                    return newInput;
                });
            }
        };
    })


.directive("numberOnly", function() {
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl) {

            ctrl.$parsers.push(function(inputValue) {
                var pattern = new RegExp("(^[0-9]{0,9})+(\.[0-9]{1,4})?$", "g");
                if (inputValue == '')
                    return '';
                var dotPattern = /^[.]*$/;

                if (dotPattern.test(inputValue)) {
                    ctrl.$setViewValue('');
                    ctrl.$render();
                    return '';
                }
                var newInput = inputValue.replace(/[^0-9.]/g, '');
                // newInput=inputValue.replace(/.+/g,'.');

                if (newInput != inputValue) {
                    ctrl.$setViewValue(newInput);
                    ctrl.$render();
                }
                var result;
                var dotCount;
                var newInputLength = newInput.length;
                if ((result = pattern.test(newInput))) {
                    dotCount = newInput.split(".").length - 1; // count of dots present
                    if (dotCount == 0 && newInputLength > 6) { //condition to restrict "integer part" to 9 digit count
                        newInput = newInput.slice(0, newInputLength - 1);
                        ctrl.$setViewValue(newInput);
                        ctrl.$render();
                    }
                } else { //pattern failed

                    dotCount = newInput.split(".").length - 1; // count of dots present
                    if (newInputLength > 0 && dotCount > 1) { //condition to accept min of 1 dot
                        newInput = newInput.slice(0, newInputLength - 1);

                    }
                    if ((newInput.slice(newInput.indexOf(".") + 1).length) > 3) { //condition to restrict "fraction part" to 4 digit count only.
                        newInput = newInput.slice(0, newInputLength - 1);

                    }
                    ctrl.$setViewValue(newInput);
                    ctrl.$render();
                }

                return newInput;
            });
        }
    };
})



.directive("nOnly", function() {
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl) {
            ctrl.$parsers.push(function(inputValue) {
                var afterDecimalPosition = attr.after ? Number(attr.after) : 4;
                var beforeDecimalPosition = attr.before ? Number(attr.before) : 5;
                var pattern = new RegExp("(^[0-9]{0,9})+(\.[0-9]{1,4})?$", "g");
                if (inputValue == '')
                    return '';
                var dotPattern = /^[.]*$/;

                if (dotPattern.test(inputValue)) {
                    ctrl.$setViewValue('');
                    ctrl.$render();
                    return '';
                }
                var newInput = inputValue.replace(/[^0-9.]/g, '');

                if (newInput != inputValue) {
                    ctrl.$setViewValue(newInput);
                    ctrl.$render();
                }
                var result;
                var dotCount;
                var newInputLength = newInput.length;
                if (result = (pattern.test(newInput))) {
                    var before = newInput.split(".")[0];
                    var after = newInput.split(".")[1];
                    if (before.length > beforeDecimalPosition) { //condition to restrict "integer part" to 9 digit count
                        before = before.slice(0, before.length - 1);
                        var updated = before;
                        if (after) {
                            updated = before + '.' + after;
                        }

                        ctrl.$setViewValue(updated);
                        ctrl.$render();
                    }
                } else { //pattern failed
                    dotCount = newInput.split(".").length - 1; // count of dots present
                    if (newInputLength > 0 && dotCount > 1) { //condition to accept min of 1 dot
                        newInput = newInput.slice(0, newInputLength - 1);
                    }
                    if ((newInput.slice(newInput.indexOf(".") + 1).length) > afterDecimalPosition) { //condition to restrict "fraction part" to 4 digit count only.
                        newInput = newInput.slice(0, newInputLength - 1);
                    }
                    ctrl.$setViewValue(newInput);
                    ctrl.$render();
                }

                return newInput;
            });
        }
    };
})



.directive("numOnly", function() {
        return {
            require: 'ngModel',
            link: function(scope, ele, attr, ctrl) {

                ctrl.$parsers.push(function(inputValue) {
                    var pattern = new RegExp("(^[0-9]{0,9})+(\.[0-9]{1,4})?$", "g");
                    if (inputValue == '')
                        return '';
                    var dotPattern = /^[.]*$/;

                    if (dotPattern.test(inputValue)) {
                        ctrl.$setViewValue('');
                        ctrl.$render();
                        return '';
                    }
                    var newInput = inputValue.replace(/[^0-9.]/g, '');

                    if (newInput != inputValue) {
                        ctrl.$setViewValue(newInput);
                        ctrl.$render();
                    }
                    var result;
                    var dotCount;
                    var newInputLength = newInput.length;
                    var result = pattern.test(newInput);
                    if (result) {
                        dotCount = newInput.split(".").length - 1; // count of dots present
                        if (dotCount == 0 && newInputLength > 5) { //condition to restrict "integer part" to 9 digit count
                            newInput = newInput.slice(0, newInputLength - 1);

                        }
                        if (newInputLength > 0 && dotCount > 1 && (newInput.slice(newInput.indexOf(".") + 1).length) > 2) { //condition to restrict "fraction part" to 2 digit count only.
                            newInput = newInput.slice(0, newInputLength - 1);
                        }
                        ctrl.$setViewValue(newInput);
                        ctrl.$render();
                    } else { //pattern failed
                        dotCount = newInput.split(".").length - 1; // count of dots present

                        if (newInputLength > 0 && dotCount > 1) { //condition to accept min of 1 dot
                            newInput = newInput.slice(0, newInputLength - 1);
                        }
                        if (newInputLength > 0 && dotCount > 1 && (newInput.slice(newInput.indexOf(".") + 1).length) > 2) { //condition to restrict "fraction part" to 2 digit count only.
                            newInput = newInput.slice(0, newInputLength - 1);

                        }
                        ctrl.$setViewValue(newInput);
                        ctrl.$render();
                    }

                    return newInput;
                });
            }
        };
    })
    .directive("decimals", function($filter) {
        return {
            restrict: "A", // Only usable as an attribute of another HTML element
            require: "?ngModel",
            scope: {
                decimals: "@",
                decimalPoint: "@"
            },
            link: function(scope, element, attr, ngModel) {
                var decimalCount = parseInt(scope.decimals) || 2;
                var decimalPoint = scope.decimalPoint || ".";

                // Run when the model is first rendered and when the model is changed from code
                ngModel.$render = function() {
                    if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
                        if (typeof decimalCount === "number") {
                            element.val(ngModel.$modelValue.toFixed(decimalCount).toString().replace(".", "."));
                        } else {
                            element.val(ngModel.$modelValue.toString().replace(".", "."));
                        }
                    }
                };

                // Run when the view value changes - after each keypress
                // The returned value is then written to the model
                ngModel.$parsers.unshift(function(newValue) {
                    if (typeof decimalCount === "number") {
                        var floatValue = parseFloat(newValue.replace(".", "."));
                        if (decimalCount === 0) {
                            return parseInt(floatValue);
                        }
                        return parseFloat(floatValue.toFixed(decimalCount));
                    }

                    return parseFloat(newValue.replace(".", "."));
                });

                // Formats the displayed value when the input field loses focus
                element.on("change", function(e) {
                    var floatValue = parseFloat(element.val().replace(".", "."));
                    if (!isNaN(floatValue) && typeof decimalCount === "number") {
                        if (decimalCount === 0) {
                            element.val(parseInt(floatValue));
                        } else {
                            var strValue = floatValue.toFixed(decimalCount);
                            element.val(strValue.replace(".", decimalPoint));
                        }
                    }
                });
            }
        };
    })

.directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })
    .directive('phonenumberDirective', ['$filter', function($filter) {
        /*
        Intended use:
            <phonenumber-directive placeholder='prompt' model='someModel.phonenumber'></phonenumber-directive>
        Where:
            someModel.phonenumber: {String} value which to bind only the numeric characters [0-9] entered
                ie, if user enters 617-2223333, value of 6172223333 will be bound to model
            prompt: {String} text to keep in placeholder when no numeric input entered
        */

        function link(scope, element, attributes) {

            // scope.inputValue is the value of input element used in template
            scope.inputValue = scope.phonenumberModel;

            scope.$watch('inputValue', function(value, oldValue) {

                value = String(value);
                var number = value.replace(/[^0-9]+/g, '');
                scope.phonenumberModel = number;
                scope.inputValue = $filter('phonenumber')(number);
            });
        }

        return {
            link: link,
            restrict: 'E',
            scope: {
                phonenumberPlaceholder: '=placeholder',
                phonenumberModel: '=model',
            },
            // templateUrl: '/static/phonenumberModule/template.html',
            template: '<input ng-model="inputValue" type="tel" class="phonenumber" placeholder="{{phonenumberPlaceholder}}" title="Phonenumber (Format: (999) 9999-9999)">',
        };
    }])

.filter('phonenumber', function() {
    /* 
    Format phonenumber as: c (xxx) xxx-xxxx
        or as close as possible if phonenumber length is not 10
        if c is not '1' (country code not USA), does not use country code
    */

    return function(number) {
        /* 
        @param {Number | String} number - Number that will be formatted as telephone number
        Returns formatted number: (###) ###-####
            if number.length < 4: ###
            else if number.length < 7: (###) ###
        Does not handle country codes that are not '1' (USA)
        */
        if (!number) {
            return '';
        }

        number = String(number);

        // Will return formattedNumber. 
        // If phonenumber isn't longer than an area code, just show number
        var formattedNumber = number;

        // if the first character is '1', strip it out and add it back
        var c = (number[0] == '1') ? '1 ' : '';
        number = number[0] == '1' ? number.slice(1) : number;

        // # (###) ###-#### as c (area) front-end
        var area = number.substring(0, 3);
        var front = number.substring(3, 6);
        var end = number.substring(6, 10);

        if (front) {
            formattedNumber = (c + area + "-" + front);
        }
        if (end) {
            formattedNumber += ("-" + end);
        }
        return formattedNumber;
    };
});


// .directive('numbersOnly', function() {
//     return {
//         require: 'ngModel',
//         link: function(scope, element, attr, ngModelCtrl) {
//             function fromUser(text) {
//                 if (text) {
//                     var transformedInput = text.replace(/[^0-9]/g, '');
//                     if (transformedInput !== text) {
//                         ngModelCtrl.$setViewValue(transformedInput);
//                         ngModelCtrl.$render();
//                     }
//                     return transformedInput;
//                 }
//                 return undefined;
//             }
//             ngModelCtrl.$parsers.push(fromUser);
//         }
//     };
// });
// angular.module('myApp.directive', [])
//     .directive('isNumber', function() {
//         return {
//             require: 'ngModel',
//             link: function(scope) {
//                 scope.$watch('wks.number', function(newValue, oldValue) {
//                     var arr = String(newValue).split("");
//                     if (arr.length === 0) return;
//                     if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.')) return;
//                     if (arr.length === 2 && newValue === '-.') return;
//                     if (isNaN(newValue)) {
//                         scope.wks.number = oldValue;
//                     }
//                 });
//             }
//         };
//     });