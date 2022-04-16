class Comment {
    constructor(params) {
        if (!'createdAt' in params) { return constructDefault(params.googleId, params.username, params.parent, params.text) }
        this.id = params.id;
        this.googleId = params.googleId || params.user.googleId;
        this.username = params.username || params.user.username;
        this.text = params.text;
        this.points = params.points;
        this.createdAt = params.createdAt;
        this.parent = params.parent;
        this.replies = [];
        params.replies.forEach(comment => this.replies.push(new Comment(comment)));
    }

    constructDefault(googleId, username, parent, text) {
        this.id = null;
        this.googleId = googleId;
        this.username = username;
        this.text = text;
        this.points = 0;
        this.createdAt = Date.now();
        this.parent = parent;
        this.replies = [];
    }
}

module.exports = Comment;