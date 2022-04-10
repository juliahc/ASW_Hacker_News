const responseObj = {};

const errorCodes = require("../helpers/errorCodes.helper");
const userDatalayer = require("./../datalayers/user.datalayer");
const { check } = require("express-validator");


exports.register = async (request, response, next) => {
  const params = request.body;

  const condition = {};
  condition["$and"] = [];
  condition["$and"].push({ username: { $eq: params.username } });

  userDatalayer.findUser(condition).then(async (userData) => {
    if (!userData) {
      /* userObj = Object.assign({}, params); */
/*       userObj.googleId = bcrypt.hashSync(userObj.googleId, 10);*/
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