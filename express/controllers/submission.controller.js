// load model
const responseObj = {};
const mongodb = require("mongodb");
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
        const where = {};
        where._id = mongodb.ObjectId(id);
        submissionDatalayer.findSubmission(where)
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
    if (request.query.hasOwnProperty("p") && request.query.hasOwnProperty("t") && request.query.hasOwnProperty("o")) {
        params = request.query;
    } else {
        responseObj.status  = errorCodes.REQUIRED_PARAMETER_MISSING;
        responseObj.message = "Required parameters missing";
        responseObj.data    = {};
        response.send(responseObj);
        return;
    }

    let match = {};
    let orderBy = {};

    if (request.query.t !== "any") {
        match = {
            type: {
                $eq: request.query.t
            }
        }
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

    let aggregateArr = createAggregateArray(match, orderBy);
    //Search submissions by aggregation -> match: any, url or ask. orderBy: points, createdAt (desc)
    submissionDatalayer
    .aggregateSubmission(aggregateArr)
    .then((submissionData) => {
        if (
            submissionData !== null &&
            typeof submissionData !== "undefined" &&
            submissionData.length
          ) {
            responseObj.status  = errorCodes.SUCCESS;
            responseObj.message = "Success";
            responseObj.data    = submissionData;
            response.send(responseObj);
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

function createAggregateArray (match, orderBy) {
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
        }
      ];
}