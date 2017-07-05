'use strict';

const Alexa = require('alexa-sdk');
const coreHandlers = require('./core.handlers');
const mixinHandlers = require('../modules/utils').mixinHandlers;
const SKILL_STATES = require('../enums').SKILL_STATES;
const getUserProfile = require('../modules/get-user-profile');
const getAppointment = require('../modules/get-appointment');
const getPromotion = require('../modules/get-promotion');
const res = require('../responses');


module.exports = Alexa.CreateStateHandler(SKILL_STATES.SKILL_START, mixinHandlers(coreHandlers, {
  LaunchRequest() {
    res.ask.call(this, res.skillPrelude());
  },
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
    getUserProfile({ token: this.event.session.user.accessToken })
      .then((options) => getAppointment(options))
      .then((options) => getPromotion(options))
      .then((options) => res.ask.call(this, res.appointment(options.time, options.promotion)))
      .catch((err) => console.log(err));
  },
  AppointmentTime() {
    // updates
    this.handler.state = SKILL_STATES.APPOINTMENT;

    this.emitWithState('AppointmentTime');
  },
  Unhandled() {
    console.log('unhandled');
  }
}))