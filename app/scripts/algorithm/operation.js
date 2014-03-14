'use strict';
define(['underscore'], function(_) {

  var Operations = _.extend(Object.create(null), {
    SHIFT_ROWS: {value: 'SHIFT_ROWS'},
    MIX_COLUMNS: {value: 'MIX_COLUMNS'},
    SUB_BYTES: {value: 'SUB_BYTES'},
    ADD_ROUND_KEY: {value: 'ADD_ROUND_KEY'}
  });

  _.each(Operations, function(hash) {
    Object.freeze(hash);
  });

  Object.freeze(Operations);

  return Operations;
});
