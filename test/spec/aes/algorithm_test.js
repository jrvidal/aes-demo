/* global describe, it, assert */

'use strict';

define(['underscore', 'aes/algorithm', 'spec/aes/aes-test-vectors'],
function(_, AES, Vector) {

  var encryptionWorksFor = function(key, plaintext, ciphertext) {
    var encryptedPT = AES.encrypt(plaintext, key);

    return _.isEqual(ciphertext, encryptedPT);
  }
  , decryptionWorksFor = function(key, plaintext, ciphertext) {
    var decryptedCT = AES.decrypt(ciphertext, key);

    return _.isEqual(plaintext, decryptedCT);
  }
  ;

  describe('AES encryption', function() {

    it('should work for 128 bits keys', function() {
      assert(encryptionWorksFor(Vector.keys[0], Vector.plaintexts[0], Vector.ciphertexts[0][0]));
      assert(encryptionWorksFor(Vector.keys[0], Vector.plaintexts[1], Vector.ciphertexts[0][1]));
    });

    it('should work for 192 bit keys', function() {
      assert(encryptionWorksFor(Vector.keys[1], Vector.plaintexts[0], Vector.ciphertexts[1][0]));
      assert(encryptionWorksFor(Vector.keys[1], Vector.plaintexts[1], Vector.ciphertexts[1][1]));
    });

    it('should work for 256 bit keys', function() {
      assert(encryptionWorksFor(Vector.keys[2], Vector.plaintexts[0], Vector.ciphertexts[2][0]));
      assert(encryptionWorksFor(Vector.keys[2], Vector.plaintexts[1], Vector.ciphertexts[2][1]));
    });
  });

  describe('AES decryption', function() {
    it('should work for 128 bits keys', function() {
      assert(decryptionWorksFor(Vector.keys[0], Vector.plaintexts[0], Vector.ciphertexts[0][0]));
      assert(decryptionWorksFor(Vector.keys[0], Vector.plaintexts[1], Vector.ciphertexts[0][1]));
    });

    it('should work for 192 bit keys', function() {
      assert(decryptionWorksFor(Vector.keys[1], Vector.plaintexts[0], Vector.ciphertexts[1][0]));
      assert(decryptionWorksFor(Vector.keys[1], Vector.plaintexts[1], Vector.ciphertexts[1][1]));
    });

    it('should work for 256 bit keys', function() {
      assert(decryptionWorksFor(Vector.keys[2], Vector.plaintexts[0], Vector.ciphertexts[2][0]));
      assert(decryptionWorksFor(Vector.keys[2], Vector.plaintexts[1], Vector.ciphertexts[2][1]));
    });

  });

});
