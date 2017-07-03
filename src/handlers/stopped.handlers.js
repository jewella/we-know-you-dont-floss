'use strict';

const Alexa = require('alexa-sdk');
const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');

module.exports = Alexa.CreateStateHandler(SKILL_STATES.STOPPED, {
  'AMAZON.YesIntent': function() {
    // updates
    this.handler.state = this.attributes.previousState;

    // response
    this.emit(':ask', this.attributes.previousResponse);
  },
  'AMAZON.NoIntent': function() {
    this.emit(':tell', res.goodbye());
  },
  Unhandled() {
    this.emit(':ask', res.yesOrNo());
  },
  SessionEndedRequest() {
    console.log(`${GAME_STATES.STOPPED} ended: ${this.event.request.reason}`);
  },
});
