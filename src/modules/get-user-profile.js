const request = require('request-promise-native');
const uri = require('../uris').AMAZON_PROFILE_SERVICE;

module.exports = (token) => {
  return new Promise((resolve, reject) => {
    request({ uri: `${uri.origin}${uri.pathname}?access_token=${token}`, method: 'GET' })
      .then((resp) => {
        resolve(JSON.parse(resp));
      })
      .catch((err) => {
        reject(err);
      });
  });
}