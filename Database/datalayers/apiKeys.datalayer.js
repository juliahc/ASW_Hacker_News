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

exports.generateRandomKey = () => {
    return new Promise((resolve, reject) => {
        let key = Math.random().toString(40).substring(13, 33) + Math.random().toString(40).substring(3, 23)
        ApiKeyModel.findOne({ key: key })
        .then((data) => {
            if(data != null && data != undefined) {
                exports.generateRandomKey()
            } else {
                resolve(key)
            }
        })
        .catch((error) => {
            reject(error)
        })
    })
}