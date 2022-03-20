const UrlModel = require('../models/url.model')

exports.createUrl= async (params) => {
    console.log(params);
    return new Promise((resolve, reject) => {
        UrlModel
        .create(params)
        .then((data) => { 
            resolve(data) })
        .catch((error) => { reject(error) })
    })
}


exports.findUrl = async (where = {}) => {
    return new Promise((resolve, reject) => {
        UrlModel
        .findOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}