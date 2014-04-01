(function() {
  'use strict';

  var module = angular.module('bloodhound.util', []);

  module.factory('util', function($timeout) {
    return {
      debounce: function(func, wait, immediate) {
        var promise, result;

        return function() {
          var context = this, args = arguments, later, callNow;

          later = function() {
            promise = null;
            if (!immediate) { result = func.apply(context, args); }
          };

          callNow = immediate && !promise;

          $timeout.cancel(promise);
          //clearTimeout(timeout);
          promise = $timeout(later, wait);
          //timeout = setTimeout(later, wait);

          if (callNow) { result = func.apply(context, args); }

          return result;
        };
      },

      throttle: function(func, wait) {
        var context, args, timeout, result, previous, later;

        previous = 0;
        later = function() {
          previous = new Date();
          timeout = null;
          result = func.apply(context, args);
        };

        return function() {
          var now = new Date(),
          remaining = wait - (now - previous);

          context = this;
          args = arguments;

          if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
          }

          else if (!timeout) {
            timeout = setTimeout(later, remaining);
          }

          return result;
        };
      }
    };
  });
})();
