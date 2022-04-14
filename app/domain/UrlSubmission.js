const Submission = require("./Submission");

class UrlSubmission extends Submission {
    
    constructor(params) {
        super(params);
        this.url = params.url;
        this.type = "url";
    }
}

module.exports = UrlSubmission;