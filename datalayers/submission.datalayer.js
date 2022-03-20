const SubmissionModel = require('../models/submission.model')

exports.createSubmission = async (params) => {
    console.log(params);
    return new Promise((resolve, reject) => {
        SubmissionModel
        .create(params)
        .then((data) => { 
            resolve(data) })
        .catch((error) => { reject(error) })
    })
}


exports.findSubmission = async (where = {}) => {
    return new Promise((resolve, reject) => {
        SubmissionModel
        .findOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}