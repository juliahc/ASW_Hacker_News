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
    if (mongodb.ObjectId.isValid(mongodb.ObjectId(id))) {
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
            if (submissionData !== null && typeof submissionData !== undefined) {
                responseObj.status  = errorCodes.SUCCESS;
                responseObj.message = "Success";
                responseObj.data    = submissionData;
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
        responseObj.status  = errorCodes.SYNTAX_ERROR;
        responseObj.message = "Invalid id";
        responseObj.data    = {};
        response.send(responseObj);
    }
    return;
};

exports.page = async (request, response) => {
    let params = {}
    //console.log(request);
    if (request.query.hasOwnProperty("p") && request.query.hasOwnProperty("t") && request.query.hasOwnProperty("o")) {
        params = request.query;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }

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
      criteria["$and"].push({
            googleId: {
                $eq: params.usr
            }
        });
    }

    switch(request.query.o) {
        case "new":
            orderBy = {
                "createdAt": -1
            };
            break;
        default:
            orderBy = {
                "points": -1
            };
            break;
    }

    if (criteria['$and'].length === 0) {
        delete criteria['$and'];
    }

    let aggregateArr = createAggregateArray(((request.query.p - 1) * 10), criteria, orderBy);
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
                ret[0].submissionsLeft -= (request.query.p * 10);
                submissionData.push(ret[0]);
                responseObj.status  = errorCodes.SUCCESS;
                responseObj.message = "Success";
                responseObj.data    = submissionData;
                response.send(responseObj);
            }))
            .catch((err) => {
                console.log(err);
            });
          } else {
            responseObj.status  = errorCodes.DATA_NOT_FOUND;
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
}

exports.comments = async (request, response) => {
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
    if (mongodb.ObjectId.isValid(mongodb.ObjectId(id))) {
        const where = {};
        where._id = mongodb.ObjectId(id);

        submissionDatalayer.findSubmission(where)
        .then((submissionData) => {
            if (submissionData !== null && typeof submissionData !== undefined) {
                //The submission exists on the database. Now we need to get the comments
                console.log(submissionData);
                const criteria = {};
                criteria["$and"] = [];
                criteria["$and"].push({
                    parent: {
                        $eq: null
                    }
                });
                criteria["$and"].push({
                    submission: {
                        $eq: submissionData._id
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
    } else {
        responseObj.status  = errorCodes.SYNTAX_ERROR;
        responseObj.message = "Invalid id";
        responseObj.data    = {};
        response.send(responseObj);
    }
    return;
}

exports.create = async (request, response) => {
    console.log(request)
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
            'user': 1
          }
        }
      ]
}

function createAggregateArray (page, match, orderBy) {
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
          '$sort': orderBy
        }, {
            '$skip': page
        },
        {
            '$limit': 10
        }
      ];
}
