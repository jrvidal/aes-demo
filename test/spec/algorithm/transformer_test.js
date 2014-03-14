/* global describe, it, assert */

'use strict';

define(['underscore', 'algorithm/transformer', 'algorithm/operation', 'step/model',
'spec/aes/aes-test-vectors'],
function(_, Transformer, Operation, Step, Vectors) {

  describe('Transformer', function() {
    it('initializes a step.', function() {
      var input = Vectors.plaintexts[0]
      , key = Vectors.keys[0]
      , mode = Transformer.modes.ENCRYPT
      , step
      ;

      step = Transformer.init(input, key, {
        mode: mode
      });

      assert(step instanceof Step);
      assert(step.get('round') === 0);
      assert(step.get('nextOp') === Operation.ADD_ROUND_KEY);
    });

    it('implements AES encryption correctly', function() {
      var input = Vectors.plaintexts[0]
      , key = Vectors.keys[0]
      , mode = Transformer.modes.ENCRYPT
      , step, rawState
      , result = Vectors.ciphertexts[0][0]
      ;

      step = Transformer.init(input, key, {
        mode: mode
      });

      while (!step.isFinished()) {
        step = Transformer.next(step, key, {
          mode: mode
        });
      }

      rawState = step.getRawState();

      assert(_.isEqual(rawState, result));

    });

    it('implements AES decryption correctly', function() {
      var input = Vectors.ciphertexts[0][0]
      , key = Vectors.keys[0]
      , mode = Transformer.modes.DECRYPT
      , step, rawState
      , result = Vectors.plaintexts[0]
      ;

      step = Transformer.init(input, key, {
        mode: mode
      });

      while (!step.isFinished()) {
        step = Transformer.next(step, key, {
          mode: mode
        });
      }

      rawState = step.getRawState();

      assert(_.isEqual(rawState, result));
    });
  });
});
