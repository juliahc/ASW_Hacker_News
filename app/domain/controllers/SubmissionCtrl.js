const AskSubmission = require("../AskSubmission");
const UrlSubmission = require("../UrlSubmission");
const DatabaseCtrl = require("./DatabaseCtrl");

let SubmissionCtrl;
(function() {
    let instance;
    SubmissionCtrl = function() {
        if (instance) return instance;
        instance = this;

        // initialize any properties of the singleton
        this.types = ["any", "url", "ask"];
        this.orders = ["pts", "new"];
        this.db = new DatabaseCtrl();
        this.fromDbSubToDomainSub = function(submission) {
            submission.id = submission._id;
            delete submission._id;
            if (submission.type === "url") {
                submission.url = submission.url.url;
                return new UrlSubmission(submission);
            }
            else {
                submission.text = submission.ask.text;
                delete submission.ask;
                return new AskSubmission(submission);
            }
        }
    };
}());

// Declare controller methods

SubmissionCtrl.prototype.createSubmission = async function(title, url, text, googleId, username) {
    let submission;
    if (url.length === 0) submission = new AskSubmission({title: title, googleId: googleId, username: username, text: text});
    else submission = new UrlSubmission({title: title, googleId: googleId, username: username, url: url});
    let id = await this.db.postRequest("/newSubmission", submission);
    return id;
}

SubmissionCtrl.prototype.fetchSubmission = async function(id) {
    let resp = await this.db.getRequest("/submission", id);
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such submission"); }
    if (!'url' in resp.data) return new UrlSubmission(resp.data);
    else return new AskSubmission(resp.data);
}

SubmissionCtrl.prototype.fetchSubmissionsForParams = async function(page, type, order, googleId, authId) {
    if (!this.types.includes(type)) throw TypeError("Type of submissions is not supported.");
    if (!this.orders.includes(order)) throw TypeError("Order of submissions is not supported.");
    if (page <= 0) throw TypeError("Page must be greater than zero.");
    // Get logged user upvoted submissions
    let upvSubIds = [];
    if (authId !== null) {
        let usrUpvRsp = await this.db.getRequest("/userUpvotedSubmissions", authId);
        if (usrUpvRsp.hasOwnProperty("status") && usrUpvRsp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
        usrUpvRsp.data.forEach(submission => {
            upvSubIds.push(submission._id);
        });
    }
    // Get submissions list
    let params = {p: page, t: type, o: order};
    if (googleId !== null) params["usr"] = googleId;
    let resp = await this.db.getRequest("/submission_page", params);
    if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
    let data = resp.data;
    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        let submission = this.fromDbSubToDomainSub(data[i]);
        if (upvSubIds.includes(submission.id)) submission.upvoted = true;
        else  submission.upvoted = false;
        result.push(submission);
    }
    result.push(data[data.length-1]); // The last element of data list is the number of pages left.
    return result;
}

module.exports = SubmissionCtrl;

