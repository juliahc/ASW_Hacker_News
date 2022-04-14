class Submission {
    constructor(params) {
        if (!'createdAt' in params) { return constructDefault(params.title, params.author, params.username) }
        this.id = params.id;
        this.title = params.title;
        this.author = params.author;
        this.username = params.username;
        this.points = params.points;
        this.createdAt = params.createdAt;
        this.comments = params.comments;
    }

    constructDefault(title, author, username) {
        this.id = null;
        this.title = title;
        this.author = author;
        this.username = username;
        this.points = 0;
        this.createdAt = Date.now();
        this.comments = [];
    }

    getTitle() {
        return this.title;
    }
}

module.exports = Submission;