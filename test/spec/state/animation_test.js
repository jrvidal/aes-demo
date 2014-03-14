'use strict';

define(['underscore', 'jquery', 'backbone', 'state/animation'],
function(_, $, Backbone, Animation) {

  describe('Animation', function() {
    var newStateArray
    , clock
    , $cells
    , listener
    , fakeOnAnimationEnd = function (callback) {
      _.times(this.length, callback);
    }
    , realOnAnimationEnd = $.fn.onAnimationEnd
    ;

    beforeEach(function() {
      newStateArray = _.range(0, 16).map(function(n) {
        return n.toString();
      });

      clock = sinon.useFakeTimers();

      $cells = $();

      _.times(16, function(i) {
        var $el = $('<div class="test-cell" data-row="' + (i % 4) +
          '" data-column="' + Math.floor(i/4) + '"><div class="test-value"></div></div>');

        $cells = $cells.add($el);
      });

      listener = new Backbone.Model();
    });

    afterEach(function () {
      clock.restore();

      $.fn.onAnimationEnd = realOnAnimationEnd;

      listener.stopListening();
    });

    describe('.subBytesAnimation', function () {
      it('animates the cells in the appropriate order.', function () {
        Animation.subBytesAnimation(newStateArray, $cells, {
          order: _.range(0, 16)
        });

        assert(_.every($cells, function (cell, i) {
          var $children = $(cell).children();

          return $children.length === 2 &&
            $children.eq(1).text() === newStateArray[i];
        }));

        clock.tick(0);

        _.times(16, function(i) {
          var $cell = $cells.eq(i);


          assert($cell.hasClass(Animation.classes.SUB_BYTES));

          clock.tick(Animation.delays.SUB_BYTES);
        });
      });

      it('emits the "done" event', function(done) {
        $.fn.onAnimationEnd = fakeOnAnimationEnd;

        var id = Animation.subBytesAnimation(newStateArray, $cells);

        listener.listenTo(Animation, 'done', function (eventId) {
          assert(eventId === id);
          done();
        });

        clock.tick(Animation.delays.SUB_BYTES*15);
      });
    });

    describe('.mixColumnsAnimation', function () {
      it('animates the columns', function() {

        Animation.mixColumnsAnimation(newStateArray, $cells);

        clock.tick(0);

        _.times(4, function(colNumber) {
          var $cell;


          for (var i = 4*colNumber; i < 4*(colNumber + 1); i++) {
            $cell = $cells.eq(i);

            assert($cell.hasClass(Animation.classes.MIX_COLUMNS));
            assert($cell.children().text() === newStateArray[i]);
          }

          clock.tick(Animation.delays.MIX_COLUMNS);
        });
      });

      it('triggers the "done" event', function(done) {
        $.fn.onAnimationEnd = fakeOnAnimationEnd;

        var id = Animation.mixColumnsAnimation(newStateArray, $cells);

        listener.listenTo(Animation, 'done', function (eventId) {
          assert(id === eventId);
          done();
        });

        clock.tick(Animation.delays.MIX_COLUMNS*3);
      });
    });

    describe('.shiftRowsAnimation', function () {
      var $parent;

      beforeEach(function () {
        $parent = $('<div></div>');

        $parent.append($cells);
      });

      it('animates the rows', function() {
        var $allCells;

        Animation.shiftRowsAnimation($cells);

        $allCells = $parent.find('.' + Animation.classes.SHIFT_ROWS);

        assert($parent.hasClass(Animation.classes.SHIFT_ROWS_PARENT));
        assert($allCells.length === 32, 'Cell class added');

        clock.tick(0);

        _.times(3, function (rowNumber) {
          rowNumber = rowNumber + 1;

          var $row = $allCells.filter('[data-row="' + rowNumber + '"]');

          assert(_.every($row, function (cell) {
            return $(cell).hasClass(Animation.classes.SHIFT_ROWS_ROW + rowNumber);
          }));

          clock.tick(Animation.delays.SHIFT_ROWS);
        });
      });

      it('triggers the "done" event', function(done) {
        $.fn.onAnimationEnd = fakeOnAnimationEnd;

        var id = Animation.shiftRowsAnimation($cells);

        listener.listenTo(Animation, 'done', function (eventId) {
          assert(eventId === id);
          done();
        });

        clock.tick(Animation.delays.SHIFT_ROWS*2);
      });
    });

    describe('.addRoundKeyAnimation', function () {

      it('animates the cells', function() {
        Animation.addRoundKeyAnimation($cells, {
          order: _.range(0, 16)
        });

        clock.tick(0);

        _.each($cells, function (cell) {
          var $cell = $(cell);

          assert($cell.hasClass(Animation.classes.ADD_ROUND_KEY));

          clock.tick(Animation.delays.ADD_ROUND_KEY);
        });
      });

      it('triggers the "done" event', function (done) {
        $.fn.onAnimationEnd = fakeOnAnimationEnd;

        var id = Animation.addRoundKeyAnimation($cells, {
          order: _.range(16)
        });

        listener.listenTo(Animation, 'done', function(eventId) {
          listener.stopListening();
          assert(eventId === id);
          done();
        });

        clock.tick(Animation.delays.ADD_ROUND_KEY*16);
      });

    });

    describe('.newRoundKeyAnimation', function () {
      var $newCells
      , $allCells
      , $parent
      ;

      beforeEach(function() {

        $parent = $('<div></div>');

        $parent.append($cells);

        $newCells = $cells.clone().each(function (cell, i) {
          $(cell).text(i + 100);
        });
      });

      it('should animate the new round key', function() {
        Animation.newRoundKeyAnimation($cells, $newCells);

        $allCells = $cells.add($newCells);

        assert($parent.hasClass(Animation.classes.NEW_ROUND_KEY_PARENT));

        clock.tick(0);

        _.times(4, function (i) {
          var $row = $newCells.filter('[data-row="' + i + '"]');

          assert(_.every($row, function (cell) {
            return $(cell).hasClass(Animation.classes.NEW_ROUND_KEY_ROW);
          }));

          clock.tick(Animation.delays.NEW_ROUND_KEY);
        });
      });

      it('triggers the "done" event', function(done) {
        $.fn.onAnimationEnd = fakeOnAnimationEnd;

        var id = Animation.newRoundKeyAnimation($cells, $newCells);

        listener.listenTo(Animation, 'done', function (eventId) {
          listener.stopListening();
          assert(id === eventId);
          done();
        });

        clock.tick(Animation.delays.NEW_ROUND_KEY*4);
      });
    });

  });
});
