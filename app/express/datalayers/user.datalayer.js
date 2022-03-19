const UserModel = require('./../models/user.model')

exports.createUser = async (params) => {
    console.log(params);
    return new Promise((resolve, reject) => {
        UserModel
        .create(params)
        .then((data) => { 
            resolve(data) })
        .catch((error) => { reject(error) })
    })
}


exports.findUser = async (where = {}) => {
    return new Promise((resolve, reject) => {
        UserModel
        .findOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}