/*
  Represents the internal state of the AES algorithm.
  It is also a valid representation of the round key.
*/
'use strict';
define(['backbone', 'underscore'],
function(Backbone, _) {

  /*
    private array rawState
  */

  var State = Backbone.Model.extend({
    initialize: function (collection) {
      if (!collection) {
        this._rawState = emptyState(16);
      } else if (collection instanceof Array) {
        this._rawState = collection.slice(0);
      } else if(collection instanceof State) {
        this._rawState = collection._rawState.slice(0);
      } else if (typeof collection === 'number') {
        this._rawState = emptyState(collection);
      }
    },

    length: function () {
      return this._rawState.length;
    },

    getByte: function (i) {
      return this._rawState[i];
    },

    clone: function () {
      return new State(this._rawState);
    },

    toString: function () {
      var str = '';

      for (var i = 0; i < this._rawState.length; i++) {
        str += toHex(this._rawState[i]);
      }

      return str;
    },

    toList: function() {
      var array = [];

      for (var i = 0; i < this._rawState.length; i++) {
        array.push(toHex(this._rawState[i]));
      }

      return array;
    },

    toArray: function () {
      return this._rawState.slice(0)
    },

    // Private, for testing purposes only
    equals: function (state) {
      return state instanceof State &&
        state.length() === this._rawState.length &&
        _.every(this._rawState, function (number, i) {
          return number === state.getByte(i);
        });
    }

  })
  , toHex = function (number) {
    return (number < 16 ? '0' : '') + number.toString(16);
  }
  , emptyState = function(number) {
    var array = [];

    for (var i = 0; i < number; i++) {
      array.push(0);
    }

    return array;
  }
  ;

  State.toHex = toHex;

  return State;
});
