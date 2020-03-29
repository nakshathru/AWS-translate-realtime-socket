'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-2' });
const TableName = 'chime-translate'
const socket = require('../configuration/initialize');
let sendx = undefined;

module.exports.message = async (event) => {
    sendx = socket.init(event);
    let body = JSON.parse(event.body);
    let message;
    if (body) {
      message = body.message;
    }
    else {
      message = 'default message';
    }
    let connections = await getConnections();
    const postCalls = connections.Items.map(async ({ connectionId }) => {
      try {
        return await sendx(message, connectionId);
      } catch (err) {
        throw err;
      }
    });
    try {
      await Promise.all(postCalls);
    } catch (err) {
      console.log(err);
      throw err;
    }
    return {};
  };
  
const getConnections = () => {
    return ddb.scan({
      TableName: TableName,
    }).promise();
  }

