// load model
const responseObj = {};
const mongodb = require("mongodb");
const errorCodes = require("../helpers/errorCodes.helper.js");

const userDatalayer = require("../datalayers/user.datalayer");
const commentDatalayer = require("../datalayers/comment.datalayer");

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
    let owner = request.query.owner;
    console.log("Owner: ", owner);
    const where = {};
    where.googleId = id;
    userDatalayer.findUser(where)
    .then((userData) => {
        if (userData !== null && typeof userData !== undefined) {
            responseObj.status  = errorCodes.SUCCESS;
            responseObj.message = "Success";
            if (!owner || owner === "false" ||owner === "False" || owner === false || owner === "0") {
                let retData = {
                    _id: userData._id,
                    username: userData.username,
                    createdAt: userData.createdAt,
                    karma: userData.karma,
                    about: userData.about,
                }
                responseObj.data    = retData;
            } else {
                responseObj.data    = userData;
            }
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
    where.googleId = mongodb.ObjectId(googleId);

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
    return;
}

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
}