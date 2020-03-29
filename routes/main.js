'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-2' });
const TableName = 'chime-translate'

const addConnectionId = async (connectionId) => {
  return ddb.put({ TableName: TableName, Item: { connectionId: connectionId }, }).promise();
}
const removeConnectionId = async (connectionId) => {
  return ddb.delete({ TableName: TableName, Key: { connectionId: connectionId, }, }).promise();
}

module.exports.connect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  await addConnectionId(connectionId);
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify('connection sucess'),
  };
  return response;
};

module.exports.disconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  await removeConnectionId(connectionId);
  const response = {};
  return response;
};