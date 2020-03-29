'use strict';
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient({ 'region': 'us-east-2' });
const translator = new AWS.Translate({ apiVersion: '2020-04-01', region: 'us-east-2' })
const TableName = 'chime-translate'
const socket = require('../configuration/initialize');
let sendx = undefined;

module.exports.translate = async (event) => {
    sendx = socket.init(event);
    let body = JSON.parse(event.body);
    const connectionId = event.requestContext.connectionId;
    try {
      const result = await getSingleConnection(connectionId);
      const meetingId = result.Items[0].meetingId;
      const allClients = await getMeetingClients(meetingId);
      const { message, slang = 'auto', tlang = 'en' } = body;
      const translated = await translate(message, slang, tlang);
      const response = JSON.stringify({
        trans: true,
        msg: translated.TranslatedText
      });
      const postCalls = allClients.Items.map(async ({ connectionId }) => {
        try {
          return await sendx(response, connectionId);
        } catch (err) {
          console.log(err);
          const response = JSON.stringify({
            trans: false,
            msg: 'translation failed'
          });
  
          return await sendx(response, connectionId);
        }
      });
  
      try {
        await Promise.all(postCalls);
      } catch (err) {
        console.log(err);
        const response = JSON.stringify({
          trans: false,
          msg: 'translation failed'
        });
        return await sendx(response, connectionId);
      }
    }
    catch (err) {
      console.log(err);
      const response = JSON.stringify({
        trans: false,
        msg: 'translation failed'
      });
  
      return await sendx(response, connectionId);
    }
  }

const translate = (message, slang = 'auto', tlang) => {
    const params = {
      Text: message,
      SourceLanguageCode: slang,
      TargetLanguageCode: tlang
    }
    return translator.translateText(params).promise();
  }

const getSingleConnection = (connectionId) => {
    const params = {
      TableName: TableName,
      KeyConditionExpression: "#ci = :connid",
      ExpressionAttributeNames: {
        "#ci": "connectionId"
      },
      ExpressionAttributeValues: {
        ":connid": connectionId
      }
    }
    return ddb.query(params).promise();
  }
  
const getMeetingClients = (meetingId) => {
    const params = {
      TableName: TableName,
      FilterExpression: "#mi = :meetId",
      ExpressionAttributeNames: {
        "#mi": "meetingId",
      },
      ExpressionAttributeValues: {
        ":meetId": meetingId,
      }
    }
    return ddb.scan(params).promise();
  }

