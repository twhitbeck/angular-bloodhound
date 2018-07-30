/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

(function() {
  'use strict';
  
  var module = angular.module('bloodhound.transport', ['bloodhound.lru-cache']);
  
  module.factory('Transport', function($http, $q, $timeout, LruCache) {
    var Transport = (function() {
      var pendingRequestsCount = 0,
          pendingRequests = {},
          maxPendingRequests = 6,
          requestCache = new LruCache(10),
          lastUrl = '';

      // constructor
      // -----------

      function Transport(o) {
        o = o || {};

        this._send = o.transport ? callbackToPromise(o.transport) : $http.get;
        this._get = o.rateLimiter ? o.rateLimiter(this._get) : this._get;
      }

      // static methods
      // --------------

      Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
        maxPendingRequests = num;
      };

      Transport.resetCache = function clearCache() {
        requestCache = new LruCache(10);
      };

      // instance methods
      // ----------------

      angular.extend(Transport.prototype, {

        // ### private

        _get: function(url, o, cb) {
          if (url !== lastUrl) {
            return;
          }

          var that = this, promise;

          // a request is already in progress, piggyback off of it
          if (promise = pendingRequests[url]) {
            promise.then(dataPassthrough(done), fail);
          }

          // under the pending request threshold, so fire off a request
          else if (pendingRequestsCount < maxPendingRequests) {
            pendingRequestsCount++;
            pendingRequests[url] =
              this._send(url, o).then(dataPassthrough(done), fail).finally(always);
          }

          // at the pending request threshold, so hang out in the on deck circle
          else {
            this.onDeckRequestArgs = [].slice.call(arguments, 0);
          }

          function done(resp) {
            cb && cb(null, resp);
            requestCache.set(url, resp);
          }

          function fail() {
            cb && cb(true);
          }

          function always() {
            pendingRequestsCount--;
            delete pendingRequests[url];

            // ensures request is always made for the last query
            if (that.onDeckRequestArgs) {
              that._get.apply(that, that.onDeckRequestArgs);
              that.onDeckRequestArgs = null;
            }
          }
        },

        // ### public

        get: function(url, o, cb) {
          var resp;

          if (angular.isFunction(o)) {
            cb = o;
            o = {};
          }

          lastUrl = url;

          // in-memory cache hit
          if (resp = requestCache.get(url)) {
            // defer to stay consistent with behavior of ajax call
            $timeout(function() {
              cb && cb(null, resp);
            }, 0);
            //_.defer(function() { cb && cb(null, resp); });
          }

          else {
            this._get(url, o, cb);
          }

          // return bool indicating whether or not a cache hit occurred
          return !!resp;
        }
      });

      return Transport;

      // helper functions
      // ----------------

      function callbackToPromise(fn) {
        return function customSendWrapper(url, o) {
          var deferred = $q.defer();

          fn(url, o, onSuccess, onError);

          return deferred.promise;

          function onSuccess(resp) {
            // defer in case fn is synchronous, otherwise done
            // and always handlers will be attached after the resolution
            $timeout(function() {
              deferred.resolve(resp);
            }, 0);
            //_.defer(function() { deferred.resolve(resp); });
          }

          function onError(err) {
            // defer in case fn is synchronous, otherwise done
            // and always handlers will be attached after the resolution
            $timeout(function() {
              deferred.reject(err);
            }, 0);
            //_.defer(function() { deferred.reject(err); });
          }
        };
      }
    })();

    function dataPassthrough(fn) {
      return function(response) {
        fn(response.data);
      };
    }
    
    return Transport;
  });
})();
