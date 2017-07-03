'use strict';

const Alexa = require('alexa-sdk');
const coreHandlers = require('./core.handlers');
const mixinHandlers = require('../modules/utils').mixinHandlers;
const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');
const getAppointment = require('../modules/get-appointment');
const getUserProfile = require('../modules/get-user-profile');

module.exports = Alexa.CreateStateHandler(SKILL_STATES.APPOINTMENT, mixinHandlers(coreHandlers, {
  'AMAZON.YesIntent': function() {
    // updates
    this.handler.state = SKILL_STATES.APPOINTMENT;

    // response
    getUserProfile(this.event.session.user.accessToken, (err) => { console.error(err); }, (profile) => {
      getAppointment(profile.email, () => {}, (appointment) => {
        res.ask.call(this, res.appointment());
      });
    });
  },
  'AMAZON.NoIntent': function() {
    res.tell.call(this, res.goodbye());
  },
  Unhandled() {
    console.log('unhandled');
  }
}))