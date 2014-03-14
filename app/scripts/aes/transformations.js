'use strict';
define(['underscore', 'aes/utils'], function(_, Utils) {

  /*
    The @state parameter reprensents an array of 16 bytes.
  */

  // @shifts: a 4-length array of row shifts
  var shiftRowsStrategy = function(shifts) {
    return function(state) {
      var copy = state.slice(0);

      for (var i = 0; i < state.length; i++) {
        var row = i % 4
        , column = (i - row)/4
        ;

        state[i] = copy[row + 4 * ((column + shifts[row]) % 4)];
      }
    };
  }

  // @polynomial: a 4-bytes array to be multiplied with state columns
  , mixColumnsStrategy = function(polynomial) {
    return function(state) {
      var copy = state.slice(0);

      for (var col = 0; col < 4; col++) {
        var word = copy.slice(col*4, (col + 1)*4);

        word = Utils.wordProduct(polynomial, word);

        for (var row = 0; row < 4; row++) {
          state[row + 4*col] = word[row];
        }
      }
    };
  }

  // @matrix: a 16-by-16 matrix that defines the bytes substitution
  , subBytesStrategy = function(matrix) {
    return function(state) {
      var length = state.length;

      for (var i = 0; i < length; i++) {
        state[i] = matrix[state[i] % 16][(state[i] >> 4)];
      }
    };
  }
  , subBytes = subBytesStrategy(Utils.S_MATRIX)
  , invSubBytes = subBytesStrategy(Utils.INV_S_MATRIX)

  /*
    @key: an array of bytes, with length 16, 24 or 32
    @returns the expanded key concatenating the individual keys in one big array
  */
  , expandKey = function(key) {
    var keyWords = key.length/4
    , rounds = 6 + keyWords
    , expandedKeyWords = 4*(rounds + 1)
    , expandedKey = _.range(4*expandedKeyWords)
    , tempWord
    ;

    for (var i = 0; i < key.length; i++) {
      expandedKey[i] = key[i];
    }

    for (i = key.length; i < expandedKey.length; i++) {
      expandedKey[i] = 0;
    }

    for (i = keyWords; i < expandedKeyWords; i++) {
      tempWord = expandedKey.slice(4*(i-1), 4*i);

      if (i % keyWords === 0) {
        // RotWord(tempWord)
        tempWord = Utils.wordProduct(Utils.ROTWORD_WORD, tempWord);
        // SubWord(tempWord)
        subBytes(tempWord);

        // xor RconWord[i/keyWords]
        for (var j = 0; j < 4; j++) {
          tempWord[j] ^= Utils.RCON_WORDS[i/keyWords][j];
        }

      } else if ( keyWords > 6 && i % keyWords === 4) {
        // SubWord(tempWord)
        subBytes(tempWord);
      }

      for (var k = 0; k < 4; k++) {
        expandedKey[4*i + k] = expandedKey[4*(i - keyWords) + k] ^ tempWord[k];
      }
    }

    return expandedKey;
  }

  /*
    Performs the XOR of the given byte arrays of length 16
  */
  , addRoundKey = function(state, roundKey) {

    for (var i = 0; i < state.length; i++) {
      state[i] ^= roundKey[i];
    }
  }
  ;

  return {
    subBytes: subBytes,
    invSubBytes: invSubBytes,
    shiftRows: shiftRowsStrategy(Utils.SHIFTS),
    invShiftRows: shiftRowsStrategy(Utils.INV_SHIFTS),
    mixColumns: mixColumnsStrategy(Utils.MIXCOL_WORD),
    invMixColumns: mixColumnsStrategy(Utils.INV_MIXCOL_WORD),
    addRoundKey: addRoundKey,
    expandKey: expandKey
  };
});
