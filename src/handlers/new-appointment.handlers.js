'use strict';

const Alexa = require('alexa-sdk');
const coreHandlers = require('./core.handlers');
const { mixinHandlers, delegateSlotCollection, isSlotValid } = require('../modules/utils');
const SKILL_STATES = require('../enums').SKILL_STATES;
const res = require('../responses');
const getUserProfile = require('../modules/get-user-profile');
const requestAppointment = require('../modules/request-appointment');

module.exports = Alexa.CreateStateHandler(SKILL_STATES.NEW_APPOINTMENT, mixinHandlers(coreHandlers, {
  NewAppointment() {

    const validDate = isSlotValid.call(this, 'date') || this.attributes.date;
    const validTime = isSlotValid.call(this, 'time') || this.attributes.time;

    // check if we have a date
    if (!validDate) return res.ask.call(this, res.elicitDate());
  
    // store the date in session in not already there
    if (!this.attributes.date) this.attributes.date = validDate;

    // check if we have a time
    if (!validTime) return res.ask.call(this, res.elicitTime());

    // store the time in session if not already there
    if (!this.attributes.time) this.attributes.time = validTime;

    const { date, time } = this.attributes;

    let timeOutput;

    switch(time) {
      case 'NI':
        timeOutput = 'at night';
        break;
      case 'MO':
        timeOutput = 'in the morning';
        break;
      case 'AF':
        timeOutput = 'in the afternoon';
        break;
      case 'EV':
        timeOutput = 'in the evening';
        break;
      default:
        timeOutput = `at ${time}`;
        break;
    }

    // clear out the attributes for the next request
    this.attributes.date = undefined;
    this.attributes.time = undefined;

    getUserProfile({ token: this.event.session.user.accessToken, date, time })
      .then((options) => requestAppointment(options))
      .then((options) => res.ask.call(this, res.ask.call(this, res.recapAppointment(date, timeOutput))))
      .catch((err) => console.log(err));
  },
  "AMAZON.NoIntent"() {
    res.tell.call(this, res.goodbye());
  },
  "AMAZON.YesIntent"() {
    this.handler.state = SKILL_STATES.SKILL_START;

    this.emitWithState('SkillIntro');
  },
  Unhandled() {
    console.log('unhandled');
  }
}))