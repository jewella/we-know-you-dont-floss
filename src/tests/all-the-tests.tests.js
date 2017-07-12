/* eslint-disable max-len */

const assert = require('assert');
const skill = require('../index');
const context = require('aws-lambda-mock-context');
const nock = require('nock');
const moment = require('moment');
const uris = require('../uris');
const unauthenticatedSessionStartIntent = require('./event-samples/new-session/unauthenticated-session-start.intent');
const sessionStartIntent = require('./event-samples/new-session/session-start.intent');
const newSessionAppointmentTimeIntent = require('./event-samples/new-session/appointment-time.intent');
const newSessionNewAppointmentIntent = require('./event-samples/new-session/new-appointment.intent');
const skillStartNoIntent = require('./event-samples/skill-start/no.intent');
const skillStartYesIntent = require('./event-samples/skill-start/yes.intent');
const skillStartCancelIntent = require('./event-samples/skill-start/cancel.intent');
const skillStartHelpIntent = require('./event-samples/skill-start/help.intent');
const skillStartAppointmentTimeIntent = require('./event-samples/skill-start/appointment-time.intent');
const skillStartNewAppointmentIntent = require('./event-samples/skill-start/new-appointment.intent');
const appointmentYesIntent = require('./event-samples/appointment/yes.intent');
const appointmentNoIntent = require('./event-samples/appointment/no.intent');
const appointmentCancelIntent = require('./event-samples/appointment/cancel.intent');
const appointmentHelpIntent = require('./event-samples/appointment/help.intent');
const NewAppointmentNewAppointmentIntentRequestComplete = require('./event-samples/new-appointment/new-appointment-request-completed.intent');
const NewAppointmentNewAppointmentIntentTimeMissing = require('./event-samples/new-appointment/new-appointment-time-missing.intent');
const NewAppointmentNewAppointmentIntentDateMissing = require('./event-samples/new-appointment/new-appointment-date-missing.intent');
const NewAppointmentNoIntent = require('./event-samples/new-appointment/no.intent');
const NewAppointmentYesIntent = require('./event-samples/new-appointment/yes.intent');

const {
  keepGoing,
  goodbye,
  yesOrNo,
  skillPrelude,
  appointment,
  elicitTime,
  elicitDate,
  recapAppointment,
  linkAccount,
  help
} = require('../responses');
const { SKILL_STATES } = require('../enums');

const sanitise = text => text.replace(/\n/g, '');

const getOutputSpeech = ({ response: { outputSpeech: { ssml } } }) =>
  sanitise(ssml).match(/<speak>(.*)<\/speak>/i)[1].trim();
const getAttribute = ({ sessionAttributes }, attr) => sessionAttributes[attr];
const runIntent = intent => new Promise(res => {
  const ctx = context();
  skill.handler(intent, ctx);

  ctx
    .Promise
    .then(obj => {
      // console.log(obj);
      res({
        endOfSession: obj.response.shouldEndSession,
        outputSpeech: getOutputSpeech(obj),
        skillState: getAttribute(obj, 'STATE'),
      });
    })
    .catch(err => {
      throw new Error(err);
    });
});

const now = Date.now();
const time = moment(now).calendar();
const appointmentRequest = { date: '2017-04-21', time: 'in the afternoon' }
const promotion = 'you can earn 100 dollars off your next cleaning with any referral';

beforeEach(function() {
  const amazonProfileService = nock(uris.AMAZON_PROFILE_SERVICE.origin)
                                .get(uris.AMAZON_PROFILE_SERVICE.pathname)
                                .query(true)
                                .reply(200, {
                                  name: 'Bob Smith',
                                  email: 'bsmith@example.com'
                                });
  const dbAppointment = nock(uris.DYNAMODB_SERVICE.origin)
                    .post(uris.DYNAMODB_SERVICE.pathname)
                    .reply(200, { Item: { time: { N: now }}});                                
  const dbPromotion = nock(uris.DYNAMODB_SERVICE.origin)
                    .post(uris.DYNAMODB_SERVICE.pathname)
                    .reply(200, { Item: { text: { S: promotion }}});
})

