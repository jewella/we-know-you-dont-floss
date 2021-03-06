'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');

const db = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' });
const params = {
  Key: {
    email: {
      S: ''
    }
  },
  TableName: 'we-know-you-dont-floss-appointments'
};

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    params.Key.email.S = options.profile.email;
    db.getItem(params, function(err, data) {
      if (err) reject(err);
      if (data) resolve(Object.assign({}, { time: moment(parseInt(data.Item.time.N, 10)).calendar() }, options));
    });
  });
}