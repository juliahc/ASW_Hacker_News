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
        this.types = ["any", "url", "ask", "usr"];
        this.orders = ["pts", "new"];
        this.db = new DatabaseCtrl();
        this.fromDbSubToDomainSub = function(submission) {
            submission.id = submission._id;
            delete submission._id;
            if (submission.type === "url") {
                submission.url = submission.url[0].url;
                return new UrlSubmission(submission);
            }
            else {
                submission.text = submission.ask[0].text;
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

SubmissionCtrl.prototype.fetchSubmissionsForParams = async function(page, type, order, googleId) {
    if (!this.types.includes(type)) throw TypeError("Type of submissions is not supported.");
    if (!this.orders.includes(order)) throw TypeError("Order of submissions is not supported.");
    if (page <= 0) throw TypeError("Page must be greater than zero.");
    let resp = await this.db.getRequest("/submission_page", {p: page, t: type, o: order, id: googleId});
    if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
    let data = resp.data;
    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        result.push(this.fromDbSubToDomainSub(data[i]));
    }
    result.push(data[data.length-1]); // The last element of data list is the number of pages left.
    return result;
}

module.exports = SubmissionCtrl;