describe('Open', () => {
  it('should respond with with account link message and set the state to AUTHENTICATE if no token present', () =>
    runIntent(unauthenticatedSessionStartIntent)
      .then(({ outputSpeech, skillState }) => {
        assert.deepEqual(outputSpeech, sanitise(linkAccount()));
        assert.deepEqual(skillState, SKILL_STATES.AUTHENTICATE);
      }));

  it('should respond with skill prelude and set the state to SKILL_START if account linked', () =>
    runIntent(sessionStartIntent)
      .then(({ outputSpeech, skillState }) => {
        assert.deepEqual(outputSpeech, sanitise(skillPrelude()));
        assert.deepEqual(skillState, SKILL_STATES.SKILL_START);
      }));

  describe('No', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(skillStartNoIntent)
        .then(({ outputSpeech, endOfSession}) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession);
        }));
  });

  describe('Cancel', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(skillStartCancelIntent)
        .then(({ outputSpeech, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession);
        }));
  });

  describe('Help', () => {
    it('should respond with help message', () =>
      runIntent(skillStartHelpIntent)
        .then(({ outputSpeech }) => {
          assert.deepEqual(outputSpeech, sanitise(help()));
        }));
  });

  describe('NewAppointment', () => {
    it('should respond with the elicit date message and set the state to NEW_APPOINTMENT', () =>
      runIntent(skillStartNewAppointmentIntent)
        .then(({ outputSpeech, skillState, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(elicitDate()));
          assert.deepEqual(skillState, SKILL_STATES.NEW_APPOINTMENT);
          assert(!endOfSession);
        }));
  });

  describe('AppointmentTime', () => {
    it('should respond with the appointment message and set the state to APPOINTMENT_DATE', () =>
      runIntent(skillStartAppointmentTimeIntent)
        .then(({ outputSpeech, skillState }) => {
          assert.deepEqual(outputSpeech, sanitise(appointment(time, promotion)))
          assert.deepEqual(skillState, SKILL_STATES.APPOINTMENT_DATE);
        }));
  });

  describe('Yes', () => {
    it('should respond with the appointment date and set the state to APPOINTMENT_DATE', () =>
      runIntent(skillStartYesIntent)
        .then(({ outputSpeech, skillState }) => {
          assert.deepEqual(outputSpeech, sanitise(appointment(time, promotion)));
          assert.deepEqual(skillState, SKILL_STATES.APPOINTMENT_DATE);
        }).catch((err) => console.log(err)));
  });
});

describe('AppointmentTime', ()  => {
  it('should respond with the appointment message and set the state to APPOINTMENT_DATE', () =>
    runIntent(newSessionAppointmentTimeIntent)
      .then(({ outputSpeech, skillState }) => {
        assert.deepEqual(outputSpeech, sanitise(appointment(time, promotion)));
        assert.deepEqual(skillState, SKILL_STATES.APPOINTMENT_DATE);
      }));
  describe('Yes', () => {
    it('should respond with the appointment message again', () => 
      runIntent(appointmentYesIntent)
        .then(({ outputSpeech, skillState }) => {
          assert.deepEqual(outputSpeech, sanitise(appointment(time, promotion)));
          assert.deepEqual(skillState, SKILL_STATES.APPOINTMENT_DATE);
        }));
  });

  describe('No', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(appointmentNoIntent)
        .then(({ outputSpeech, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession);
        }));
  });

  describe('Cancel', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(appointmentCancelIntent)
        .then(({ outputSpeech, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession);
        }));
  });

  describe('Help', () => {
    it('should respond with help message', () =>
      runIntent(appointmentHelpIntent)
        .then(({ outputSpeech }) => {
          assert.deepEqual(outputSpeech, sanitise(help()));
        }));
  });
});

describe('NewAppointment', () => {
  it('should respond with the new appointment recap message and set the state to NEW_APPOINTMENT', () =>
    runIntent(newSessionNewAppointmentIntent)
      .then(({ outputSpeech, skillState }) => {
        assert.deepEqual(outputSpeech, sanitise(recapAppointment(appointmentRequest.date, appointmentRequest.time)));
        assert.deepEqual(skillState, SKILL_STATES.NEW_APPOINTMENT);
      }));

  describe('Request Completed', () => {
    it('should respond with the appointment recap message', () =>
      runIntent(NewAppointmentNewAppointmentIntentRequestComplete)
        .then(({ outputSpeech, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(recapAppointment(appointmentRequest.date, appointmentRequest.time)));
          assert(!endOfSession);
        }));
  });

  describe('Time Missing', () => {
    it('should respond with the prompt for the time', () =>
      runIntent(NewAppointmentNewAppointmentIntentTimeMissing)
        .then(({ outputSpeech, skillState, endOfSession}) => {
          assert.deepEqual(outputSpeech, sanitise(elicitTime()));
          assert.deepEqual(skillState, SKILL_STATES.NEW_APPOINTMENT);
          assert(!endOfSession);
        }));
  });

  describe('Date missing', () => {
    it('should respond with the prompt for the date', () =>
      runIntent(NewAppointmentNewAppointmentIntentDateMissing)
        .then(({ outputSpeech, skillState, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(elicitDate()));
          assert.deepEqual(skillState, SKILL_STATES.NEW_APPOINTMENT);
          assert(!endOfSession);
        }));
  });

  describe('No', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(NewAppointmentNoIntent)
        .then(({ outputSpeech, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession)
        }));
  });

  describe('Yes', () => {
    it('should set the state to SKILL_START and respond with the skill intro message', () =>
      runIntent(NewAppointmentYesIntent)
        .then(({ outputSpeech, skillState, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(skillPrelude()));
          assert.deepEqual(skillState, SKILL_STATES.SKILL_START);
          assert(!endOfSession);
        }));
  });
});