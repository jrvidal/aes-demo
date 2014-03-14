'use strict';
define(['jquery', 'backbone', 'underscore', 'hbs!state/template', 'state/animation'],
function($, Backbone, _, template, animation) {

  var View = Backbone.View.extend({

    /*
      @options.isVisible: a flag to indicate that the view should render
      without showing the individual bytes
    */

    initialize: function(options) {
      this.isVisible = _.isBoolean(options && options.isVisible) ?
        options.isVisible : true;
    },

    /*
      Animation methods.
      They start different animations that the view can show. After the animation is done
      the view triggers the 'done' event.

      @options.order: an optional array of integers in [0, 16) to specify the order
      of the byte animation

    */
    subBytesAnimation: function(newState, options) {
      var $cells = this.$('.state-cell')
      , id
      ;

      id = animation.subBytesAnimation(newState.toList(), $cells, options);

      listenToAnimation(this, id);
    },

    mixColumnsAnimation: function(newState) {
      var $cells = this.$('.state-cell')
      , id
      ;

      id = animation.mixColumnsAnimation(newState.toList(), $cells);
      listenToAnimation(this, id);
    },

    shiftRowsAnimation: function(direction) {
      var $cells = this.$('.state-cell')
      , id
      ;

      id = animation.shiftRowsAnimation($cells, direction);
      listenToAnimation(this, id);
    },

    addRoundKeyAnimation: function (options) {
      var $cells = this.$('.state-cell')
      , id
      ;

      id = animation.addRoundKeyAnimation($cells, options);
      listenToAnimation(this, id);
    },

    newRoundKeyAnimation: function(newRoundKey, options) {
      var $cells = this.$('.state-cell')
      , $newCells = $(template({cells: cellList(newRoundKey)})).find('.state-cell')
      , id
      ;

      id = animation.newRoundKeyAnimation($cells, $newCells, options);
      listenToAnimation(this, id);
    },

    render: function() {
      var list = cellList(this.model, this.isVisible);

      this.$el.html(template({
        cells: list
      }));

      return this;
    }
  })

  /*
    Starts listening to Animation waiting for a given @id,
    to trigger the 'done' event and clean afterwards.
  */
  , listenToAnimation = function(view, id) {
    view.listenTo(animation, 'done', function(eventID) {
      if (id === eventID) {
        view.stopListening(animation);
        view.trigger('done');
      }
    });
  }

  // Prepares the state model, if any, to be consumed by the template
  , cellList = function(model, isVisible) {
    // isVisible defaults to true, but if there is no model, there is nothing
    // to show
    isVisible = model !== null &&
      ( isVisible === undefined || isVisible );

    var list = isVisible ? model.toList() :
      _.times(16, function () {
        return '';
      });

    return _.map(list, function(entry, i) {
      return {
        value: entry,
        row: i % 4,
        column: (i - i % 4)/4
      };
    });
  }
  ;

  return View;
});
