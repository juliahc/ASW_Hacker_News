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

SubmissionCtrl.prototype.createSubmission = async function(title, url, text, author) {
    let submission;
    if (url.length === 0) submission = new AskSubmission(null, title, 0, null, author, text);
    else submission = new UrlSubmission(null, title, 0, null, author, url);
    let id = await this.db.postRequest("/newSubmission", submission);
    return id;
}

SubmissionCtrl.prototype.fetchSubmission = async function(id) {
    let data = await this.db.getRequest("/submission", id);
    if (data.url !== undefined) return new UrlSubmission(data.title, data.url, data.author);
    else return new AskSubmission(data.title, data.text, data.author);
}

SubmissionCtrl.prototype.fetchSubmissionsForParams = async function(page, type, order) {
    if (!this.types.includes(type)) throw TypeError("Type of submissions is not supported.");
    if (!this.orders.includes(order)) throw TypeError("Order of submissions is not supported.");
    if (page <= 0) throw TypeError("Page must be greater than zero.");
    let data = await this.db.getRequest("/submission_page", {p: page, t: type, o: order});
    if (data.hasOwnProperty("status") && data.status === 200) {
        //Success
        data = data.data;   //Get the data from the database
    } else {
        //Error
        console.log("Error");
    }

    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        if (data[i].url !== undefined) result.push( new UrlSubmission(data[i]._id, data[i].title, data[i].points, data[i].createdAt, data[i].author, data[i].url) );
        else result.push( new AskSubmission(data[i]._id, data[i].title, data[i].points, data[i].createdAt, data[i].author, data[i].text) );
    }
    result.push(data[data.length-1]);
    return result;
}

module.exports = SubmissionCtrl;
