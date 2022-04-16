const Comment = require("./Comment");

class Submission {
    constructor(params) {
        if (!'createdAt' in params) { return constructDefault(params.title, params.googleId, params.username) }
        this.id = params.id;
        this.title = params.title;
        this.googleId = params.googleId || params.user.googleId;
        this.username = params.username || params.user.username;
        this.points = params.points;
        this.createdAt = params.createdAt;
        if (Array.isArray(params.comments)) {
            this.comments = [];
            params.comments.forEach(comment => this.comments.push(new Comment(comment)));
        } else {
            this.comments = params.comments;
        }
    }

    constructDefault(title, googleId, username) {
        this.id = null;
        this.title = title;
        this.googleId = googleId;
        this.username = username;
        this.points = 0;
        this.createdAt = Date.now();
        this.comments = [];
    }
}

module.exports = Submission;