/* eslint-ignore max-len */

'use strict';

module.exports.skillPrelude = () =>
  'Welcome, would you like to know when your next appointment is? Not that it matters...';

module.exports.keepGoing = () =>
  'Would you like to keep going?';

module.exports.goodbye = () =>
  'Please try harder to remember to floss... and have a nice day.';

module.exports.yesOrNo = () =>
  'I\'m sorry is that a yes or no...?';

module.exports.appointment = (date) =>
  `Your next appointment is on ${date}. Please avoid drinking coffee beforehand... Would you like to hear the date again?`;

module.exports.linkAccount = () =>
  'to start using this skill, please use the companian app to authenticate on Amazon'

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