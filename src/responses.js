/* eslint-ignore max-len */

'use strict';

module.exports.skillPrelude = () =>
  'Welcome, would you like to know when your next appointment is?';

module.exports.keepGoing = () =>
  'Would you like to keep going?';

module.exports.goodbye = () =>
  'Please try harder to remember to floss... and have a nice day.';

module.exports.help = () => 
  'You can check the date of your next appointment or request a new appointment date, which would you like?';

module.exports.yesOrNo = () =>
  'I\'m sorry is that a yes or no...?';

module.exports.appointment = (date, promotion = '') => date 
  ? `Your next appointment is on ${date}. By the way, ${promotion}... Would you like to hear the date again?`
  : `I'm sorry, I wasn't able to find an appointment date... Would you like me to check again?`;

module.exports.elicitDate = () =>
  'What day would you like your appointment?';

module.exports.elicitTime = () =>
  'What time would you like your appointment?';

module.exports.recapAppointment = (date, time) => {
  return `We will look into the availability on ${date} ${time} and contact you soon. Would you like any additional help?`;
}

module.exports.linkAccount = () =>
  'to start using this skill, please use the companian app to authenticate on Amazon';

module.exports.ask = function(sayWhat, continuation) {
  // updates
  this.attributes.previousState = this.handler.state;
  this.attributes.previousResponse = continuation || sayWhat;

  // response
  this.emit(':ask', sayWhat);
};

module.exports.tell = function(tellWhat) {
  this.emit(':tell', tellWhat);
};