'use strict';

process.env.PATH = `${process.env.PATH}:${process.env.LAMBDA_TASK_ROOT}`;

const Alexa = require('alexa-sdk');
const newSessionHandlers = require('./handlers/new-session.handlers');
const stoppedHandlers = require('./handlers/stopped.handlers');
const skillStartHandlers = require('./handlers/skill-start.handlers');
const appointmentDateHandlers = require('./handlers/appointment-date.handlers');
const newAppointmentHandlers = require('./handlers/new-appointment.handlers');
const unauthenticatedHandlers = require('./handlers/unauthenticated.handlers');

module.exports.handler = function (event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = event.session.application.applicationId;

  //console.log(event)

  alexa.registerHandlers(
    newSessionHandlers,
    stoppedHandlers,
    skillStartHandlers,
    appointmentDateHandlers,
    newAppointmentHandlers,
    unauthenticatedHandlers
  );
  alexa.execute();
};
