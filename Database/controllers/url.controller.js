// load model
const responseObj = {};
const mongodb = require("mongodb");
const errorCodes = require("../helpers/errorCodes.helper.js");

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
        urlDatalayer.findUrl(where)
        .then((urlData) => {
            if (urlData !== null && typeof urlData !== undefined) {
                responseObj.status  = errorCodes.SUCCESS;
                responseObj.message = "Success";
                responseObj.data    = urlData;
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
    urlDatalayer.createUrl(params)
    .then((urlData) => {
        if (urlData !== null && typeof urlData !== undefined) {
            responseObj.status  = errorCodes.SUCCESS;
            responseObj.message = "Success";
            responseObj.data    = urlData;
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