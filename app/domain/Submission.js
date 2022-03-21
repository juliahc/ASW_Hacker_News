class Submission {
    constructor(title, author) {
        this.title = title;
        this.author = author;
        this.comments = [];
    }
    getTitle() {
        return this.title;
    }
}

module.exports = Submission;