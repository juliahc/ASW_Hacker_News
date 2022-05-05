const responseObj = {};

const errorCodes = require("../helpers/errorCodes.helper");
const userDatalayer = require("./../datalayers/user.datalayer");
const apiKeyDatalayer = require("./../datalayers/apiKeys.datalayer");

const { check } = require("express-validator");


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
          responseObj.status    = errorCodes.CONTENT_CREATED;
          responseObj.message   = "User registered successfully";
          responseObj.data      = userData;
          response.send(responseObj);
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
  apiKeyDatalayer.findApiKey(params).then(async (apiKeyData) => {
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