const Submission = require("./Submission");

class AskSubmission extends Submission {

    constructor(params) {
        super(params);
        this.text = params.text;
        this.type = "ask";
    }
}

module.exports = AskSubmission;