'use strict';
define(['backbone', 'underscore', 'state/view', 'hbs!step/template',
  'algorithm/transformer', 'algorithm/operation'],
function(Backbone, _, StateView, template, Transformer, Operation) {
  var View = Backbone.View.extend({

    /*
      Triggers the appropriate animations in the state subviews to represent
      the next operation for this.step

      @nextStep is the next step after the operation
      @options.mode is the cipher mode: encryption or decryption
      @options.newKey indicates whether the acquisition of the new round key
      should be showed

      When the animations end, it triggers the 'done' event.
    */

    displayNextOp: function(nextStep, options) {
      var step = this.model
      , stateView = this.stateView
      , roundKeyView = this.roundKeyView
      , nextOp = step.get('nextOp')
      , direction = options.mode === Transformer.modes.ENCRYPT ? 1 : -1
      , order
      ;

      listenToViews(this);

      if (nextOp === Operation.SUB_BYTES) {

        stateView.subBytesAnimation(nextStep.get('state'));
        displayNextRoundKey(this, nextStep, options);

      } else if (nextOp === Operation.ADD_ROUND_KEY) {

        order = _.shuffle(_.range(0, 16));

        stateView.subBytesAnimation(nextStep.get('state'), {
          order: order
        });

        roundKeyView.addRoundKeyAnimation({
          order: order,
          direction: direction
        });

        this.isRoundKeyVisible = false;

      } else if (nextOp === Operation.MIX_COLUMNS) {

        stateView.mixColumnsAnimation(nextStep.get('state'));
        displayNextRoundKey(this, nextStep, options);

      } else if (nextOp === Operation.SHIFT_ROWS) {

        stateView.shiftRowsAnimation(direction);
        displayNextRoundKey(this, nextStep, options);

      }
    },

    render: function() {
      var json = this.model.toJSON();

      _.extend(json, {
        finished: this.model.isFinished(),
        result: this.model.isFinished() ? this.model.getStateAsString() : ''
      });

      this.$el.html(template(json));

      this.stateView = new StateView({
        model: this.model.get('state'),
        el: this.$('.aes-state')
      }).render();

      this.roundKeyView = new StateView({
        model: this.model.get('roundKey'),
        el: this.$('.roundkey'),
        isVisible: this.model.isFinished() ? false : this.isRoundKeyVisible
      }).render();

      return this;
    }
  })

  /*
    Starts listening to both @self stateView and roundKeyView for the 'done' event.
    It passes the 'done' event and cleans afterwards.
  */
  , listenToViews = function (self) {
    var listener = _.after(2, function() {
      self.stopListening(self.stateView);
      self.stopListening(self.roundKeyView);
      self.trigger('done');
    })
    ;

    self.listenTo(self.stateView, 'done', listener);
    self.listenTo(self.roundKeyView, 'done', listener);
  }

  /*
    Helper to perform the correct operation in the roundKey
  */
  , displayNextRoundKey = function (self, newStep, options) {
    if (options.newKey) {
      self.roundKeyView.newRoundKeyAnimation(newStep.get('roundKey'), {
        direction: options.mode === Transformer.modes.ENCRYPT ? 1 : -1
      });
    } else {
      self.roundKeyView.trigger('done');
    }
  }
  ;

  return View;

});
