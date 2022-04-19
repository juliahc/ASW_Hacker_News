// load model
const responseObj = {};
const mongodb = require("mongodb");
const errorCodes = require("../helpers/errorCodes.helper.js");

const userDatalayer = require("../datalayers/user.datalayer");

//Search a user by its googleId
exports.find = async (request, response) => {
    let id;
    if (request.query.googleId) {
        id = request.query.googleId;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }
    const where = {};
    where.googleId = id;
    userDatalayer.findUser(where)
    .then((userData) => {
        if (userData !== null && typeof userData !== undefined) {
            responseObj.status  = errorCodes.SUCCESS;
            responseObj.message = "Success";
            responseObj.data    = userData;
        } else {
            responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
            responseObj.message = "User not found";
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
    return;
};

exports.create = async (request, response, next) => {
    let params = {};
    if (request.body.params) {
        params = request.body.params;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }
    userDatalayer.createUser(params)
    .then((userData) => {
        console.log(userData);
        if (userData !== null && typeof userData !== undefined) {
            responseObj.status  = errorCodes.SUCCESS;
            responseObj.message = "Success";
            responseObj.data    = userData;
        } else {
            responseObj.status  = errorCodes.DATA_NOT_FOUND;
            responseObj.message = "No record found";
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
    return;
};

exports.update = async (request, response, next) => {
    let params = {};
    if (request.body.params) {
        params = request.body.params;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }
    
    userDatalayer.findUser({googleId: params.googleId})
    .then((userData) => {
        if (userData !== null && typeof userData !== undefined) {
            let updateType = params.type;
            let updateData = {};
            switch (updateType) {
                case "upvoteSubmission":
                    updateData = {
                        googleId: params.googleId,
                        upvotedSubmissions: userData.upvotedSubmissions.push(mongodb.ObjectId(params.submission))
                    }
                    //TODO update the upvotes to the submission
                    break;
                case "downvoteSubmission":
                    updateData = {
                    }
                    break;
                case "upvoteComment":
                    updateData = {
                    }
                    break;
                case "downvoteComment":
                    updateData = {
                    }
                    break;
                case "favouriteSubmission":
                    updateData = {
                    }
                    break;
                case "favouriteComment":
                    updateData = {
                    }
                    break;
                case "unfavouriteSubmission":
                    updateData = {
                    }
                    break;
                case "unfavouriteComment":
                    updateData = {
                    }
                    break;
                default:
                    updateData = params;
                    delete updateData.type;
                    break;
            }

            userDatalayer.updateUser(params.googleId, updateData)
            .then((userData) => {
                if (userData !== null && typeof userData !== undefined) {
                    responseObj.status  = errorCodes.SUCCESS;
                    responseObj.message = "Success";
                    responseObj.data    = userData;
                } else {
                    responseObj.status  = errorCodes.DATA_NOT_FOUND;
                    responseObj.message = "No record found";
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
        } else {
            responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
            responseObj.message = "User not found";
            responseObj.data    = {};
            response.send(responseObj);
        }
    })
    .catch(error => {
        responseObj.status  = errorCodes.SYNTAX_ERROR;
        responseObj.message = error;
        responseObj.data    = {};
        response.send(responseObj);
    });
    return;
};