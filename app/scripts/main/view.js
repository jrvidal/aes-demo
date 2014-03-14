'use strict';

define(['backbone', 'underscore', 'step/view', 'algorithm/transformer', 'state/model', 'algorithm/operation'],
function(Backbone, _, StepView, Transformer, State, Operation) {

  var View = Backbone.View.extend({

    /*
      input: array
      key: array
      mode: Transformer.mode

    */

    events: {
      'submit .aes-settings': 'run',
      'click .random': 'random'
    },

    random: function (e) {
      e.preventDefault();
      this.$('[name="aes-input"]').val(randomString());
      this.$('[name="aes-key"]').val(randomString());
      this.run();
    },

    parse: function() {
      var mode = this.$('[name="aes-mode"]').val() === 'encrypt' ?
        Transformer.modes.ENCRYPT : Transformer.modes.DECRYPT;

      this.input = parseInputText(this.$('[name="aes-input"]').val());
      this.key = parseInputText(this.$('[name="aes-key"]').val());
      this.aesOptions = {
        mode: mode
      };
    },

    run: function(e) {
      if (e) {
        e.preventDefault();
      }

      this.parse();

      var step = Transformer.init(this.input, this.key, this.aesOptions);

      this.stepView = new StepView({
        el: this.$('.step'),
        model: step
      });

      this.renderStep();
      _.delay(_.bind(this.loop, this), START_DELAY);
    },

    loop: function () {
      var step = this.stepView.model
      , newStep
      ;

      if (step.isFinished()) {
        return;
      }

      newStep = Transformer.next(step, this.key, this.aesOptions);

      this.listenTo(this.stepView, 'done', function() {
        this.stopListening(this.stepView);

        this.stepView.model = newStep;
        this.renderStep();

        _.delay(_.bind(this.loop, this), DELAY);
      });

      this.stepView.displayNextOp(newStep, {
        mode: this.aesOptions.mode,
        newKey: needsNewKey(step, this.aesOptions.mode)
      });
    },


    renderStep: function () {
      this.stepView.isRoundKeyVisible = isRoundKeyVisible(this, this.stepView.model);
      this.stepView.render();
    }
  })

  , DELAY = 1

  , START_DELAY = 300

  // Parses the text in the view inputs
  , parseInputText = function (str) {
    return _(str.split(''))
      .chain()
      .groupBy(function (char, i) {
        return Math.floor(i/2);
      })
      .toArray()
      .map(function (twoCharsArray) {
        return parseInt(twoCharsArray.join(''), 16);
      })
      .value();
  }

  // Generates a random 16 bytes hex string
  , randomString = function () {
    var array = [];
    for (var i = 0; i < 32; i++) {
      array.push(_.random(0, 15));
    }
    return array.map(function (number) {
      return number.toString(16);
    })
    .join('');
  }

  // Helper to decide whether the round key should be visible when showing the @step
  , isRoundKeyVisible = function (self, step) {
    var isEncryption = self.aesOptions.mode === Transformer.modes.ENCRYPT
    , nextOp = step.get('nextOp')
    ;

    if (isEncryption) {
      return nextOp !== Operation.SUB_BYTES;
    } else {
      return ! ( nextOp === Operation.MIX_COLUMNS || nextOp === Operation.SHIFT_ROWS  );
    }
  }

  // Helper to decide whether the next operation of @step should involve
  // the renewal of the round key
  , needsNewKey = function  (step, mode) {
    var isEncryption = mode === Transformer.modes.ENCRYPT
    , nextOp = step.get('nextOp')
    ;

    if (isEncryption) {
      return nextOp === Operation.SUB_BYTES;
    } else {
      return nextOp === Operation.SHIFT_ROWS;
    }
  }

  ;

  return View;
});
