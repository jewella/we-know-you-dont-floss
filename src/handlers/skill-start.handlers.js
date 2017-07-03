'use strict';

const Alexa = require('alexa-sdk');
const coreHandlers = require('./core.handlers');
const mixinHandlers = require('../modules/utils').mixinHandlers;
const SKILL_STATES = require('../enums').SKILL_STATES;
const getUserProfile = require('../modules/get-user-profile');
const getAppointment = require('../modules/get-appointment');
const res = require('../responses');


module.exports = Alexa.CreateStateHandler(SKILL_STATES.SKILL_START, mixinHandlers(coreHandlers, {
  SkillIntro() {
    res.ask.call(this, res.skillPrelude());
  },
  'AMAZON.NoIntent': function() {
    res.tell.call(this, res.goodbye());
  },
  'AMAZON.YesIntent': function() {
    // updates
    this.handler.state = SKILL_STATES.APPOINTMENT;

    // response
    getUserProfile(this.event.session.user.accessToken)
      .then((profile) => getAppointment(profile.email))
      .then((time) => {
        res.tell.call(this, res.appointment(time))
      })
      .catch((err) => console.log(err));
  },
  'AMAZON.CancelIntent': function() {
    res.tell.call(this, res.goodbye());
  },
  Unhandled() {
    console.log('unhandled');
  }
}))