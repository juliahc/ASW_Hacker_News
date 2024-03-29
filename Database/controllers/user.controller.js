// load model
const responseObj = {};
const mongodb = require("mongodb");
const errorCodes = require("../helpers/errorCodes.helper.js");

const userDatalayer = require("../datalayers/user.datalayer");
const submissionDatalayer = require("../datalayers/submission.datalayer");
const commentDatalayer = require("../datalayers/comment.datalayer");
const apiKeysDatalayer = require("../datalayers/apiKeys.datalayer");

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
            //get the api key related to the user
            let apiKeyParams = {};
            apiKeyParams.googleId = id;
            apiKeysDatalayer.findApiKey(apiKeyParams)
            .then((apiKeyData) => {
                //join the api key with the user
                userData.apiKey = apiKeyData.key;
                if (apiKeyData !== null && typeof apiKeyData !== undefined) {
                  let result = JSON.parse(JSON.stringify(userData));
                  result.apiKey = apiKeyData.key;

                  responseObj.status  = errorCodes.SUCCESS;
                  responseObj.message = "Success";
                  responseObj.data    = result;
                } else {
                  responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                  responseObj.message = "Cannot find the api key";
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

async function checkSubmission(id) {
  if (mongodb.ObjectId.isValid(id)) {
    let res = submissionDatalayer.findSubmission({_id: mongodb.ObjectId(id)}).then()
    if (res == null || res == undefined) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

async function checkComment(id) {
  if (mongodb.ObjectId.isValid(id)) {
    let res = commentDatalayer.findComment({_id: mongodb.ObjectId(id)}).then()
    if (res == null || res == undefined) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
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
    let userinfo = {};
    await userDatalayer.createUser(params)
    .then(async (userData) => {
        if (userData !== null && typeof userData !== undefined) {
            userinfo = userData;
        } else {
            responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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
    if (userinfo == null || userinfo == undefined) {
      return;
    } 
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
    let valid = true;
    userDatalayer.findUser({googleId: params.googleId})
    .then( async (userData) =>  {
        if (userData !== null && typeof userData !== undefined) {
            let updateType = params.type;
            let updateData = {};
            let updateSubmission = false;
            let updateComment = false;
            let updateSubmissionQuery = {};
            let updateCommentQuery = {};
            switch (updateType) {
                case "upvoteSubmission":
                    valid = await checkSubmission(params.submission);
                    if (valid) {
                      if (userData.upvotedSubmissions.includes(mongodb.ObjectId(params.submission))) {
                          responseObj.status  = errorCodes.DATA_ALREADY_EXISTS;
                          responseObj.message = "Data already exists";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.upvotedSubmissions.push(mongodb.ObjectId(params.submission));
                      updateData = {
                          googleId: params.googleId,
                          upvotedSubmissions: userData.upvotedSubmissions
                      }
                      updateSubmission = true;
                      updateSubmissionQuery = {
                          $inc: {
                              points: 1
                          }
                      };
                    } else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The submission does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "downvoteSubmission":
                    valid = await checkSubmission(params.submission);
                    if (valid) {
                      if (!userData.upvotedSubmissions.includes(mongodb.ObjectId(params.submission))) {
                          responseObj.status  = errorCodes.BAD_REQUEST;
                          responseObj.message = "Bad request";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }

                      userData.upvotedSubmissions.map(submission => {
                          if (submission.toString() === params.submission) {
                              userData.upvotedSubmissions.splice(userData.upvotedSubmissions.indexOf(mongodb.ObjectId(params.submission)), 1);
                          }
                      })

                      updateData = {
                          googleId: params.googleId,
                          upvotedSubmissions: userData.upvotedSubmissions
                      }
                      updateSubmission = true;
                      updateSubmissionQuery = {
                          $inc: {
                              points: -1
                          }
                      };
                    } else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The submission does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "upvoteComment":
                  valid = await checkComment(params.comment);
                  if (valid) {
                      if (userData.upvotedComments.includes(mongodb.ObjectId(params.comment))) {
                          responseObj.status  = errorCodes.DATA_ALREADY_EXISTS;
                          responseObj.message = "Data already exists";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.upvotedComments.push(mongodb.ObjectId(params.comment));
                      updateData = {
                          googleId: params.googleId,
                          upvotedComments: userData.upvotedComments
                      }
                      updateComment = true;
                      updateCommentQuery = {
                          $inc: {
                              points: 1
                          }
                      };
                    } else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The comment does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "downvoteComment":
                    valid = await checkComment(params.comment);
                    if (valid) {
                      if (!userData.upvotedComments.includes(mongodb.ObjectId(params.comment))) {
                          responseObj.status  = errorCodes.BAD_REQUEST;
                          responseObj.message = "Bad request";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.upvotedComments.map(comment => {
                          if (comment.toString() === params.comment) {
                              userData.upvotedComments.splice(userData.upvotedComments.indexOf(mongodb.ObjectId(params.comment)), 1);
                          }
                      })
                      updateData = {
                          googleId: params.googleId,
                          upvotedComments: userData.upvotedComments
                      }
                      updateComment = true;
                      updateCommentQuery = {
                          $inc: {
                              points: -1
                          }
                      };
                    } else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The comment does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "favouriteSubmission":
                    valid = await checkSubmission(params.submission);
                    if (valid) {
                      if (userData.favouriteSubmissions.includes(mongodb.ObjectId(params.submission))) {
                          responseObj.status  = errorCodes.DATA_ALREADY_EXISTS;
                          responseObj.message = "Data already exists";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.favouriteSubmissions.push(mongodb.ObjectId(params.submission));
                      updateData = {
                          googleId: params.googleId,
                          favouriteSubmissions: userData.favouriteSubmissions
                      }
                    } else {  
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The submission does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "favouriteComment":
                    valid = await checkComment(params.comment);
                    if (valid) {
                      if (userData.favouriteComments.includes(mongodb.ObjectId(params.comment))) {
                          responseObj.status  = errorCodes.DATA_ALREADY_EXISTS;
                          responseObj.message = "Data already exists";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.favouriteComments.push(mongodb.ObjectId(params.comment));
                      updateData = {
                          googleId: params.googleId,
                          favouriteComments: userData.favouriteComments
                      }
                    } else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The comment does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "unfavouriteSubmission":
                    valid = await checkSubmission(params.submission);
                    if (valid) {
                      if (!userData.favouriteSubmissions.includes(mongodb.ObjectId(params.submission))) {
                          responseObj.status  = errorCodes.BAD_REQUEST;
                          responseObj.message = "Bad request";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.favouriteSubmissions.map(submission => {
                          if (submission.toString() === params.submission) {
                              userData.favouriteSubmissions.splice(userData.favouriteSubmissions.indexOf(mongodb.ObjectId(params.submission)), 1);
                          }
                      })
                      updateData = {
                          googleId: params.googleId,
                          favouriteSubmissions: userData.favouriteSubmissions
                      }
                    } else { 
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The submission does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                case "unfavouriteComment":
                    valid = await checkComment(params.comment);
                    if (valid) {
                      if (!userData.favouriteComments.includes(mongodb.ObjectId(params.comment))) {
                          responseObj.status  = errorCodes.BAD_REQUEST;
                          responseObj.message = "Bad request";
                          responseObj.data    = {};
                          response.send(responseObj);
                          return;
                      }
                      userData.favouriteComments.map(comment => {
                          if (comment.toString() === params.comment) {
                              userData.favouriteComments.splice(userData.favouriteComments.indexOf(mongodb.ObjectId(params.comment)), 1);
                          }
                      })
                      updateData = {
                          googleId: params.googleId,
                          favouriteComments: userData.favouriteComments
                      }
                    }
                    else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "The comment does not exist";
                      responseObj.data    = {};
                      response.send(responseObj);
                      return;
                    }
                    break;
                default:
                    updateData = params;
                    delete updateData.type;
                    break;
            }

            userDatalayer.updateUser({googleId: params.googleId}, updateData)
            .then((userData) => {
                if (userData !== null && typeof userData !== undefined) {
                    if (updateSubmission) {
                        submissionDatalayer.updateSubmission({_id: mongodb.ObjectId(params.submission)}, updateSubmissionQuery)
                        .then((submissionData) => {
                            if (submissionData !== null && typeof submissionData !== undefined) {
                                responseObj.status  = errorCodes.SUCCESS;
                                responseObj.message = "Success";
                                responseObj.data    = userData;
                                response.send(responseObj);
                            } else {
                                responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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
                    } else if (updateComment) {
                        commentDatalayer.updateComment({_id: mongodb.ObjectId(params.comment)}, updateCommentQuery)
                        .then((commentData) => {
                            if (commentData !== null && typeof commentData !== undefined) {
                                responseObj.status  = errorCodes.SUCCESS;
                                responseObj.message = "Success";
                                responseObj.data    = userData;
                                response.send(responseObj);
                            } else {
                                responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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
                        responseObj.status  = errorCodes.SUCCESS;
                        responseObj.message = "Success";
                        responseObj.data    = userData;
                        response.send(responseObj);
                    }
                } else {
                    responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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

exports.userSubmissions = (request, response) => {
    let params = {};
    if (request.query.googleId && request.query.type) {
        params = request.query;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }

    let type = params.type; //up => upvoted submissions / fav=> favourite submissions

    userDatalayer.findUser({googleId: params.googleId})
    .then((userData) => {
        if (userData !== null && typeof userData !== undefined) {
            if ((type === "up" && userData.upvotedSubmissions.length === 0) || (type === "fav" && userData.favouriteSubmissions.length === 0)) {
                responseObj.status  = errorCodes.SUCCESS;
                responseObj.message = "Success";
                responseObj.data    = [];
                response.send(responseObj);
                return;
            }
            
            let criteria = {};
            criteria["$and"] = [];
            criteria["$and"].push({
                _id: {
                    $in: (type === "up") ? userData.upvotedSubmissions : userData.favouriteSubmissions
                }
            });
            let orderBy = {
                "createdAt": -1
            };
            let limit = (params.hasOwnProperty("limit") && params.limit !== "")  ? { "$limit": parseInt(params.limit) } : "";
            //search submissions by aggregation
            let skip = (params.hasOwnProperty("offset") && params.offset !== "") ? { "$skip": parseInt(params.offset) } : "";
            let aggregateArr = createAggregateArray(skip, criteria, orderBy, limit);
            console.log("Aggregate array: ", aggregateArr);
            submissionDatalayer
            .aggregateSubmission(aggregateArr)
            .then((submissionData) => {
                if (submissionData !== null && typeof submissionData !== undefined) {
                    //Get elements on bbdd
                    let match = {};
                    match = {
                        _id: {
                            $in: (type === "up") ? userData.upvotedSubmissions : userData.favouriteSubmissions
                        }
                    };
                    let aggregateQuery = [
                        {
                        '$match': match
                        }, {
                        '$count': "submissionsLeft"
                    }];
                    submissionDatalayer
                    .aggregateSubmission(aggregateQuery)
                    .then((ret => {
                        if (params.limit !== '' && params.limit == 0) {
                          ret[0].submissionsLeft -= parseInt(params.offset);
                          responseObj.status  = errorCodes.SUCCESS;
                          responseObj.message = "Success";
                          responseObj.data    = [{"submissionsLeft": ret[0].submissionsLeft}];
                        } else {
                          ret[0].submissionsLeft = ((ret[0].submissionsLeft - (parseInt(params.limit) + parseInt(params.offset))) < 0 ) ? 0 : (ret[0].submissionsLeft - (parseInt(params.limit) + parseInt(params.offset)));
                          submissionData.push(ret[0]);
                          responseObj.status  = errorCodes.SUCCESS;
                          responseObj.message = "Success";
                          responseObj.data    = submissionData;
                        }
                        response.send(responseObj);
                    }))
                    .catch(error => {
                        console.log(error);
                    });
                } else {
                    responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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

exports.comments = async (request, response) => {
    let googleId;
    if (request.query.googleId) {
        googleId = request.query.googleId;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }
    const where = {};
    where.googleId = googleId;

    userDatalayer.findUser(where)
    .then((userData) => {
        if (userData !== null && typeof userData !== undefined) {
            //The user exists on the database. Now we need to get the comments
            const criteria = {};
            criteria["$and"] = [];
            criteria["$and"].push({
                parent: {
                    $eq: null
                }
            });
            criteria["$and"].push({
                googleId: {
                    $eq: googleId
                }
            });
            //Search all comments relateds to the submission, including comments of comments
            let aggregateArr = createAggregateCommentArray(criteria);
            commentDatalayer.aggregateComment(aggregateArr)
            .then((commentData) => {
                if (commentData !== null && typeof commentData !== undefined) {
                    responseObj.status  = errorCodes.SUCCESS;
                    responseObj.message = "Success";
                    responseObj.data    = commentData;
                } else {
                    responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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
    return;
};

exports.likedComments = async (request, response) => {
  let params = {};
  if (request.query.googleId) {
      params = request.query;
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
        let criteria = {};
        criteria["$and"] = [];
        criteria["$and"].push({
          _id: {
            $in: (params.type === "up") ? userData.upvotedComments : userData.favouriteComments
          }
        });
        commentDatalayer.findComment(criteria)
        .then((commentData) => {
            if (commentData !== null && typeof commentData !== undefined) {
                responseObj.status  = errorCodes.SUCCESS;
                responseObj.message = "Success";
                responseObj.data    = commentData;
            } else {
                responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
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
  return;
};

function createAggregateCommentArray (match) {
  return [
    {
      '$match': match
    }, {
      '$graphLookup': {
        'from': 'comments', 
        'startWith': '$_id', 
        'connectFromField': '_id', 
        'connectToField': 'parent', 
        'as': 'children', 
        'depthField': 'level'
      }
    }, {
      '$unwind': {
        'path': '$children', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$sort': {
        'children.level': -1
      }
    }, {
      '$group': {
        '_id': '$_id', 
        'parent': {
          '$first': '$parent'
        }, 
        'text': {
          '$first': '$text'
        }, 
        'googleId': {
          '$first': '$googleId'
        }, 
        'username': {
          '$first': '$username'
        }, 
        'points': {
          '$first': '$points'
        }, 
        'submission': {
          '$first': '$submission'
        }, 
        'createdAt': {
          '$first': '$createdAt'
        }, 
        'replies': {
          '$first': '$replies'
        }, 
        'children': {
          '$push': '$children'
        }
      }
    }, {
      '$addFields': {
        'children': {
          '$reduce': {
            'input': '$children', 
            'initialValue': {
              'level': -1, 
              'presentChild': [], 
              'prevChild': []
            }, 
            'in': {
              '$let': {
                'vars': {
                  'prev': {
                    '$cond': [
                      {
                        '$eq': [
                          '$$value.level', '$$this.level'
                        ]
                      }, '$$value.prevChild', '$$value.presentChild'
                    ]
                  }, 
                  'current': {
                    '$cond': [
                      {
                        '$eq': [
                          '$$value.level', '$$this.level'
                        ]
                      }, '$$value.presentChild', []
                    ]
                  }
                }, 
                'in': {
                  'level': '$$this.level', 
                  'prevChild': '$$prev', 
                  'presentChild': {
                    '$concatArrays': [
                      '$$current', [
                        {
                          '$mergeObjects': [
                            '$$this', {
                              'children': {
                                '$filter': {
                                  'input': '$$prev', 
                                  'as': 'e', 
                                  'cond': {
                                    '$eq': [
                                      '$$e.parent_id', '$$this.id'
                                    ]
                                  }
                                }
                              }
                            }
                          ]
                        }
                      ]
                    ]
                  }
                }
              }
            }
          }
        }
      }
    }, {
      '$addFields': {
        'children': '$children.presentChild'
      }
    }
  ]
};

function createAggregateArray (skip, match, orderBy, limit) {
    let aggregateArr = [
        {
          '$match': match
        }, {
            '$lookup': {
              'from': 'urls', 
              'let': {
                'sId': '$_id'
              }, 
              'pipeline': [
                {
                  '$match': {
                    '$expr': {
                      '$eq': [
                        '$submission', '$$sId'
                      ]
                    }
                  }
                }, {
                  '$project': {
                    'url': 1
                  }
                }
              ], 
              'as': 'url'
            }
          }, {
            '$unwind': {
              'path': '$url', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$lookup': {
              'from': 'asks', 
              'let': {
                'sId': '$_id'
              }, 
              'pipeline': [
                {
                  '$match': {
                    '$expr': {
                      '$eq': [
                        '$submission', '$$sId' 
                      ]
                    }
                  }
                }, {
                  '$project': {
                    'text': 1
                  }
                }
              ], 
              'as': 'ask'
            }
          }, {
            '$unwind': {
              'path': '$ask', 
              'includeArrayIndex': 'string', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
          '$sort': orderBy
        }
      ];
    if (skip !== "" && skip.$skip > 0) {
        aggregateArr.push(skip);
    }
    if (limit !== "" && limit.$limit > 0) {
        aggregateArr.push(limit);
    }
    return aggregateArr;
};
