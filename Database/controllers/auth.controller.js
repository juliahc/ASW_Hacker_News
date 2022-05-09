const responseObj = {};

const errorCodes = require("../helpers/errorCodes.helper");
const userDatalayer = require("./../datalayers/user.datalayer");
const apiKeysDatalayer = require("../datalayers/apiKeys.datalayer");
const crypto = require('crypto');

const { check } = require("express-validator");

async function generateRandomKey() {
  //Generate a random key
  const key = await crypto.randomBytes(20).toString("hex");
  return key;
};

exports.register = async (request, response, next) => {
  const params = request.body.params;
  const condition = {};
  condition["$and"] = [];
  condition["$and"].push({ username: { $eq: params.username } });

  userDatalayer.findUser(condition).then(async (userData) => {
    if (!userData) {
      userDatalayer
        .createUser(/* userObj */params)
        .then(async (userData) => {
          //Create an API key for the user
          const apiKeyParams = {};
          apiKeyParams.googleId = userData.googleId;
          //generate a random key
          apiKeyParams.key = (await generateRandomKey()).toString();
          apiKeysDatalayer.createApiKey(apiKeyParams)
          .then((apiKeyData) => {
              if (apiKeyData !== null && typeof apiKeyData !== undefined) {
                responseObj.status    = errorCodes.CONTENT_CREATED;
                responseObj.message   = "User registered successfully";
                responseObj.data      = userData;
              } else {
                responseObj.status  = errorCodes.SYNTAX_ERROR;
                responseObj.message = "Error creating API key";
                responseObj.data    = {};
              }
              response.send(responseObj);
          })
          .catch(error => {
              responseObj.status  = errorCodes.SYNTAX_ERROR;
              responseObj.message = error;
              responseObj.data    = {};
              response.send(responseObj);
          });
        })
        .catch(function (error) {
          responseObj.status    = errorCodes.SYNTAX_ERROR;
          responseObj.message   = error.message;
          responseObj.data      = {};
          response.send(responseObj);
        });
    } else {
      responseObj.status    = errorCodes.BAD_REQUEST;
      responseObj.message   = "Username already exists!"
      responseObj.data      = {};
      response.send(responseObj);
    }
  });
};

exports.userKey = async (request, response) => {
  const params = {};
  if (request.query.key) {
    params.key = request.query.key;
  } else {
    responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
    responseObj.message = "Required parameters missing";
    responseObj.data    = {};
    response.send(responseObj);
    return;
  }
  apiKeysDatalayer.findApiKey(params).then(async (apiKeyData) => {
    if (apiKeyData) {
      responseObj.status    = errorCodes.SUCCESS;
      responseObj.message   = "User key found";
      responseObj.data      = {id: apiKeyData.googleId};
      response.send(responseObj);
    } else {
      responseObj.status    = errorCodes.BAD_REQUEST;
      responseObj.message   = "User key not found";
      responseObj.data      = {};
      response.send(responseObj);
    }
  });
};


exports.validate = (method) => {
  switch (method) {
    case "registerUser":
      {
        return [
          check("username", "Username required!").exists().not().isEmpty(),
          check("googleId", "GoogleId required!").exists().not().isEmpty()
        ];
      }
      break;
  }
};