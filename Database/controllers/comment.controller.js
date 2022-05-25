// load model
const responseObj = {};
const mongodb = require("mongodb");
const errorCodes = require("../helpers/errorCodes.helper.js");

const commentDatalayer = require("../datalayers/comment.datalayer");
const submissionDatalayer = require("../datalayers/submission.datalayer");

exports.find = async (request, response) => {
    let id;
    if (request.query._id) {
        id = request.query._id;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }
    if (mongodb.ObjectId.isValid(id)) {
        const where = {};
        where._id = mongodb.ObjectId(id);
        commentDatalayer.findComment(where)
        .then((commentData) => {
            if (commentData !== null && typeof commentData !== undefined) {
                responseObj.status  = errorCodes.SUCCESS;
                responseObj.message = "Success";
                responseObj.data    = commentData;
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
        responseObj.message = "Invalid id";
        responseObj.data    = {};
        response.send(responseObj);
    }
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

    if (params.submission && mongodb.ObjectId.isValid(params.submission)) {
        params.submission = mongodb.ObjectId(params.submission);
        let commentObject = {
            text: params.text,
            googleId: params.googleId,
            username: params.username,
            submission: mongodb.ObjectId(params.submission),
        }
        // In case of reply, add the parent comment to the comment object
        let reply = false;
        if (params.parent !== undefined && params.parent !== null) {
            if (mongodb.ObjectId.isValid(mongodb.ObjectId(params.parent))) {
                params.parent = mongodb.ObjectId(params.parent);
                commentObject.parent = params.parent;
                reply = true;
            }
        }

        commentDatalayer.createComment(commentObject)
        .then((commentData) => {
            if (commentData !== null && typeof commentData !== undefined) {
                //Find the submission related to the comment
                submissionDatalayer.findSubmission({_id: params.submission})
                .then((submissionData) => {
                    if (submissionData !== null && typeof submissionData !== undefined) {
                        submissionData.comments++;
                        submissionDatalayer.updateSubmission({_id: mongodb.ObjectId(params.submission)}, {comments: submissionData.comments})
                        .then((updateSubmissionData) => {
                            //In case that the comment is a reply  to an existing comment, add the reply to the parent comment
                            if (reply) {
                                commentDatalayer.findComment({_id: params.parent})
                                .then((replyData) => {
                                    if (replyData !== null && typeof replyData !== undefined) {
                                        replyData[0].replies.push(commentData._id);
                                        commentDatalayer.updateComment({_id: params.parent}, {replies: replyData[0].replies})
                                        .then((data) => {
                                            responseObj.status  = errorCodes.SUCCESS;
                                            responseObj.message = "Success";
                                            responseObj.data    = commentData;
                                            response.send(responseObj);
                                        })
                                        .catch(error => {
                                            responseObj.status  = errorCodes.SYNTAX_ERROR;
                                            responseObj.message = "Error updating reply: " + error;
                                            responseObj.data    = {};
                                            response.send(responseObj);
                                        });
                                    } else {
                                        responseObj.status  = errorCodes.DATA_NOT_FOUND;
                                        responseObj.message = "No record found";
                                        responseObj.data    = {};
                                        response.send(responseObj);
                                    }
                                })
                                .catch(error => {
                                    responseObj.status  = errorCodes.DATA_NOT_FOUND;
                                    responseObj.message = error;
                                    responseObj.data    = {};
                                    response.send(responseObj);
                                });
                            }
                            else {
                                responseObj.status  = errorCodes.SUCCESS;
                                responseObj.message = "Success";
                                responseObj.data    = commentData;
                                response.send(responseObj);
                            }


                        })
                        .catch((error) => { 
                            responseObj.status  = errorCodes.SYNTAX_ERROR;
                            responseObj.message = error;
                            responseObj.data    = {};
                            response.send(responseObj);
                        });
                    }
                })
                .catch(error => {
                    responseObj.status  = errorCodes.SYNTAX_ERROR;
                    responseObj.message = error;
                    responseObj.data    = {};
                    response.send(responseObj);
                });
            } else {
                responseObj.status  = errorCodes.DATA_NOT_FOUND;
                responseObj.message = "No record found";
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
    }
    else {
        responseObj.status  = errorCodes.SYNTAX_ERROR;
        responseObj.message = "Invalid submission id";
        responseObj.data    = {};
        response.send(responseObj);
    }
    return;
};