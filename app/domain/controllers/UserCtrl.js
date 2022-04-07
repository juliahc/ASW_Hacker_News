const User = require("../User");
const DatabaseCtrl = require("./DatabaseCtrl");

let UserCtrl;
(function() {
    let instance;
    UserCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.db = new DatabaseCtrl();
    };
}());

// Declare controller methods

UserCtrl.prototype.registerUser = async function(username, password) {
    
}

UserCtrl.prototype.login = async function(username, password) {
    return "this should be a token?";
}

UserCtrl.prototype.profile = async function(username, hmac) {
    return new User({username: username, password: "password"})
}

UserCtrl.prototype.update = async function(username, hmac, about, email, showdead, noprocrast, maxvisit, minaway, delay) {

}

UserCtrl.prototype.changePassword = async function(old_pw, new_pw) {

}

UserCtrl.prototype.getUpvotedSubmissionIds = async function(username, hmac) {
    return [];
}

UserCtrl.prototype.getUpvotedCommentIds = async function(username, hmac) {
    return [];
}

UserCtrl.prototype.upvoteSubmission = async function(username, hmac) {

}

UserCtrl.prototype.upvoteComment = async function(username, hmac) {

}

UserCtrl.prototype.getFavoriteSubmissionIds = async function(username) {
    return [];
}

UserCtrl.prototype.getFavoriteCommentIds = async function(username) {
    return [];
}

UserCtrl.prototype.favoriteSubmission = async function(username, hmac) {

}

UserCtrl.prototype.favoriteComment = async function(username, hmac) {

}