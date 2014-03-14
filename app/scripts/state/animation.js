'use strict';

define(['underscore', 'jquery', 'backbone', 'text!state/animation-settings.json', 'lib/animationend-plugin'],
function(_, $, Backbone, animationSettings) {

  var id = 0

  /*
    Animation singleton. Inherits from the Events module from Backbone.
  */
  , Animation = _.clone(Backbone.Events)

  , settings = JSON.parse(animationSettings)
  , delays = settings.delays
  , classes = settings.classes

  /*

    All somethingAnimation methods trigger an asynchronous animation and
    @return and id.

    When the animation is done, the Animation singleton triggers a 'done' event
    with the correspondent id.
  */

  , subBytesAnimation = function(newStateArray, $cells, options) {
    var order = options && options.order
    , id = newID()
    , done = doneCallback($cells.length, id)
    ;

    if (!order) {
      order = _.shuffle(_.range(0, 16));
    }

    _.each($cells, function(cell, i) {
      var $cell = $(cell);
      $cell.append($cell.children().clone().text(newStateArray[i]));
    });

    _.each($cells, subBytesIterator(newStateArray, order, done));

    return id;
  }

  , mixColumnsAnimation = function(newStateArray, $cells) {
    var columns = getCellsGroups(4)
    , id = newID()
    , done = doneCallback(newStateArray.length, id)
    ;

    // Group cells in columns
    _.each($cells, function(cell, i) {
      var col = cell.dataset.column;
      columns[col].push($cells[i]);
    });

    _.each(columns, mixColumnsIterator(newStateArray, done));

    return id;
  }

  , shiftRowsAnimation = function($cells, direction) {
    var rows = getCellsGroups(4)
    , id = newID()
    , done = doneCallback((rows.length - 1)*8, id)
    , $parent = $cells.first().parent()
    , $copy = $cells.clone()
    , $allCells = $cells.add($copy)
    ;

    direction = direction || 1;

    $parent
      .addClass(classes.SHIFT_ROWS_PARENT)
      [direction > 0 ? 'append' : 'prepend']($copy);

    $allCells
      .addClass(direction > 0 ? classes.SHIFT_ROWS : classes.INV_SHIFT_ROWS);

    _.each($allCells, function(cell) {
      rows[cell.dataset.row].push(cell);
    });

    _.each(rows.slice(1), shiftRowsIterator(done));

    return id;
  }

  , addRoundKeyAnimation = function($cells, options) {
    var id = newID()
    , order = options.order
    , done = doneCallback($cells.length, id)
    ;

    _.each($cells, addRoundKeyIterator(done, order));

    return id;
  }

  , newRoundKeyAnimation = function ($cells, $newCells, options) {
    var id = newID()
    , $allCells = $cells.add($newCells)
    , done = doneCallback($allCells.length, id)
    , direction = options && options.direction
    , $parent = $cells.first().parent()
    , rows = getCellsGroups(4)
    ;

    direction = direction || 1;

    $parent
      .addClass(direction > 0 ? classes.NEW_ROUND_KEY_PARENT : classes.INV_NEW_ROUND_KEY_PARENT)
      [direction > 0 ? 'append' : 'prepend']($newCells);

    _.each($allCells, function (cell, i) {
      rows[ i % 4 ].push(cell);
    });

    _.each(rows, newRoundKeyIterator(done));

    return id;
  }

  // @returns an iterator that applies SubByte animation to each cell
  , subBytesIterator = function(newStateArray, order, done) {
    return function(cell, i) {
      var $cell = $(cell);

      _.delay(function() {
        $cell
          .addClass(classes.SUB_BYTES)
          .children()
          .text(newStateArray[i]);

        $cell.onAnimationEnd(function() {
          $cell.offAnimationEnd().removeClass(classes.SUB_BYTES);
          done();
        });
      }, delays.SUB_BYTES*order[i]);
    };
  }

  // @returns an iterator that applies the MixColumns animation to each column
  , mixColumnsIterator = function(newStateArray, done) {
    return function(column, colNumber) {
      _.delay(function() {
        $(column)
          .each(function (rowNumber, cell) {
            cell.children[0].textContent = newStateArray[4*colNumber + rowNumber];
          })
          .addClass(classes.MIX_COLUMNS)
          .onAnimationEnd(function() {
            $(this).offAnimationEnd().removeClass(classes.MIX_COLUMNS);
            done();
          });
      }, delays.MIX_COLUMNS * colNumber);
    };
  }

  // @returns an iterator that applies the ShiftRows animation to each row
  , shiftRowsIterator = function(done) {
    return function(row, rowNumber) {
      _.delay(function () {
        $(row)
          .addClass(classes.SHIFT_ROWS_ROW + (rowNumber + 1))
          .onAnimationEnd(function() {
            $(this).offAnimationEnd();
            done();
          });
      }, delays.SHIFT_ROWS*rowNumber);
    };
  }

  // @returns an iterator that applies AddRoundKey animation to each cell
  , addRoundKeyIterator = function (done, order) {
    return function (cell, i) {
      _.delay(function () {
        var $cell = $(cell);

        $cell
          .addClass(classes.ADD_ROUND_KEY)
          .onAnimationEnd(function () {
            $cell.offAnimationEnd();
            done();
          });
      }, order[i]*delays.ADD_ROUND_KEY);
    };
  }

  , newRoundKeyIterator = function (done) {
    return function (row, i) {
      _.delay(function () {
        $(row)
          .addClass(classes.NEW_ROUND_KEY_ROW)
          .onAnimationEnd(function () {
            $(this).offAnimationEnd();
            done();
          });
      }, i*delays.NEW_ROUND_KEY);
    };
  }

  /*
    @returns a 'done' callback. After @count calls, it will trigger the
    'done' event *once*, attaching the correspondent @id to the event
  */
  , doneCallback = function(count, id) {
    return _.after(count, _.once(function() {
      Animation.trigger('done', id);
    }));
  }

  , newID = function() {
    return id++;
  }

  // Lame array of arrays constructor
  , getCellsGroups = function(number) {
    return _.times(number, function() {
      return [];
    });
  }
  ;


  _.extend(Animation, {
    subBytesAnimation: subBytesAnimation,
    mixColumnsAnimation: mixColumnsAnimation,
    shiftRowsAnimation: shiftRowsAnimation,
    addRoundKeyAnimation: addRoundKeyAnimation,
    newRoundKeyAnimation: newRoundKeyAnimation,


    delays: delays,
    classes: classes
  });

  return Animation;
});
