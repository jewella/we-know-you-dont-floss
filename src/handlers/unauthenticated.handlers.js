'use strict';

const Alexa = require('alexa-sdk');
const coreHandlers = require('./core.handlers');
const mixinHandlers = require('../modules/utils').mixinHandlers;
const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');

module.exports = Alexa.CreateStateHandler(SKILL_STATES.UNAUTHENTICATED, mixinHandlers(coreHandlers, {
  Unhandled() {
    if (!this.event.session.user.accessToken) {
      // updates
      this.handler.state = SKILL_STATES.UNAUTHENTICATED;
      
      // response
      this.emit(':tellWithLinkAccountCard', res.linkAccount());
    } else {
      // updates
      this.handler.state = SKILL_STATES.SKILL_START;

      // response
      this.emitWithState('SkillIntro');
    }
  }
}))