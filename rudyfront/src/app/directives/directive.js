angular
  .module("myApp.directive", [])
  .directive("onlyNumber", function () {
    return {
      require: "ngModel",
      link: function (scope, element, attr, ngModelCtrl) {
        function fromUser(text) {
          if (text) {
            var transformedInput = text.replace(/[^0-9]/g, "");

            if (transformedInput !== text) {
              ngModelCtrl.$setViewValue(transformedInput);
              ngModelCtrl.$render();
            }
            return transformedInput;
          }
          return undefined;
        }
        ngModelCtrl.$parsers.push(fromUser);
      },
    };
  })
  .directive("numbersOnly", function () {
    return {
      require: "ngModel",
      link: function (scope, ele, attr, ctrl) {
        ctrl.$parsers.push(function (inputValue) {
          var afterDecimalPosition = attr.position ? Number(attr.position) : 3;
          const sign = attr.sign ? attr.sign : "+";
          var pattern = new RegExp("^([-+])?([0-9]{0,9})+(.[0-9]{1,4})?$", "g");
          if (inputValue == "") return "";
          var dotPattern = /^[.]*$/;

          if (dotPattern.test(inputValue)) {
            ctrl.$setViewValue("");
            ctrl.$render();
            return "";
          }
          var newInput = inputValue.replace(/[^0-9.]/g, "");

          if (inputValue.startsWith("-") && ["-", "*"].includes(sign)) {
            newInput = "-" + newInput;
          } else {
            newInput += "";
          }

          if (newInput != inputValue) {
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }
          var result;
          var dotCount;
          var newInputLength = newInput.length;

          if (result == pattern.test(newInput)) {
            dotCount = newInput.split(".").length - 1; // count of dots present
            if (dotCount == 0 && newInputLength > 10) {
              //condition to restrict "integer part" to 9 digit count
              newInput = newInput.slice(0, newInputLength - 1);
              ctrl.$setViewValue(newInput);
              ctrl.$render();
            }
          } else {
            //pattern failed

            dotCount = newInput.split(".").length - 1; // count of dots present
            if (newInputLength > 0 && dotCount > 1) {
              //condition to accept min of 1 dot
              newInput = newInput.slice(0, newInputLength - 1);
            }
            if (
              dotCount > 0 &&
              newInput.slice(newInput.indexOf(".") + 1).length >
                afterDecimalPosition
            ) {
              //condition to restrict "fraction part" to 4 digit count only.
              newInput = newInput.slice(0, newInputLength - 1);
            }
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }

          return newInput;
        });
      },
    };
  })

  .directive("numberOnly", function () {
    return {
      require: "ngModel",
      link: function (scope, ele, attr, ctrl) {
        ctrl.$parsers.push(function (inputValue) {
          console.log(inputValue);
          var pattern = new RegExp("(^[0-9]{0,9})+(.[0-9]{1,4})?$", "g");
          if (inputValue == "") return "";
          var dotPattern = /^[.]*$/;

          if (dotPattern.test(inputValue)) {
            console.log("inside dot Pattern");
            ctrl.$setViewValue("");
            ctrl.$render();
            return "";
          }
          var newInput = inputValue.replace(/[^0-9.]/g, "");
          // newInput=inputValue.replace(/.+/g,'.');

          if (newInput != inputValue) {
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }
          var result;
          var dotCount;
          var newInputLength = newInput.length;
          if ((result = pattern.test(newInput))) {
            console.log("pattern " + result);
            dotCount = newInput.split(".").length - 1; // count of dots present
            if (dotCount == 0 && newInputLength > 6) {
              //condition to restrict "integer part" to 9 digit count
              newInput = newInput.slice(0, newInputLength - 1);
              ctrl.$setViewValue(newInput);
              ctrl.$render();
            }
          } else {
            //pattern failed
            console.log("pattern " + result);
            // console.log(newInput.length);

            dotCount = newInput.split(".").length - 1; // count of dots present
            console.log("dotCount  :  " + dotCount);
            if (newInputLength > 0 && dotCount > 1) {
              //condition to accept min of 1 dot
              console.log("length>0");
              newInput = newInput.slice(0, newInputLength - 1);
              console.log("newInput  : " + newInput);
            }
            if (newInput.slice(newInput.indexOf(".") + 1).length > 3) {
              //condition to restrict "fraction part" to 4 digit count only.
              newInput = newInput.slice(0, newInputLength - 1);
              console.log("newInput  : " + newInput);
            }
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }

          return newInput;
        });
      },
    };
  })

  .directive("nOnly", function () {
    return {
      require: "ngModel",
      link: function (scope, ele, attr, ctrl) {
        ctrl.$parsers.push(function (inputValue) {
          var afterDecimalPosition = attr.after ? Number(attr.after) : 4;
          var beforeDecimalPosition = attr.before ? Number(attr.before) : 5;
          var pattern = new RegExp("(^[0-9]{0,9})+(.[0-9]{1,4})?$", "g");
          if (inputValue == "") return "";
          var dotPattern = /^[.]*$/;

          if (dotPattern.test(inputValue)) {
            ctrl.$setViewValue("");
            ctrl.$render();
            return "";
          }
          var newInput = inputValue.replace(/[^0-9.]/g, "");

          if (newInput != inputValue) {
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }
          var result;
          var dotCount;
          var newInputLength = newInput.length;
          if ((result = pattern.test(newInput))) {
            var before = newInput.split(".")[0];
            var after = newInput.split(".")[1];
            if (before.length > beforeDecimalPosition) {
              //condition to restrict "integer part" to 9 digit count
              before = before.slice(0, before.length - 1);
              var updated = before;
              if (after) {
                updated = before + "." + after;
              }

              ctrl.$setViewValue(updated);
              ctrl.$render();
            }
          } else {
            //pattern failed
            dotCount = newInput.split(".").length - 1; // count of dots present
            if (newInputLength > 0 && dotCount > 1) {
              //condition to accept min of 1 dot
              newInput = newInput.slice(0, newInputLength - 1);
            }
            if (
              newInput.slice(newInput.indexOf(".") + 1).length >
              afterDecimalPosition
            ) {
              //condition to restrict "fraction part" to 4 digit count only.
              newInput = newInput.slice(0, newInputLength - 1);
            }
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }

          return newInput;
        });
      },
    };
  })

  .directive("numOnly", function () {
    return {
      require: "ngModel",
      link: function (scope, ele, attr, ctrl) {
        ctrl.$parsers.push(function (inputValue) {
          var pattern = new RegExp("(^[0-9]{0,9})+(.[0-9]{1,4})?$", "g");
          if (inputValue == "") return "";
          var dotPattern = /^[.]*$/;

          if (dotPattern.test(inputValue)) {
            ctrl.$setViewValue("");
            ctrl.$render();
            return "";
          }
          var newInput = inputValue.replace(/[^0-9.]/g, "");

          if (newInput != inputValue) {
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }

          var dotCount;
          var newInputLength = newInput.length;
          var result = pattern.test(newInput);
          console.log(result);
          if (result) {
            console.log("if");
            dotCount = newInput.split(".").length - 1; // count of dots present
            if (dotCount == 0 && newInputLength > 5) {
              //condition to restrict "integer part" to 9 digit count
              newInput = newInput.slice(0, newInputLength - 1);
            }
            if (
              newInputLength > 0 &&
              dotCount > 1 &&
              newInput.slice(newInput.indexOf(".") + 1).length > 2
            ) {
              //condition to restrict "fraction part" to 2 digit count only.
              newInput = newInput.slice(0, newInputLength - 1);
              console.log("newInput  : " + newInput);
            }
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          } else {
            //pattern failed
            console.log("else");
            dotCount = newInput.split(".").length - 1; // count of dots present

            if (newInputLength > 0 && dotCount > 1) {
              //condition to accept min of 1 dot
              newInput = newInput.slice(0, newInputLength - 1);
            }
            console.log(newInput.slice(newInput.indexOf(".") + 1).length);
            if (
              newInputLength > 0 &&
              dotCount > 1 &&
              newInput.slice(newInput.indexOf(".") + 1).length > 2
            ) {
              //condition to restrict "fraction part" to 2 digit count only.
              newInput = newInput.slice(0, newInputLength - 1);
              console.log("newInput  : " + newInput);
            }
            ctrl.$setViewValue(newInput);
            ctrl.$render();
          }

          return newInput;
        });
      },
    };
  })
  .directive("decimals", function ($filter) {
    return {
      restrict: "A", // Only usable as an attribute of another HTML element
      require: "?ngModel",
      scope: {
        decimals: "@",
        decimalPoint: "@",
      },
      link: function (scope, element, attr, ngModel) {
        var decimalCount = parseInt(scope.decimals) || 2;
        var decimalPoint = scope.decimalPoint || ".";

        // Run when the model is first rendered and when the model is changed from code
        ngModel.$render = function () {
          if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
            if (typeof decimalCount === "number") {
              element.val(
                ngModel.$modelValue
                  .toFixed(decimalCount)
                  .toString()
                  .replace(".", ".")
              );
            } else {
              element.val(ngModel.$modelValue.toString().replace(".", "."));
            }
          }
        };

        // Run when the view value changes - after each keypress
        // The returned value is then written to the model
        ngModel.$parsers.unshift(function (newValue) {
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
        element.on("change", function (e) {
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
      },
    };
  })

  .directive("ngEnter", function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if (event.which === 13) {
          scope.$apply(function () {
            scope.$eval(attrs.ngEnter);
          });

          event.preventDefault();
        }
      });
    };
  })
  .directive("phonenumberDirective", [
    "$filter",
    function ($filter) {
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

        scope.$watch("inputValue", function (value, oldValue) {
          value = String(value);
          var number = value.replace(/[^0-9]+/g, "");
          scope.phonenumberModel = number;
          scope.inputValue = $filter("phonenumber")(number);
        });
      }

      return {
        link: link,
        restrict: "E",
        scope: {
          phonenumberPlaceholder: "=placeholder",
          phonenumberModel: "=model",
        },
        // templateUrl: '/static/phonenumberModule/template.html',
        template:
          '<input ng-model="inputValue" type="tel" class="phonenumber" placeholder="{{phonenumberPlaceholder}}" title="Phonenumber (Format: (999) 9999-9999)">',
      };
    },
  ])
  .directive("racurrency", function () {
    return {
      require: "ngModel",
      restrict: "A",
      link: function (scope, element, attr, ngModelCtrl) {
        element.bind('blur', function (e) {
          var text = e.target.value;
          var transformedInput = +text.replace(/[^0-9.]/g, "");

          transformedInput = (transformedInput).toFixed(transformedInput < 1 ? 4 : 2);
          e.target.value = transformedInput;

          return transformedInput;
        });
      },
    };
  })
  .filter("raCurrency", function() {
    return function (number) {
      if (!number || isNaN(number)) {
        return 0;
      }

      var digitAfterDecimal = number > 1 ? 2 : 4;

      return number.toFixed(digitAfterDecimal);
    };
  })
  .filter("phonenumber", function () {
    /*
    Format phonenumber as: c (xxx) xxx-xxxx
        or as close as possible if phonenumber length is not 10
        if c is not '1' (country code not USA), does not use country code
    */

    return function (number) {
      /*
        @param {Number | String} number - Number that will be formatted as telephone number
        Returns formatted number: (###) ###-####
            if number.length < 4: ###
            else if number.length < 7: (###) ###
        Does not handle country codes that are not '1' (USA)
        */
      if (!number) {
        return "";
      }

      number = String(number);

      // Will return formattedNumber.
      // If phonenumber isn't longer than an area code, just show number
      var formattedNumber = number;

      // if the first character is '1', strip it out and add it back
      var c = number[0] == "1" ? "1 " : "";
      number = number[0] == "1" ? number.slice(1) : number;

      // # (###) ###-#### as c (area) front-end
      var area = number.substring(0, 3);
      var front = number.substring(3, 6);
      var end = number.substring(6, 10);

      if (front) {
        formattedNumber = c + area + "-" + front;
      }
      if (end) {
        formattedNumber += "-" + end;
      }
      return formattedNumber;
    };
  })
  .directive("contenteditable", function() {
    return {
      restrict: "A",
      require: "ngModel",
      link: function(scope, element, attrs, ngModel) {

        function read() {
          ngModel.$setViewValue(element.html());
        }

        ngModel.$render = function() {
          element.html(ngModel.$viewValue || "");
        };

        element.bind("blur keyup change", function() {
          scope.$apply(read);
        });
      }
    };
  })
  .directive("dragDrop", [
    "$parse",
    function ($parse) {
      var sourceParent = "";
      var sourceIndex = -1;
      return {
        link: function ($scope, elm, attr, ctrl) {
          // #region Initialization

          // Get TBODY of a element
          var tbody = elm.parent();
          // Set draggable true
          elm.attr("draggable", true);
          // If id of TBODY of current element already set then it won't set again
          tbody.attr("drag-id") ? void 0 : tbody.attr("drag-id", $scope.$id);
          // This add drag pointer
          elm.css("cursor", "move");

          // Events of element :- dragstart | dragover | drop | dragend
          elm.on("dragstart", onDragStart);
          elm.on("dragover", onDragOver);
          elm.on("drop", onDrop);
          elm.on("dragend", onDragEnd);

          // #endregion

          // This will trigger when user pick e row
          function onDragStart(e) {
            //Mozilla Hack
            e.originalEvent.dataTransfer.setData("Text", "");

            if (!sourceParent) {
              // Set selected element's parent id
              sourceParent = tbody.attr("drag-id")
                ? tbody.attr("drag-id")
                : void 0;

              // Set selected element's index
              sourceIndex = $scope.$index;

              // This don't support in IE but other browser support it
              // This will set drag Image with it's position
              // IE automically set image by himself
              typeof e.originalEvent.dataTransfer.setDragImage !== "undefined"
                ? e.originalEvent.dataTransfer.setDragImage(e.target, -10, -10)
                : void 0;

              // This element will only drop to the element whose have drop effect 'move'
              e.originalEvent.dataTransfer.effectAllowed = "move";
            }
            return true;
          }

          // This will trigger when user drag source element on another element
          function onDragOver(e) {
            // Prevent Default actions
            e.preventDefault ? e.preventDefault() : void 0;
            e.stopPropagation ? e.stopPropagation() : void 0;

            // This get current elements parent id
            var targetParent = tbody.attr("drag-id")
              ? tbody.attr("drag-id")
              : void 0;

            // If user drag elemnt from its boundary then cursor will show block icon else it will show move icon [ i.e : this effect work perfectly in google chrome]
            e.originalEvent.dataTransfer.dropEffect =
              sourceParent !== targetParent ||
              typeof attr.ngRepeat === "undefined"
                ? "none"
                : "move";

            return false;
          }

          //This will Trigger when user drop source element on target element
          function onDrop(e) {
            // Prevent Default actions
            e.preventDefault ? e.preventDefault() : void 0;
            e.stopPropagation ? e.stopPropagation() : void 0;

            if (typeof attr.ngRepeat === "undefined") return false;
            // Get this item List
            var itemList = $parse(attr.ngRepeat.split("in")[1].trim())($scope);

            // Get target element's index
            var targetIndex = $scope.$index;

            // Get target element's parent id
            var targetParent = tbody.attr("drag-id")
              ? tbody.attr("drag-id")
              : void 0;

            // Get properties names which will be changed during the drag and drop
            var elements = attr.dragDrop
              ? attr.dragDrop.trim().split(",")
              : void 0;

            // If user dropped element into it's boundary and on another source not himself
            if (sourceIndex !== targetIndex && targetParent === sourceParent) {
              // If user provide element list by ','
              typeof elements !== "undefined"
                ? elements.forEach(function (element) {
                    element = element.trim();
                    typeof itemList[targetIndex][element] !== "undefined"
                      ? (itemList[targetIndex][element] = [
                          itemList[sourceIndex][element],
                          (itemList[sourceIndex][element] =
                            itemList[targetIndex][element]),
                        ][0])
                      : void 0;
                  })
                : void 0;
              // Visual row change
              itemList[targetIndex] = [
                itemList[sourceIndex],
                (itemList[sourceIndex] = itemList[targetIndex]),
              ][0];
              // After completing the task directive send changes to the controller
              $scope.$apply(function () {
                typeof attr.afterDrop != "undefined"
                  ? $parse(attr.afterDrop)($scope)({
                      sourceIndex: sourceIndex,
                      sourceItem: itemList[sourceIndex],
                      targetIndex: targetIndex,
                      targetItem: itemList[targetIndex],
                    })
                  : void 0;
              });
            }
          }
          // This will trigger after drag and drop complete
          function onDragEnd(e) {
            //clearing the source
            sourceParent = "";
            sourceIndex = -1;
          }
        },
      };
    },
  ]);
