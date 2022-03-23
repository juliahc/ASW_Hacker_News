class Submission {
    
    constructor(id, title, points, createdAt, author) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.points = points;
        this.createdAt = createdAt;
        this.comments = [];
    }
    getTitle() {
        return this.title;
    }
}

module.exports = Submission;