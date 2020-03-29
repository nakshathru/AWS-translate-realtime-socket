'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-2' });
const TableName = 'chime-translate';
const socket = require('../configuration/initialize');
let sendx = undefined;

module.exports.join = async (event) => {
    sendx = socket.init(event);
    let body = JSON.parse(event.body);
    const connectionId = event.requestContext.connectionId;
    if (body.meetingId) {
      const meetingId = body.meetingId;
      try {
        const result = await updateMeetingId(connectionId, meetingId);
        const response = JSON.stringify({
          joinStatus: true,
          message: `Joined chime ${result.Attributes.meetingId} meeting`
        });
        return await sendx(response, connectionId);
      } catch (err) {
        const response = JSON.stringify({
          joinStatus: false,
          message: `Error occured while joining`
        });
        return await sendx(response, connectionId);
      }
    }
    else {
      const response = JSON.stringify({
        joinStatus: false,
        message: `Meeting Id invalid`
      });
      return await sendx(response, connectionId);
    }
  };

  const updateMeetingId = (connectionId, meetingId) => {
    const params = {
      TableName: TableName,
      Key: {
        connectionId: connectionId
      },
      UpdateExpression: "set meetingId = :m",
      ExpressionAttributeValues: {
        ":m": meetingId
      },
      ReturnValues: "UPDATED_NEW"
    };
    return ddb.update(params).promise();
}