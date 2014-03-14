'use strict';
define(function() {
  /*
    AES Constants
  */

  var MIXCOL_WORD = [0x02, 0x01, 0x01, 0x03]
  , INV_MIXCOL_WORD = [0x0e, 0x09, 0x0d, 0x0b]
  , ROTWORD_WORD = [0x00, 0x00, 0x00, 0x01]
  , RCON_WORDS = []
  , SHIFTS = [0, 1, 2, 3]
  , INV_SHIFTS = [0, 3, 2, 1]
  , S_MATRIX = [
    [0x63, 0xca, 0xb7, 0x04, 0x09, 0x53, 0xd0, 0x51, 0xcd, 0x60, 0xe0, 0xe7, 0xba, 0x70, 0xe1, 0x8c],
    [0x7c, 0x82, 0xfd, 0xc7, 0x83, 0xd1, 0xef, 0xa3, 0x0c, 0x81, 0x32, 0xc8, 0x78, 0x3e, 0xf8, 0xa1],
    [0x77, 0xc9, 0x93, 0x23, 0x2c, 0x00, 0xaa, 0x40, 0x13, 0x4f, 0x3a, 0x37, 0x25, 0xb5, 0x98, 0x89],
    [0x7b, 0x7d, 0x26, 0xc3, 0x1a, 0xed, 0xfb, 0x8f, 0xec, 0xdc, 0x0a, 0x6d, 0x2e, 0x66, 0x11, 0x0d],
    [0xf2, 0xfa, 0x36, 0x18, 0x1b, 0x20, 0x43, 0x92, 0x5f, 0x22, 0x49, 0x8d, 0x1c, 0x48, 0x69, 0xbf],
    [0x6b, 0x59, 0x3f, 0x96, 0x6e, 0xfc, 0x4d, 0x9d, 0x97, 0x2a, 0x06, 0xd5, 0xa6, 0x03, 0xd9, 0xe6],
    [0x6f, 0x47, 0xf7, 0x05, 0x5a, 0xb1, 0x33, 0x38, 0x44, 0x90, 0x24, 0x4e, 0xb4, 0xf6, 0x8e, 0x42],
    [0xc5, 0xf0, 0xcc, 0x9a, 0xa0, 0x5b, 0x85, 0xf5, 0x17, 0x88, 0x5c, 0xa9, 0xc6, 0x0e, 0x94, 0x68],
    [0x30, 0xad, 0x34, 0x07, 0x52, 0x6a, 0x45, 0xbc, 0xc4, 0x46, 0xc2, 0x6c, 0xe8, 0x61, 0x9b, 0x41],
    [0x01, 0xd4, 0xa5, 0x12, 0x3b, 0xcb, 0xf9, 0xb6, 0xa7, 0xee, 0xd3, 0x56, 0xdd, 0x35, 0x1e, 0x99],
    [0x67, 0xa2, 0xe5, 0x80, 0xd6, 0xbe, 0x02, 0xda, 0x7e, 0xb8, 0xac, 0xf4, 0x74, 0x57, 0x87, 0x2d],
    [0x2b, 0xaf, 0xf1, 0xe2, 0xb3, 0x39, 0x7f, 0x21, 0x3d, 0x14, 0x62, 0xea, 0x1f, 0xb9, 0xe9, 0x0f],
    [0xfe, 0x9c, 0x71, 0xeb, 0x29, 0x4a, 0x50, 0x10, 0x64, 0xde, 0x91, 0x65, 0x4b, 0x86, 0xce, 0xb0],
    [0xd7, 0xa4, 0xd8, 0x27, 0xe3, 0x4c, 0x3c, 0xff, 0x5d, 0x5e, 0x95, 0x7a, 0xbd, 0xc1, 0x55, 0x54],
    [0xab, 0x72, 0x31, 0xb2, 0x2f, 0x58, 0x9f, 0xf3, 0x19, 0x0b, 0xe4, 0xae, 0x8b, 0x1d, 0x28, 0xbb],
    [0x76, 0xc0, 0x15, 0x75, 0x84, 0xcf, 0xa8, 0xd2, 0x73, 0xdb, 0x79, 0x08, 0x8a, 0x9e, 0xdf, 0x16]
  ]
  , INV_S_MATRIX = [
    [0x52, 0x7c, 0x54, 0x08, 0x72, 0x6c, 0x90, 0xd0, 0x3a, 0x96, 0x47, 0xfc, 0x1f, 0x60, 0xa0, 0x17],
    [0x09, 0xe3, 0x7b, 0x2e, 0xf8, 0x70, 0xd8, 0x2c, 0x91, 0xac, 0xf1, 0x56, 0xdd, 0x51, 0xe0, 0x2b],
    [0x6a, 0x39, 0x94, 0xa1, 0xf6, 0x48, 0xab, 0x1e, 0x11, 0x74, 0x1a, 0x3e, 0xa8, 0x7f, 0x3b, 0x04],
    [0xd5, 0x82, 0x32, 0x66, 0x64, 0x50, 0x00, 0x8f, 0x41, 0x22, 0x71, 0x4b, 0x33, 0xa9, 0x4d, 0x7e],
    [0x30, 0x9b, 0xa6, 0x28, 0x86, 0xfd, 0x8c, 0xca, 0x4f, 0xe7, 0x1d, 0xc6, 0x88, 0x19, 0xae, 0xba],
    [0x36, 0x2f, 0xc2, 0xd9, 0x68, 0xed, 0xbc, 0x3f, 0x67, 0xad, 0x29, 0xd2, 0x07, 0xb5, 0x2a, 0x77],
    [0xa5, 0xff, 0x23, 0x24, 0x98, 0xb9, 0xd3, 0x0f, 0xdc, 0x35, 0xc5, 0x79, 0xc7, 0x4a, 0xf5, 0xd6],
    [0x38, 0x87, 0x3d, 0xb2, 0x16, 0xda, 0x0a, 0x02, 0xea, 0x85, 0x89, 0x20, 0x31, 0x0d, 0xb0, 0x26],
    [0xbf, 0x34, 0xee, 0x76, 0xd4, 0x5e, 0xf7, 0xc1, 0x97, 0xe2, 0x6f, 0x9a, 0xb1, 0x2d, 0xc8, 0xe1],
    [0x40, 0x8e, 0x4c, 0x5b, 0xa4, 0x15, 0xe4, 0xaf, 0xf2, 0xf9, 0xb7, 0xdb, 0x12, 0xe5, 0xeb, 0x69],
    [0xa3, 0x43, 0x95, 0xa2, 0x5c, 0x46, 0x58, 0xbd, 0xcf, 0x37, 0x62, 0xc0, 0x10, 0x7a, 0xbb, 0x14],
    [0x9e, 0x44, 0x0b, 0x49, 0xcc, 0x57, 0x05, 0x03, 0xce, 0xe8, 0x0e, 0xfe, 0x59, 0x9f, 0x3c, 0x63],
    [0x81, 0xc4, 0x42, 0x6d, 0x5d, 0xa7, 0xb8, 0x01, 0xf0, 0x1c, 0xaa, 0x78, 0x27, 0x93, 0x83, 0x55],
    [0xf3, 0xde, 0xfa, 0x8b, 0x65, 0x8d, 0xb3, 0x13, 0xb4, 0x75, 0x18, 0xcd, 0x80, 0xc9, 0x53, 0x21],
    [0xd7, 0xe9, 0xc3, 0xd1, 0xb6, 0x9d, 0x45, 0x8a, 0xe6, 0xdf, 0xbe, 0x5a, 0xec, 0x9c, 0x99, 0x0c],
    [0xfb, 0xcb, 0x4e, 0x25, 0x92, 0x84, 0x06, 0x6b, 0x73, 0x6e, 0x1b, 0xf4, 0x5f, 0xef, 0x61, 0x7d]
  ]
  /*
    @byte: an integer in 0-255
    @returns the product of the bytes modulo productModulus, considering them
    as polynomials over GF(2)
  */
  , byteProduct = function(byteA, byteB) {
    var result = 0;

    for (var i = 0; i < 8; i++) {
      if (byteA % 2 === 1) {
        byteA = byteA >> 1;
      } else {
        byteA = byteA >> 1;
        continue;
      }

      result ^= (byteB << i);
    }

    return polyRemainder(result);
  }

  /*
    A @word is an array of 4 bytes, [a0, a1, a2, a3].

    @returns the product of the words, considering them as polynomials,
    with byte coefficients. These coefficients are multiplied using byteProduct
    and added through XOR

    The most significant byte for the purposes of this product is a3!
  */
  , wordProduct = function(wordA, wordB) {
    var result = [0, 0, 0, 0];

    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        result[i] ^= byteProduct(wordA[(j + i) % 4], wordB[(4 + i - ((j + i) % 4)) % 4]);
      }
    }

    return result;
  }

  /*
    @semiword: an integer in the range 0-65535

    @returns the remainder of @semiword divided by productModulus,
    considering them as polynomials over the field GF(2)
  */
  , polyRemainder = function(semiword) {
    while (semiword >= 256) {
      var index = 0
      , copy = semiword
      ;

      while (copy > 0) {
        copy = copy >>> 1;
        index++;
      }

      semiword ^= (productModulus << (index - 9));
    }

    return semiword;
  }
  , productModulus = 0x011b
  ;

  var power = 0x01;
  for (var i = 1; i < 12; i++) {
    RCON_WORDS[i] = [power, 0, 0, 0];
    power = byteProduct(power, 0x02);
  }

  return {
    MIXCOL_WORD: MIXCOL_WORD,
    INV_MIXCOL_WORD: INV_MIXCOL_WORD,
    SHIFTS: SHIFTS,
    INV_SHIFTS: INV_SHIFTS,
    S_MATRIX: S_MATRIX,
    INV_S_MATRIX: INV_S_MATRIX,
    ROTWORD_WORD: ROTWORD_WORD,
    RCON_WORDS: RCON_WORDS,

    byteProduct: byteProduct,
    wordProduct: wordProduct,
  };
});