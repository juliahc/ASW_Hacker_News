const Submission = require("./Submission");

class AskSubmission extends Submission {
    constructor(title, text, author) {
        super(title, author);
        this.text = text;
    }
}

module.exports = AskSubmission;