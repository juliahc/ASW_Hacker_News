const CommentModel = require('../models/comment.model')

exports.createComment= async (params) => {
    return new Promise((resolve, reject) => {
        CommentModel
        .create(params)
        .then((data) => { 
            resolve(data) })
        .catch((error) => { reject(error) })
    })
}

exports.findComment = async (where = {}) => {
    return new Promise((resolve, reject) => {
        CommentModel
        .findOne(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}