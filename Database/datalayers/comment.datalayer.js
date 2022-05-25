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
        .find(where)
        .then((data) => {
            resolve(data)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

exports.updateComment = async (where = {}, updateParams) => {
    return new Promise((resolve, reject) => {
        CommentModel.
        updateMany(where, updateParams)
        .then((data) => {
            resolve(data);
        })
        .catch((error) => {
            reject(error);
        });
      });
}

exports.aggregateComment = async (aggregateArr) => {
    return new Promise((resolve, reject) => {
        CommentModel
        .aggregate(aggregateArr)
        .then((data) => {
            resolve(data);
        })
        .catch((error) => {
            reject(error);
        });
    });
}