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
            author: {
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
            let aggregateQuery = [
                {
                  '$match': {}
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
        points: params.points,
        type: (params.hasOwnProperty("url")) ? "url" : "ask"
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

function createAggregateSubmissionArray (match) {
    return [
        {
          '$match': match
        }, {
          '$lookup': {
            'from': 'users', 
            'let': {
              'gId': '$author'
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
            'localField': '_id', 
            'foreignField': 'submission', 
            'as': 'url'
          }
        }, {
          '$lookup': {
            'from': 'asks', 
            'localField': '_id', 
            'foreignField': 'submission', 
            'as': 'ask'
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
