const AWS = require('aws-sdk');
const { validateRegion } = require('../helpers');

const docClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-west-2',
  apiVersion: '2012-08-10',
  sslEnabled: true
});

/**
 * GET API to get the latency from source region to destination region
 *
 * Example query:
 * /getLatency?srcProvider=aws&srcRegion=us-west-2&dstProvider=aws&dstRegion=ap-east-1
 *
 * @param {*} event
 * @returns latency in ms
 */
module.exports.interRegionalLatency = async (event) => {
  const { srcProvider } = event.queryStringParameters;
  const { srcRegion } = event.queryStringParameters;
  const { dstProvider } = event.queryStringParameters;
  const { dstRegion } = event.queryStringParameters;

  if (
    !srcProvider ||
    !srcRegion ||
    !dstProvider ||
    !dstRegion ||
    !validateRegion(srcProvider, srcRegion) ||
    !validateRegion(dstProvider, dstRegion)
  ) {
    return {
      statusCode: 400,
      body: 'Bad Request'
    };
  }

  const params = {
    TableName: 'CloudHighwayOne',
    Key: {
      srcRegion: `${srcProvider.toLowerCase()}@${srcRegion.toLowerCase()}`,
      dstRegion: `${dstProvider.toLowerCase()}@${dstRegion.toLowerCase()}`
    }
  };

  let response;
  try {
    response = await docClient.get(params).promise();
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }

  return {
    statusCode: 200,
    body: response.Item.ping
  };
};
