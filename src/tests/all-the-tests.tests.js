/* eslint-disable max-len */

const assert = require('assert');
const skill = require('../index');
const context = require('aws-lambda-mock-context');
const nock = require('nock');
const uris = require('../uris');
const unauthenticatedSessionStartIntent = require('./event-samples/new-session/unauthenticated-session-start.intent');
const sessionStartIntent = require('./event-samples/new-session/session-start.intent');
const skillStartNoIntent = require('./event-samples/skill-start/no.intent');
const skillStartYesIntent = require('./event-samples/skill-start/yes.intent');
const skillStartCancelIntent = require('./event-samples/skill-start/cancel.intent');
const appointmentYesIntent = require('./event-samples/appointment/yes.intent');
const appointmentNoIntent = require('./event-samples/appointment/no.intent');
const appointmentCancelIntent = require('./event-samples/appointment/cancel.intent');

const {
  keepGoing,
  goodbye,
  yesOrNo,
  skillPrelude,
  appointment,
  linkAccount
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

const time = Date.now();
const promotion = 'you can earn 100 dollars off your next cleaning with any referral';

beforeEach(function() {
  const amazonProfileService = nock(uris.AMAZON_PROFILE_SERVICE.origin)
                                .get(uris.AMAZON_PROFILE_SERVICE.pathname)
                                .query(true)
                                .reply(200, {
                                  name: 'Bob Smith',
                                  email: 'bsmith@example.com'
                                });
  // const dynamodb = nock(uris.DYNAMODB_SERVICE.origin)
  //                   .post(uris.DYNAMODB_SERVICE.pathname)
  //                   .reply(200, { Item: { time: { S: time }}});
})

describe('Alexa, skill start', () => {
  it('should respond with with account link message and set the state to AUTHENTICATED if no token present', () =>
    runIntent(unauthenticatedSessionStartIntent)
      .then(({ outputSpeech, skillState }) => {
        assert.deepEqual(outputSpeech, sanitise(linkAccount()));
        assert.deepEqual(skillState, SKILL_STATES.AUTHENTICATE);
      }));

  it('should respond with skill prelude and set the state to SKILL_START', () =>
    runIntent(sessionStartIntent)
      .then(({ outputSpeech, skillState }) => {
        assert.deepEqual(outputSpeech, sanitise(skillPrelude()));
        assert.deepEqual(skillState, SKILL_STATES.SKILL_START);
      }));

  describe('negative response to skill prelude', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(skillStartNoIntent)
        .then(({ outputSpeech, endOfSession}) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession);
        }));
  });

  describe('cancel response to skill prelude', () => {
    it('should respond with goodbye and end the session', () =>
      runIntent(skillStartCancelIntent)
        .then(({ outputSpeech, endOfSession }) => {
          assert.deepEqual(outputSpeech, sanitise(goodbye()));
          assert(endOfSession);
        }));
  });

  describe('positive response to skill prelude', () => {
    it('should respond with the appointment date and set the state to APPOINTMENT_REQUEST', () =>
      runIntent(skillStartYesIntent)
        .then(({ outputSpeech, skillState }) => {
          assert.deepEqual(outputSpeech, sanitise(appointment(time, promotion)));
          assert.deepEqual(skillState, SKILL_STATES.APPOINTMENT);
        }).catch((err) => console.log(err)));

    describe('positive response to appointment message', () => {
      it('should respond with the appointment message again', () => 
        runIntent(appointmentYesIntent)
          .then(({ outputSpeech, skillState }) => {
            assert.deepEqual(outputSpeech, sanitise(appointment(time, promotion)));
            assert.deepEqual(skillState, SKILL_STATES.APPOINTMENT);
          }));
    });

    describe('negative response to appointment message', () => {
      it('should respond with goodbye and end the session', () =>
        runIntent(appointmentNoIntent)
          .then(({ outputSpeech, endOfSession }) => {
            assert.deepEqual(outputSpeech, sanitise(goodbye()));
            assert(endOfSession);
          }));
    });

    describe('cancel response to appointment message', () => {
      it('should respond with goodbye and end the session', () =>
        runIntent(appointmentCancelIntent)
          .then(({ outputSpeech, endOfSession }) => {
            assert.deepEqual(outputSpeech, sanitise(goodbye()));
            assert(endOfSession);
          }));
    });
  });
});
