const DatabaseCtrl = require("./DatabaseCtrl");

let CommentCtrl;
(function() {
    let instance;
    CommentCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.types = ["sub", "comm"];
        this.db = new DatabaseCtrl();
    };
}());

// Declare controller methods

Comment.prototype.postComment = async function(parent, type, text, googleId, username) {
    if (!type in this.types) throw Error("Comment parent type [" + type + "] not supported");
    let comment = new Comment({parent: parent, text: text, googleId: googleId, username: username});
    comment.type = type;
    let id = await this.db.postRequest("/newComment", comment);
    return id;
}

CommentCtrl.prototype.fetchComment = async function(id) {
    let resp = await this.db.getRequest("/comment", id);
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such comment"); }
    return new Comment(resp.data);
}

module.exports = CommentCtrl;
