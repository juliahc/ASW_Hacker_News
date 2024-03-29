const DatabaseCtrl = require("./DatabaseCtrl");
const Comment = require("../Comment");

let CommentCtrl;
(function() {
    let instance;
    CommentCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.db = new DatabaseCtrl();
    };
}());

// Declare controller methods

CommentCtrl.prototype.postComment = async function(submission, text, googleId, username) {
    let comment = new Comment({submission: submission, text: text, googleId: googleId, username: username, parent: null});
    delete comment.parent;
    let resp = await this.db.postRequest("/newComment", comment);
    if (resp.status && resp.status === 200) return new Comment(resp.data);
    else throw Error(resp.status);
}

CommentCtrl.prototype.postReply = async function(parent, text, googleId, username) {
    // Obtain submission from parent comment.
    let resp = await this.db.getRequest("/comment", {"_id": parent});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    let comment = new Comment({parent: parent, submission: resp.data[0].submission, text: text, googleId: googleId, username: username});
    resp = await this.db.postRequest("/newComment", comment);
    let c= new Comment(resp.data);
    return c;
}

CommentCtrl.prototype.fetchComment = async function(id, authId) {
    let upvUsrCom = [];
    let resp;
    if (authId !== null) {
        resp = await this.db.getRequest("/likedComments", {"googleId": authId, "type": "up"});
        if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
        resp.data.forEach(comment => upvUsrCom.push(comment._id));
    }
    resp = await this.db.getRequest("/comment", {"_id": id});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    let comment = new Comment(resp.data[0]);
    comment.setUpvotedFromUserList(upvUsrCom);
    resp = await this.db.getRequest("/submission", {"_id": comment.submission});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("Comment does not have a submission!"); }
    comment.submissionTitle = resp.data.title;
    return comment;
}

CommentCtrl.prototype.fetchCommentsOfUser = async function(id, authId) {
    let upvUsrCom = [];
    let resp;
    if (authId !== null) {
        resp = await this.db.getRequest("/likedComments", {"googleId": authId, "type": "up"});
        if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
        resp.data.forEach(comment => upvUsrCom.push(comment._id));
    }
    resp = await this.db.getRequest("/userComments", {"googleId": id});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    let result = [];
    resp.data.forEach(comment_data => {
        let comment = new Comment(comment_data);
        comment.setUpvotedFromUserList(upvUsrCom);
        result.push(comment);
    });
    return result;
}

module.exports = CommentCtrl;
