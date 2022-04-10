const responseObj = {};
// const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const errorCodes = require("../helpers/errorCodes.helper");
const userDatalayer = require("./../datalayers/user.datalayer");
const { check } = require("express-validator");

exports.login = async (request, response, next) => {
  const params = request.body;

  const criteria = {};
  criteria["$and"] = [];
  criteria["$and"].push({ username: params.username });

  userDatalayer
    .findUser(criteria)
    .then(async (userData) => {
      if (userData !== null && typeof userData !== undefined) {
        if (params.googleId === userData.googleId) {
          const data = {};
          data.authtoken = createJWT(userData._id);
          data.user = userData;
          responseObj.status = errorCodes.SUCCESS;
          responseObj.message = "Success!";
          responseObj.data = data;
          return response.send(responseObj);
        } else {
          // In case of googleid mismatch
          responseObj.status = errorCodes.BAD_REQUEST;
          responseObj.message = "Invalid googleId";
          responseObj.data = {};
          return response.send(responseObj);
        }
      } else {
        // in case of invalid user
        responseObj.status = errorCodes.BAD_REQUEST;
        responseObj.message = "Invalid username";
        responseObj.data = {};
        return response.send(responseObj);
      }
    })
    .catch(function (error) {
      // cannot find the user
      responseObj.status = errorCodes.SYNTAX_ERROR;
      responseObj.message = error;
      responseObj.data = {};
      return response.send(responseObj);
    });
};

function createJWT(userId) {
    const secretKey = process.env.ENCRYPTION_KEY;
    var token = jwt.sign({ userId: userId }, secretKey, { expiresIn: "500d" });
    return token;
}

function createJWT(userId) {
  const secretKey = process.env.ENCRYPTION_KEY;
  var token = jwt.sign({ userId: userId }, secretKey, { expiresIn: "500d" });
  return token;
}

exports.register = async (request, response, next) => {
  const params = request.body;
  console.log(params);

  const condition = {};
  condition["$and"] = [];
  condition["$and"].push({ username: { $eq: params.username } });

  userDatalayer.findUser(condition).then(async (userData) => {
    if (!userData) {
      userDatalayer
        .createUser(params)
        .then(async (userData) => {
          //login
          next();
        })
        .catch(function (error) {
          responseObj.status = errorCodes.SYNTAX_ERROR;
          responseObj.message = error.message;
          responseObj.data = {};
          response.send(responseObj);
        });
  
    } else {
      responseObj.status = errorCodes.BAD_REQUEST;
      responseObj.message = "Username already exists!"
      responseObj.data = {};
      response.send(responseObj);
    }
  });
};

exports.validate = (method) => {
  switch (method) {
    case "login":
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