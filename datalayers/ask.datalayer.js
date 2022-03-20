const AskModel = require('../models/ask.model')

exports.createAsk= async (params) => {
    console.log(params);
    return new Promise((resolve, reject) => {
        AskModel
        .create(params)
        .then((data) => { 
            resolve(data) })
        .catch((error) => { reject(error) })
    })
}

exports.findAsk = async (where = {}) => {
    return new Promise((resolve, reject) => {
        AskModel
        .findOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}