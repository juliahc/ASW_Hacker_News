const Submission = require("./Submission");

class AskSubmission extends Submission {

    constructor(id, title, points, createdAt, author, text) {
        super(id, title, points, createdAt, author);
        this.text = text;
        this.type = "ask";
    }
}

module.exports = AskSubmission;