'use strict';

const Alexa = require('alexa-sdk');
const coreHandlers = require('./core.handlers');
const mixinHandlers = require('../modules/utils').mixinHandlers;
const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');
const getAppointment = require('../modules/get-appointment');
const getUserProfile = require('../modules/get-user-profile');
const getPromotion = require('../modules/get-promotion');

const appointmentTimeHandler = function() {
    // updates
    this.handler.state = SKILL_STATES.APPOINTMENT;

    // response
    getUserProfile({ token: this.event.session.user.accessToken })
      .then((options) => getAppointment(options))
      .then((options) => getPromotion(options))
      .then((options) => res.tell.call(this, res.appointment(options.time, options.promotion)))
      .catch((err) => console.log(err));
}

module.exports = Alexa.CreateStateHandler(SKILL_STATES.APPOINTMENT, mixinHandlers(coreHandlers, {
  AppointmentTime: appointmentTimeHandler,
  'AMAZON.YesIntent': appointmentTimeHandler,
  'AMAZON.NoIntent': function() {
    res.tell.call(this, res.goodbye());
  },
  Unhandled() {
    console.log('unhandled');
  }
}))