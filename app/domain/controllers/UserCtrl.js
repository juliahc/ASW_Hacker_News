const User = require("../User");
const DatabaseCtrl = require("./DatabaseCtrl");
const SubmissionCtrl = require("./SubmissionCtrl");
const Comment = require("../Comment");
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
            return jwt.sign(
                {id: id, username: username, karma: karma},
                process.env.USER_AUTH_SECRET_KEY,
                {
                    issuer: "hackernews.user."+id,
                    expiresIn: "5h"
                }
            )
        };
        this.sub_ctrl = new SubmissionCtrl();
    };
}());

// Declare controller methods

UserCtrl.prototype.login_or_register = async function(id, username, email) {
    // This method should only be called from the callback endpoint passed to google auth, as a result of a successful login.
    let resp, db_id, db_username, db_karma;
    resp = await this.db.getRequest('/user', {"googleId" : id});
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) {
        // User didn't exist -> register new user
        let user = new User({googleId: id, username: username, email: email})
        let newUser = await this.db.postRequest('/register', user);
        db_id = newUser.data.googleId;
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
    let resp = await this.db.getRequest('/user', {"googleId": id});
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
        delete user.apiKey;
    }
    return user;
}

UserCtrl.prototype.update = async function(authId, about, showdead, noprocrast, maxvisit, minaway, delay) {
    let postObject = { 
        "googleId": authId
    };

    if (about != undefined) postObject.about = about;
    if (showdead != undefined) postObject.showdead = showdead;
    if (noprocrast != undefined) postObject.noprocrast = noprocrast;
    if (maxvisit != undefined) postObject.maxvisit = maxvisit;
    if (minaway != undefined) postObject.minaway = minaway;
    if (delay != undefined) postObject.delay = delay;

    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
    return new User(resp.data);
}

UserCtrl.prototype.getUpvotedSubmissions = async function(limit, offset, authId) {
    let resp = await this.db.getRequest("/userSubmissions", {"googleId": authId, "type": "up", "limit": limit, "offset": offset});
    if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
    let data = resp.data;
    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        let submission = this.sub_ctrl.fromDbSubToDomainSub(data[i]);
        submission.upvoted = true;
        result.push(submission);
    }
    if (data.length) result.push(data[data.length-1]); // The last element of data list is the number of pages left.
    return result;
}

UserCtrl.prototype.getUpvotedComments = async function(authId) {
    let resp = await this.db.getRequest("/likedComments", {"googleId": authId, "type": "up"});
    if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
    let data = resp.data;
    let result = [];
    data.forEach(comment_data => {
        let comment = new Comment(comment_data);
        comment.upvoted = true;
        result.push(comment);
    });
    return result;
}

UserCtrl.prototype.upvoteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "upvoteSubmission" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.upvoteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "upvoteComment" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.downvoteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "downvoteSubmission" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.downvoteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "downvoteComment" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.getFavoriteSubmissions = async function(limit, offset, id) {
    let resp = await this.db.getRequest("/userSubmissions", {"googleId": id, "type": "fav", "limit": limit, "offset": offset});
    if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
    let data = resp.data;
    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        let submission = this.sub_ctrl.fromDbSubToDomainSub(data[i]);
        submission.upvoted = true;
        result.push(submission);
    }
    result.push(data[data.length-1]); // The last element of data list is the number of pages left.
}

UserCtrl.prototype.getFavoriteComments = async function(id) {
    return [];
}

UserCtrl.prototype.favoriteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "favouriteSubmission" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.favoriteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "favouriteComment" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.unfavoriteSubmission = async function(authId, submissionId) {
    let postObject = { 
        "googleId": authId, 
        "submission": submissionId,
        "type": "unfavouriteSubmission" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

UserCtrl.prototype.unfavoriteComment = async function(authId, commentId) {
    let postObject = { 
        "googleId": authId, 
        "comment": commentId,
        "type": "unfavouriteComment" };
    let resp = await this.db.postRequest('/updateUser', postObject);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('Resource not found'); }
}

module.exports = UserCtrl;