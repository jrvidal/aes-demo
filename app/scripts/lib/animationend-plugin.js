'use strict';
/*
  Cross-browser shim for 'animationend'
*/
define(['jquery', 'underscore'], function($, _) {

  var eventNames = [
    [
      'animationend',
      'webkitAnimationEnd',
      'oanimationend',
      'MSAnimationEnd'
    ].join(' ')
  ];

  $.fn.onAnimationEnd = function() {
    var args = _.toArray(arguments);
    this.on.apply(this, eventNames.concat(args));
    return this;
  };

  $.fn.offAnimationEnd = function() {
    this.off(eventNames);
    return this;
  };

});
