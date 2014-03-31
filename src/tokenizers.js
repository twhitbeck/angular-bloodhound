/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

(function() {
  'use strict';
  
  var module = angular.module('bloodhound.tokenizers', []);
  
  module.factory('tokenizers', function() {
    var tokenizers = (function() {

      return {
        nonword: nonword,
        whitespace: whitespace,
        obj: {
          nonword: getObjTokenizer(nonword),
          whitespace: getObjTokenizer(whitespace)
        }
      };

      function whitespace(s) { return s.split(/\s+/); }

      function nonword(s) { return s.split(/\W+/); }

      function getObjTokenizer(tokenizer) {
        return function setKey(key) {
          return function tokenize(o) { return tokenizer(o[key]); };
        };
      }
    })();
    
    return tokenizers;
  });
})();