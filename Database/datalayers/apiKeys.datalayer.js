const ApiKeyModel = require('../models/apiKeys.model')

exports.createApiKey= async (params) => {
    return new Promise((resolve, reject) => {
        ApiKeyModel
        .create(params)
        .then((data) => { 
            resolve(data) })
        .catch((error) => { reject(error) })
    })
}

exports.findApiKey = async (where = {}) => {
    return new Promise((resolve, reject) => {
        ApiKeyModel
        .findOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

exports.deleteApiKey = async (where = {}) => {
    return new Promise((resolve, reject) => {
        ApiKeyModel
        .deleteOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}