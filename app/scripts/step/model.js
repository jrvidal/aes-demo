'use strict';
define(['backbone', 'underscore', 'state/model'], function(Backbone, _, State) {
  /*
    int @round
    algorithm/operation nextOp
    Key (State) roundKey
    State state
  */

  var Step = Backbone.Model.extend({

    defaults: function () {
      return {
        round: 0,
        // To be used when `undefined`
        state: new State(),
        roundKey: new State()
      };
    },

    initialize: function (attrs) {
      attrs = attrs || {};
      this._finished = false;

      _.each(['state', 'roundKey'], function (prop) {
        var value = attrs[prop];

        if (value) {
          this.attributes[prop] = new State(value);
        }

        this.on('change:' + prop, parser, {prop: prop});
      }, this);

    },

    isFinished: function () {
      return this._finished;
    },

    setFinished: function () {
      this._finished = true;
    },

    getRawState: function () {
      return this.attributes.state && this.attributes.state.toArray();
    },

    getStateAsString: function() {
      return this.attributes.state && this.attributes.state.toString();
    },

    getRawRoundKey: function () {
      return this.attributes.roundKey && this.attributes.roundKey.toArray();
    }

  })
  , parser = function (step, state) {
    // Options are passed as context
    var options = this;

    if (! (state instanceof State) && state !== null) {
      step.attributes[options.prop] = new State(state);
    }
  }

  ;
  return Step;
});
