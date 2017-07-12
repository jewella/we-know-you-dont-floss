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
    const intent = (this.event.request.intent && this.event.request.intent.name) || 'SkillIntro';

    switch (intent) {
      case 'NewAppointment':
        this.handler.state = SKILL_STATES.NEW_APPOINTMENT;
        break;
      default:
        this.handler.state = SKILL_STATES.SKILL_START;
        break;
    }

    // response
    this.emitWithState(intent);
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
