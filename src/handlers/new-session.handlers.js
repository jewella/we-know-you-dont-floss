'use strict';

const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');

const setStateAndInvokeEntryIntent = function() {
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
};

module.exports = {
  NewSession() {
    setStateAndInvokeEntryIntent.call(this);
  },
  LaunchRequest() {
    setStateAndInvokeEntryIntent.call(this);
  },
  Unhandled() {
    console.log('unhandled');
  },
};
