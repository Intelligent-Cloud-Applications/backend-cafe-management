const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.main = async (event) => {
  console.log(event);
  const institution = event.pathParameters.institution;
  const cognitoId = event.requestContext.identity.cognitoIdentityId;

  try {
    let getResult = await dynamodb.get({
      TableName: process.env.USER_TABLE_NAME,
      Key: {
        institution,
        cognitoId,
      }
    }).promise();

    if (!getResult || !getResult.Item) {
      const parts = event.requestContext.identity.cognitoAuthenticationProvider.split(',');
      const UserPoolId = parts[0].split('/')[1];
      const Username = parts[1].split(':CognitoSignIn:')[1];

      const user = await cognito.adminGetUser({
        UserPoolId, Username,
      }).promise();

      console.log(user);

      let attributes = {};
      for (let attribute of user.UserAttributes) {
        attributes[attribute.Name] = attribute.Value;
      }

      console.log(attributes);

      const putResult = await dynamodb.put({
        TableName: process.env.USER_TABLE_NAME,
        Item: {
          institution,
          cognitoId,
          name: attributes.name,
          email: attributes.email,
          phoneNumber: attributes.phone_number,
        }
      }).promise();

      console.log(putResult);

      getResult = await dynamodb.get({
        TableName: process.env.USER_TABLE_NAME,
        Key: {
          institution,
          cognitoId,
        }
      }).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(getResult),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': true,
      },
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e.message }),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': true,
      },
    }
  }
}