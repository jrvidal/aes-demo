'use strict';
define(['underscore', 'step/model', 'algorithm/operation', 'aes/transformations'],
function(_, Step, Operation, Transformations) {
  var Transformer = {

    init: function(input, key, options) {
      var step = new Step({
        state: input
      })
      , rounds = roundsNumber(key)
      , round = options.mode === ENCRYPT_MODE ? 0 : rounds
      , roundKey = Transformations.expandKey(key).slice(round*16, (round + 1)*16)
      ;

      step.set({
        nextOp: Operation.ADD_ROUND_KEY,
        round: 0,
        roundKey: roundKey
      });

      return step;
    },

    next: function(step, key, options) {
      var newStep = step.clone();

      if (options.mode === ENCRYPT_MODE) {
        encrypt(newStep, key);
      } else {
        decrypt(newStep, key);
      }

      return newStep;
    }
  }

  , roundsNumber = function(key) {
    return key.length/4 + 6;
  }
  , ENCRYPT_MODE = {value: 'ENCRYPT'}
  , DECRYPT_MODE = {value: 'DECRYPT'}

  , encrypt = function(step, key) {

    var state = step.getRawState()
    , roundKey = step.getRawRoundKey()
    , round = step.get('round')
    , rounds = roundsNumber(key)
    , nextOp = step.get('nextOp')
    ;

    rounds = rounds || roundsNumber(key);

    if (nextOp === Operation.ADD_ROUND_KEY) {

      Transformations.addRoundKey(state, roundKey);

      if (round >= rounds) {

        step.setFinished();
        roundKey = null;

      } else {

        round++;
        roundKey = Transformations.expandKey(key).slice(round*16, (round+1)*16);
        nextOp = Operation.SUB_BYTES;

      }

    } else if (nextOp === Operation.SUB_BYTES) {

      Transformations.subBytes(state);
      nextOp = Operation.SHIFT_ROWS;

    } else if (nextOp === Operation.SHIFT_ROWS) {

      Transformations.shiftRows(state);
      nextOp = round === rounds ? Operation.ADD_ROUND_KEY : Operation.MIX_COLUMNS;

    } else if (nextOp === Operation.MIX_COLUMNS) {

      Transformations.mixColumns(state);
      nextOp = Operation.ADD_ROUND_KEY;

    }

    step.set({
      nextOp: nextOp,
      round: round,
      roundKey: roundKey,
      state: state
    });

  }
  , decrypt = function(step, key) {

    var roundKeyIndex
    , state = step.getRawState()
    , roundKey = step.getRawRoundKey()
    , round = step.get('round')
    , rounds = roundsNumber(key)
    , nextOp = step.get('nextOp')
    ;


    if (nextOp === Operation.ADD_ROUND_KEY) {

      Transformations.addRoundKey(state, roundKey);

      if (round === rounds) {

        step.setFinished();
        roundKey = null;

      } else if (round === 0) {

        round++;

        roundKeyIndex = rounds - round;

        roundKey = Transformations.expandKey(key)
                    .slice(roundKeyIndex*16, (roundKeyIndex + 1)*16);

        nextOp = Operation.SHIFT_ROWS;

      } else {

        nextOp = Operation.MIX_COLUMNS;

      }

    } else if (nextOp === Operation.SUB_BYTES) {

      Transformations.invSubBytes(state);
      nextOp = Operation.ADD_ROUND_KEY;

    } else if (nextOp === Operation.SHIFT_ROWS) {

      Transformations.invShiftRows(state);
      nextOp = Operation.SUB_BYTES;

    } else if (nextOp === Operation.MIX_COLUMNS) {

      Transformations.invMixColumns(state);
      round++;

      roundKeyIndex = rounds - round;

      roundKey = Transformations.expandKey(key)
                  .slice(roundKeyIndex*16, (roundKeyIndex + 1)*16);

      nextOp = Operation.SHIFT_ROWS;

    }

    step.set({
      nextOp: nextOp,
      round: round,
      roundKey: roundKey,
      state: state
    });

  }

  ;


  _.extend(Transformer, {
    modes: {
      ENCRYPT: ENCRYPT_MODE,
      DECRYPT: DECRYPT_MODE,
    },
    roundsNumber: roundsNumber
  });

  return Transformer;
});
