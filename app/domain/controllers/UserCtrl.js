const User = require("../User");
const DatabaseCtrl = require("./DatabaseCtrl");

const jwt = require("jsonwebtoken");

let UserCtrl;
(function() {
    let instance;
    UserCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.db = new DatabaseCtrl();
        this.encrypt = function(id, tokens) {
            return jwt.sign(
                {id: id, google_tokens: tokens},
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

UserCtrl.prototype.login_or_register = async function(id, username, email, tokens) {
    // This method should only be called from the callback endpoint passed to google auth, as a result of a successful login.
    let user, db_id;
    user = await this.db.getRequest('/users', id);
    if (user.status == this.db.errors.RESOURCE_NOT_FOUND) {
        // User didn't exist -> register new user
        user = new User({id: id, username: username, email: email})
        db_id = await this.db.postRequest('/users', user);
    } else {
        db_id = user.data.id;
    }
    // Return user_auth token
    return this.encrypt(db_id, tokens);
}

UserCtrl.prototype.profile = async function(authId, id) {
    let response = await this.db.getRequest('/users', id);
    if (response.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error('No such user'); }
    let user = new User(response.data);
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

UserCtrl.prototype.update = async function(authId, about, email, showdead, noprocrast, maxvisit, minaway, delay) {

}

UserCtrl.prototype.getUpvotedSubmissionIds = async function(authId) {
    return [];
}

UserCtrl.prototype.getUpvotedCommentIds = async function(authId) {
    return [];
}

UserCtrl.prototype.upvoteSubmission = async function(authId, submissionId) {

}

UserCtrl.prototype.upvoteComment = async function(authId, commentId) {

}

UserCtrl.prototype.getFavoriteSubmissionIds = async function(id) {
    return [];
}

UserCtrl.prototype.getFavoriteCommentIds = async function(id) {
    return [];
}

UserCtrl.prototype.favoriteSubmission = async function(authId, submissionId) {

}

UserCtrl.prototype.favoriteComment = async function(authId, commentId) {

}