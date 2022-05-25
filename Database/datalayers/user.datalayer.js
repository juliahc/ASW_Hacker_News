const UserModel = require('../models/user.model')

exports.createUser = async (params) => {
    return new Promise((resolve, reject) => {
        UserModel
        .create(params)
        .then((data) => {
            resolve(data) }
        )
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

exports.updateUser = async (where = {}, params) => {
    return new Promise((resolve, reject) => {
        UserModel.
        findOneAndUpdate(where, params, { returnOriginal: false })
        .then((data) => {
            resolve(data);
        })
        .catch((error) => {
            reject(error);
        });
    });
}