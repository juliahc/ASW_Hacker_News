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
    };
}());

// Declare controller methods

SubmissionCtrl.prototype.createSubmission = async function(title, url, text, author, username) {
    let submission;
    if (url.length === 0) submission = new AskSubmission({title: title, author: author, username: username, text: text});
    else submission = new UrlSubmission({title: title, author: author, username: username, url: url});
    let id = await this.db.postRequest("/newSubmission", submission);
    return id;
}

SubmissionCtrl.prototype.fetchSubmission = async function(id) {
    let resp = await this.db.getRequest("/submission", id);
    if (resp.status == this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such submission"); }
    if (!'url' in resp.data) return new UrlSubmission(resp.data);
    else return new AskSubmission(resp.data);
}

SubmissionCtrl.prototype.fetchSubmissionsForParams = async function(page, type, order) {
    if (!this.types.includes(type)) throw TypeError("Type of submissions is not supported.");
    if (!this.orders.includes(order)) throw TypeError("Order of submissions is not supported.");
    if (page <= 0) throw TypeError("Page must be greater than zero.");
    let data = await this.db.getRequest("/submission_page", {p: page, t: type, o: order});
    if (data.hasOwnProperty("status") && data.status === this.db.errors.SUCCESS) {
        //Success -> get data object from db
        data = data.data;
    } else {
        //Error
        console.log("Error");
    }

    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        if (data[i].type === "url") result.push( new UrlSubmission(data[i]._id, data[i].title, data[i].points, data[i].createdAt, data[i].author, data[i].url[0].url) );
        else result.push( new AskSubmission(data[i]._id, data[i].title, data[i].points, data[i].createdAt, data[i].author, data[i].ask[0].text) );
        /* wait until database changes
        // For each object do the necessary transformation to its attributes
        let submission = data[i];
        submission.id = submission._id;
        delete submission._id;
        if (data[i].url !== undefined) result.push(new UrlSubmission(submission));
        else result.push(new AskSubmission(submission));
        */
    }
    result.push(data[data.length-1]); // The last element of data list is the number of pages left.
    return result;
}

module.exports = SubmissionCtrl;
