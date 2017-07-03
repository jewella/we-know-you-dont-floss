const request = require('request-promise-native');
const uri = require('../uris').AMAZON_PROFILE_SERVICE;

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    request({ uri: `${uri.origin}${uri.pathname}?access_token=${options.token}`, method: 'GET' })
      .then(resp => resolve(Object.assign({}, { profile: JSON.parse(resp) }, options)))
      .catch(err => reject(err))
  });
}