'use strict';

/*
  An implementation of the AES algorithm, for testing purposes
*/

define(['aes/transformations'], function(Transformations) {
  var encrypt = function(plaintext, key) {
    var keyWords = key.length/4
    , rounds = 6 + keyWords
    , expandedKey = Transformations.expandKey(key)
    , state = plaintext.slice(0)
    ;

    Transformations.addRoundKey(state, expandedKey.slice(0, 16));

    for (var round = 0; round < rounds - 1; round++) {
      Transformations.subBytes(state);
      Transformations.shiftRows(state);
      Transformations.mixColumns(state);
      Transformations.addRoundKey(state, expandedKey.slice((round + 1)*16, (round + 2)*16));
    }

    Transformations.subBytes(state);
    Transformations.shiftRows(state);
    Transformations.addRoundKey(state, expandedKey.slice((round + 1)*16, (round + 2)*16));

    return state;
  }
  , decrypt = function(ciphertext, key) {
    var keyWords = key.length/4
    , rounds = 6 + keyWords
    , expandedKey = Transformations.expandKey(key)
    , state = ciphertext.slice(0)
    ;

    Transformations.addRoundKey(state, expandedKey.slice(rounds*16, (rounds+1)*16));

    for (var round = rounds - 1; round >= 1; round--) {
      Transformations.invShiftRows(state);
      Transformations.invSubBytes(state);
      Transformations.addRoundKey(state, expandedKey.slice(round*16, (round + 1)*16));
      Transformations.invMixColumns(state);
    }

    Transformations.invShiftRows(state);
    Transformations.invSubBytes(state);
    Transformations.addRoundKey(state, expandedKey.slice(0, 16));

    return state;
  }

  ;


  return {
    encrypt: encrypt,
    decrypt: decrypt
  };
});
