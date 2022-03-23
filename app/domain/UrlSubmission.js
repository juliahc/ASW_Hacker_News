const Submission = require("./Submission");

class UrlSubmission extends Submission {
    
    constructor(id, title, points, createdAt, author, url) {
        super(id, title, points, createdAt, author);
        this.url = url;
        this.type = "url";
    }
}

module.exports = UrlSubmission;