/* global describe, it, assert */

'use strict';

define(['underscore', 'step/model', 'state/model'], function(_, Step, State) {

  describe('Step', function() {
    it('should create a default step', function() {
      var step = new Step();

      assert(step.get('round') === 0);
      assert(step.get('state') instanceof State);
      assert(step.get('roundKey') instanceof State);
    });

    it('should parse the "state" attribute on construction', function() {
      var array = [0, 3, 5, 7, 1]
      , step = new Step({
        state: array
      });

      assert(step.get('state').equals(new State(array)));
    });

    it('should parse the "state" attribute on setting', function() {
      var array = [3, 4, 6, 1, 0]
      , step = new Step()
      , state
      ;

      step.set('state', array);
      state = step.get('state');

      assert(step.get('state').equals(new State(array)));

    });

    it('should parse the "roundKey" attribute on construction and setting', function() {
      var array = [3, 4, 1, 4, 5]
      , step = new Step({
        roundKey: array
      })
      ;

      assert(step.get('roundKey').equals(new State(array)));

      step.unset('roundKey');

      step.set('roundKey', array);

      assert(step.get('roundKey').equals(new State(array)));
    });

    it('exposes the finished status', function() {
      var step = new Step();

      assert(!step.isFinished());

      step.setFinished();

      assert(step.isFinished());
    });

    it('can hold a null state or roundKey', function() {
      var step = new Step({
        state: null,
        roundKey: [0, 1]
      });

      assert(step.get('state') === null);

      step.set('roundKey', null);

      assert(step.get('roundKey') === null);
    });

    it('#getRawState and #getRawRoundKey returns the states as arrays', function() {
      var step = new Step()
      , array = [0, 4, 7, 1, 0]
      ;

      step.set('state', array);
      step.set('roundKey', array);

      assert(_.isEqual(step.getRawState(), array));
      assert(_.isEqual(step.getRawRoundKey(), array));
    });

    it('#getStateAsString', function() {
      var step = new Step({
        state: [0x10, 0xad, 0x1e, 0x24]
      });

      assert(step.getStateAsString(), '10ad1e24');
    });

  });
});
