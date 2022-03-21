const Submission = require("./submission");

class UrlSubmission extends Submission {
    constructor(title, url, author) {
        super(title, author);
        this.url = url;
    }
}

module.exports = UrlSubmission;