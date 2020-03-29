'use strict';
const AWS = require('aws-sdk');

module.exports.init=(event)=>{
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "chimx02",
      endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
    });
    const send = (message, connectionId)=>{
      return apigwManagementApi
      .postToConnection({ ConnectionId: connectionId, Data: message })
      .promise();
    }
    return send;
  }
  