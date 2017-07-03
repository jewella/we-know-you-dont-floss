'use strict';

const AWS = require('aws-sdk');

const db = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' });
const params = {
  Key: {
    email: {
      S: ''
    }
  },
  TableName: 'we-know-you-dont-floss-appointments'
};

module.exports = (email) => {
  return new Promise((resolve, reject) => {
    params.Key.email.S = email;
    db.getItem(params, function(err, data) {
      if (err) reject(err);
      if (data) resolve(data.Item.time.S);
    });
  });
}