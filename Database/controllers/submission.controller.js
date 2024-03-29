// load model
const responseObj = {};
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const db = mongoose.connect(process.env.MONGODB_URL, {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const errorCodes = require("../helpers/errorCodes.helper.js");

const userDatalayer = require("../datalayers/user.datalayer.js");
const submissionDatalayer = require("../datalayers/submission.datalayer");
const askDatalayer = require("../datalayers/ask.datalayer");
const urlDatalayer = require("../datalayers/url.datalayer");
const commentDatalayer = require("../datalayers/comment.datalayer");

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
    const criteria = {};
    criteria["$and"] = [];
    criteria["$and"].push({
        _id: {
            $eq: mongodb.ObjectId(id)
        }
    });
    let aggregateArr = createAggregateSubmissionArray(criteria);
    submissionDatalayer.aggregateSubmission(aggregateArr)
    .then((submissionData) => {
      console.log("THEN, submissionData: ", submissionData);
          if (submissionData !== null && typeof submissionData !== undefined) {
            if (submissionData[0].comments == 0) {
              let submission = JSON.parse(JSON.stringify(submissionData[0]));
              submission.comments = [];
              responseObj.status  = errorCodes.SUCCESS;
              responseObj.message = "Success";
              responseObj.data    = submission;
              response.send(responseObj);
              return;
            } else {
              //The submission exists on the database. Now we need to get the comments
              const criteria = {};
              criteria["$and"] = [];
              criteria["$and"].push({
                  parent: {
                      $eq: null
                  }
              });
              criteria["$and"].push({
                  submission: {
                      $eq: submissionData[0]._id
                  }
              });
              //Search all comments relateds to the submission, including comments of comments
              let aggregateArr = createAggregateCommentArray(criteria);
              commentDatalayer.aggregateComment(aggregateArr)
              .then((commentData) => {
                  if (commentData !== null && typeof commentData !== undefined) {
                    //Change the comment propery from the submissionData to the commentData
                    let submission = JSON.parse(JSON.stringify(submissionData[0]));
                    submission.comments = commentData;
                    responseObj.status  = errorCodes.SUCCESS;
                    responseObj.message = "Success";
                    responseObj.data    = submission;
                  } else {
                      responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
                      responseObj.message = "No record found";
                      responseObj.data    = {};
                  }
                  response.send(responseObj);
              })
              .catch(error => {
                  responseObj.status  = errorCodes.SUCCESS;
                  responseObj.message = error;
                  responseObj.data    = submissionData;
                  response.send(responseObj);
              });
            }
              
          } else {
              responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
              responseObj.message = "No record found";
              responseObj.data    = {};
              response.send(responseObj);
          }
      })
      .catch(error => {
        console.log("CATCH");
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

exports.page = async (request, response) => {
    let params = {}
    if (request.query.hasOwnProperty("offset") && request.query.hasOwnProperty("limit") && request.query.hasOwnProperty("t") && request.query.hasOwnProperty("o")) {
        params = request.query;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }

    console.log("params: ", params);

    let orderBy = {};

    let criteria = {};
    criteria["$and"] = [];
    if (request.query.t !== "any") {
        criteria["$and"].push({
            type: {
                $eq: params.t
            } 
        });
    }
    if (request.query.usr !== undefined && request.query.usr !== "") {
      let res = await userDatalayer.findUser({"googleId": params.usr}).then();
      if (res !== null && typeof res !== undefined) {
        criteria["$and"].push({
              googleId: {
                  $eq: params.usr
              }
          });
        } else {
          responseObj.status  = errorCodes.RESOURCE_NOT_FOUND;
          responseObj.message = "User not found";
          responseObj.data    = {};
          response.send(responseObj);
          return;
      }
    }
    switch(request.query.o) {
        case "new":
            orderBy = {
                "createdAt": -1,
                "points": -1
            };
            break;
        default:
            orderBy = {
                "points": -1,
                "createdAt": -1
            };
            break;
    }

    if (criteria['$and'].length === 0) {
        delete criteria['$and'];
    }

    let aggregateArr = await createAggregateArray(params.offset, params.limit, criteria, orderBy);
    //Search submissions by aggregation -> match: any, url or ask. orderBy: points, createdAt (desc), skipping fitst (page-1)*10 elements documents, (as we only print 10 elements)
    submissionDatalayer
    .aggregateSubmission(aggregateArr)
    .then((submissionData) => {
        if (
            submissionData !== null &&
            typeof submissionData !== "undefined" &&
            submissionData.length
          ) {
            //Get elements onn bbdd
            let match = {};
            if (params.hasOwnProperty("usr")) {
              match = {
                googleId: {
                  $eq: params.usr
                }
              };
            }
            let aggregateQuery = [
                {
                  '$match': match
                }, {
                  '$count': "submissionsLeft"
                }];
            submissionDatalayer
            .aggregateSubmission(aggregateQuery)
            .then((ret => {
                if (parseInt(request.query.limit) === 0) {
                    ret[0].submissionsLeft -= parseInt(params.offset);
                    responseObj.status  = errorCodes.SUCCESS;
                    responseObj.message = "Success";
                    responseObj.data    = [{"submissionsLeft": ret[0].submissionsLeft}];
                } else {
                  ret[0].submissionsLeft -= (parseInt(request.query.offset) + parseInt(request.query.limit));
                  submissionData.push(ret[0]);
                  responseObj.status  = errorCodes.SUCCESS;
                  responseObj.message = "Success";
                  responseObj.data    = submissionData;
                }
                response.send(responseObj);
            }))
            .catch((err) => {
                console.log(err);
            });
          } else {
            responseObj.status  = errorCodes.SUCCESS;
            responseObj.message = "Data not found";
            responseObj.data    = [];
            response.send(responseObj);
          }
    })
    .catch((error) => {
        responseObj.status  = errorCodes.SYNTAX_ERROR;
        responseObj.message = error;
        responseObj.data    = {};
        response.send(responseObj);
    });
};

exports.create = async (request, response) => {
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

    let submissionObject = {
        title: params.title,
        username: params.username,
        type: (params.hasOwnProperty("url")) ? "url" : "ask",
        googleId: params.googleId
    }
    
    let cont = true;

    if (params.hasOwnProperty("url")) {
      await urlDatalayer.findUrl({"url": params.url})
      .then((urlData) => {
        if (urlData !== null && typeof urlData !== "undefined") {
          responseObj.status = errorCodes.DATA_ALREADY_EXISTS;
          responseObj.message = "Url already exists";
          responseObj.data = urlData.submission;
          response.send(responseObj);
          cont = false;
        }
      })
    }

    if (!cont) return;
    //Creating submission on the database
    submissionDatalayer.createSubmission(submissionObject)
    .then((submissionData) => {
        if (submissionData !== null && typeof submissionData !== undefined) {
            let id = submissionData._id;
            if (params.hasOwnProperty("url")) {
                let urlObject = {
                    submission: id,
                    url: params.url
                }
                //Creating url on the database with the id from the submission
                urlDatalayer
                .createUrl(urlObject)
                .then((urlData) => {
                    responseObj.status  = errorCodes.SUCCESS;
                    responseObj.message = "Success";
                    responseObj.data    = {id};
                    response.send(responseObj);
                })
                .catch((error) => {
                    responseObj.status  = errorCodes.SYNTAX_ERROR;
                    responseObj.message = error;
                    responseObj.data    = {error};
                    response.send(responseObj);
                });
                return;
            } else {
                let askObject = {
                    submission: id,
                    text: params.text
                }
                //Creating ask on the database with the id from the submission
                askDatalayer
                .createAsk(askObject)
                .then((res) => {
                    responseObj.status  = errorCodes.SUCCESS;
                    responseObj.message = "Success";
                    responseObj.data    = id;
                    response.send(responseObj);
                })
                .catch((error) => {
                    responseObj.status  = errorCodes.SYNTAX_ERROR;
                    responseObj.message = error;
                    responseObj.data    = {};
                    response.send(responseObj);
                });
                return;
            }
        } else {
            responseObj.status  = errorCodes.SYNTAX_ERROR;
            responseObj.message = "Syntax Error. Cannot create.";
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

function createAggregateSubmissionArray (match) {
    return [
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
          '$lookup': {
            'from': 'users', 
            'let': {
              'gId': '$googleId'
            }, 
            'pipeline': [
              {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$googleId', '$$gId'
                        ]
                      }
                    ]
                  }
                }
              }, {
                '$project': {
                  '_id': 0, 
                  'username': 1, 
                  'googleId': 1
                }
              }
            ], 
            'as': 'user'
          }
        }, {
          '$unwind': {
            'path': '$user'
          }
        }, {
          '$project': {
            'title': 1, 
            'points': 1, 
            'type': 1, 
            'createdAt': 1, 
            'user': 1,
            'url': 1,
            'ask': 1
          }
        }
      ]
}

async function createAggregateArray (offset, limit, match, orderBy) {
    let returnStatement =  [
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
    if (offset > 0) { 
      returnStatement.push({
        '$skip': parseInt(offset)
      });
    }
    if (limit > 0) { 
      returnStatement.push({
        '$limit': parseInt(limit)
      });
    }
    return returnStatement;
}
