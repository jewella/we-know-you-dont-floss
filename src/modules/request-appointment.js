const AWS = require('aws-sdk');
const moment = require('moment');
const uuidv4 = require('uuid/v4');

const db = new AWS.DynamoDB({ apiVersion: '2012-08-10', region: 'us-east-1' });
const params = {
  Item: {
    id: {},
    email: {},
    datetime: {},
  }, 
  TableName: 'we-know-you-dont-floss-appointment-requests'
};

module.exports = (options) => {
  const { date, time } = options;
  const isTimePeriod = ['NI', 'MO', 'AF', 'EV'].indexOf(time) !== -1
  const datetime = isTimePeriod ? `${moment(date).toString()} ${time}` : moment(`${date} ${time}`).toString();
  return new Promise((resolve, reject) => {
    params.Item.email.S = options.profile.email;
    params.Item.datetime.S = datetime;
    params.Item.id.S = uuidv4();
    db.putItem(params, function(err, data) {
      if (err) reject(err);
      if (data) resolve(Object.assign({}, options));
    });
  });

};