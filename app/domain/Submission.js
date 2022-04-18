class Submission {
    constructor(id, title, points, createdAt, author) {
        //if (!'createdAt' in params) { return constructDefault(title, author/*, username*/) }
        this.id = id;
        this.title = title;
        this.author = author;
        //this.username = username;
        this.points = points;
        this.createdAt = createdAt;
        //this.comments = comments;
    }

    constructDefault(title, author/*, username*/) {
        this.id = null;
        this.title = title;
        this.author = author;
        //this.username = username;
        this.points = 0;
        this.createdAt = Date.now();
        //this.comments = [];
    }

    getTitle() {
        return this.title;
    }
}

module.exports = Submission;