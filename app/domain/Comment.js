const time_ago = require("../utils/timeAgo");
class Comment {
    constructor(params) {
        if (!params.hasOwnProperty('createdAt')) { return this.constructDefault(params.googleId, params.username, params.parent, params.submission, params.text) }
        this.id = params._id;
        this.googleId = params.googleId
        this.username = params.username
        this.text = params.text;
        this.points = params.points;
        this.createdAt = params.createdAt;
        this.parent = params.parent;
        this.submission = params.submission;
        this.replies = [];
        if (params.hasOwnProperty('children')){
            params.children.forEach(comment => {
                if (params.replies.includes(comment._id)) this.replies.push(new Comment(comment))
            });
        }
    }

    constructDefault(googleId, username, parent, submission, text) {
        this.id = null;
        this.googleId = googleId;
        this.username = username;
        this.text = text;
        this.points = 0;
        this.createdAt = Date.now();
        this.parent = parent;
        this.submission = submission;
        this.replies = [];
    }

    formatCreatedAtAsTimeAgo() {
        let timeAgo = time_ago(this.createdAt);
        this.createdAt = timeAgo;
        this.replies.forEach(comment => comment.formatCreatedAtAsTimeAgo());
    }

    addNavigationalIdentifiers(root, depth) {
        if (root !== null) this.root = root;
        if (depth === 1) root = this.parent;
        for (let i = 0; i < this.replies.length; i++) {
            if (i > 0) this.replies[i].prev = this.replies[i-1].id;
            if (i < this.replies.length-1) this.replies[i].next = this.replies[i+1].id;
            this.replies[i].addNavigationalIdentifiers(root, depth+1);
        }
        if (this.parent === null) delete this.parent;
    }
}

module.exports = Comment;

