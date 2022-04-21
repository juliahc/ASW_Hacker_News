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
    console.log("entro commentCtrl")
    let comment = new Comment({submission: submission, text: text, googleId: googleId, username: username, parent: null});
    delete comment.parent;
    let resp = await this.db.postRequest("/newComment", comment);
    return new Comment(resp.data);
}
CommentCtrl.prototype.postReply = async function(parent, text, googleId, username) {
    // Obtain submission from parent comment.
    let resp = await this.db.getRequest("/comment", {"_id": parent});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    let comment = new Comment({parent: parent, submission: resp.data.submission, text: text, googleId: googleId, username: username});
    resp = await this.db.postRequest("/newComment", comment);
    let c= new Comment(resp.data);
    console.log(c)
    return c;
}

CommentCtrl.prototype.fetchComment = async function(id) {
    let resp = await this.db.getRequest("/comment", {"_id": id});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    let comment = new Comment(resp.data);
    resp = await this.db.getRequest("/submission", {"_id": comment.submission});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("Comment does not have a submission!"); }
    comment.submissionTitle = resp.data.title;
    return comment;
}

CommentCtrl.prototype.fetchCommentsOfUser = async function(id) {
    let resp = await this.db.getRequest("/userComments", {"googleId": id});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    let result = [];
    resp.data.forEach(comment => {
        result.push(new Comment(comment));
    });
    return result;
}

module.exports = CommentCtrl;
