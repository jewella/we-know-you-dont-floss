'use strict';

const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');

module.exports = {
  'AMAZON.StopIntent': function() {
    // updates
    this.handler.state = SKILL_STATES.STOPPED;

    // response
    this.emit(':ask', res.keepGoing());
  },
  'AMAZON.CancelIntent': function() {
    this.emit(':tell', res.goodbye());
  },
  SessionEndedRequest() {
    console.log(`${this.handler.state || 'NO_STATE'} ended: ${this.event.request.reason}`);
  },
};
