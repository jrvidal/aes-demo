/* global describe, it, assert */

'use strict';

define(['underscore', 'state/model'],
function(_, State) {

  describe('State', function () {

    it('creates a default state', function() {
      assert((new State()).length() === 16);
    });

    it('creates an state of arbitraty length', function () {
      assert((new State(5)).length() === 5);
    });

    it('constructs an state from an array', function () {
      var array = [1, 3, 4, 30, 13]
      , state = new State(array)
      ;

      assert(state.length() === array.length);

      assert(_.every(array, function(number, i) {
        return state.getByte(i) === number;
      }));
    });

    it('accepts an state in the constructor', function() {
      var state = new State([3, 1, 0, 3])
      , copy = new State(state)
      ;

      assert(state.equals(copy));
    });

    it('allows to clone itself', function () {
      var array = [0, 3, 4, 6, 9]
      , state = new State(array)
      , clone = state.clone()
      ;

      assert(state.equals(clone));
    });

    it('implements toString as a string of bytes', function () {
      var state = new State([0, 1, 2, 3, 4])
      , str = state.toString()
      , strByte
      ;

      for (var i = 0; i < str.length; i+=2) {
        strByte = parseInt(str.slice(i, i + 2), 16);
        assert(strByte === state.getByte(i/2));
      }
    });

    it('#equals (private)', function() {
      var array = [3, 1, 5, 0, 1, 30]
      , state = new State(array)
      , copy = new State(array)
      ;

      assert(state.equals(copy));
      assert(copy.equals(state));
    });

    it('#toList', function() {
      var array = [2, 200, 12, 39, 4, 56]
      , list = (new State(array)).toList()
      ;

      assert(_.every(array, function (number, i) {
        return State.toHex(number) === list[i];
      }));

    });

  });

});
