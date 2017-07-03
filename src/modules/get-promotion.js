'use strict';

const AWS = require('aws-sdk');

const db = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' });
const promotionParams = {
  TableName: 'we-know-you-dont-floss-promotions',
  Key: {
    id: {
      N: "1"
    }
  },
};

module.exports = (options) => {
  return new Promise((resolve, reject) => {
    db.getItem(promotionParams, function(err, data) {
      if (err) reject(err);
      if (data) resolve(Object.assign({}, { promotion: data.Item.text.S }, options));
    });
  });
}