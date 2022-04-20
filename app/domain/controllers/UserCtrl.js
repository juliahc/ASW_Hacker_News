const User = require("../User");
const DatabaseCtrl = require("./DatabaseCtrl");
require("dotenv").config();

const jwt = require("jsonwebtoken");

let UserCtrl;
(function() {
    let instance;
    UserCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.db = new DatabaseCtrl();
        this.encrypt = function(id, username, karma) {
            console.log("----------------id: ", id)
            return jwt.sign(
                {id: id, username: username, karma: karma},
                process.env.USER_AUTH_SECRET_KEY,
                {
                    issuer: "hackernews.user."+id,
                    expiresIn: "5h"
                }
            )
        };
    };
}());

// Declare controller methods

UserCtrl.prototype.login_or_register = async function(id, username, email) {
    // This method should only be called from the callback endpoint passed to google auth, as a result of a successful login.
    let resp, db_id, db_username, db_karma;
    resp = await this.db.getRequest('/user', id);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) {
        // User didn't exist -> register new user
        let user = new User({googleId: id, username: username, email: email})
        db_id = await this.db.postRequest('/register', user);
        db_username = user.username;
        db_karma = user.karma;
    } else {
        db_id = resp.data.googleId;
        db_username = resp.data.username;
        db_karma = resp.data.karma;
    }
    // Return user_auth token
    return this.encrypt(db_id, db_username, db_karma);
}

UserCtrl.prototype.profile = async function(authId, id) {
    let resp = await this.db.getRequest('/user', id);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('No such user'); }
    let user = new User(resp.data);
    if (authId != id) {
        // User is requesting information from a different user, we remove private data.
        delete user.email;
        delete user.showdead;
        delete user.noprocrast;
        delete user.maxvisit;
        delete user.minaway;
        delete user.delay;
    }
    return user;
}

UserCtrl.prototype.update = async function(authId, about, showdead, noprocrast, maxvisit, minaway, delay) {

}

UserCtrl.prototype.getUpvotedSubmissionIds = async function(authId) {
    return [];
}

UserCtrl.prototype.getUpvotedCommentIds = async function(authId) {
    return [];
}

UserCtrl.prototype.upvoteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "upvoteSubmission" };
    console.log("UserCtrl.upvot")
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.upvoteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "upvoteComment" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.downvoteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "downvoteSubmission" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.downvoteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "downvoteComment" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.getFavoriteSubmissionIds = async function(id) {
    return [];
}

UserCtrl.prototype.getFavoriteCommentIds = async function(id) {
    return [];
}

UserCtrl.prototype.favoriteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "favouriteSubmission" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.favoriteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "favouriteComment" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.unfavoriteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "unfavouriteSubmission" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

UserCtrl.prototype.unfavoriteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "unfavouriteComment" };
    let resp = await this.db.postRequest('/update', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return;
}

module.exports = UserCtrl;