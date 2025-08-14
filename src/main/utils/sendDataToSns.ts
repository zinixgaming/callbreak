import AWS from 'aws-sdk';
import Logger from '../logger';

const sendTOSns = (jsonObj: any, awsConfig: any) => {
  AWS.config.update({region: awsConfig.AWS_REGION});

  const snsObj = {
    payload: JSON.stringify(jsonObj),
    key: awsConfig.SNS_KEY,
    timestamp: new Date().getTime(),
  };

  const params = {
    Message: JSON.stringify(snsObj),
    TopicArn: awsConfig.ARN,
  };

  Logger.info('--TopicArn-- from sendToSNS', params.TopicArn);

  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'})
    .publish(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  publishTextPromise
    .then((data: any) => {
      Logger.info(
        `MessageID - ${data.MessageId} Message ${params.Message} sent to the topic ${params.TopicArn}`,
      );
    })
    .catch((err: any) => {
      Logger.error(
        'CATCH_ERROR in sendTOSns for snsObj: ',
        snsObj,
        err,
        err.stack,
      );
    });
};

export = sendTOSns;
