const AskSubmission = require("../AskSubmission");
const UrlSubmission = require("../UrlSubmission");
const DatabaseCtrl = require("./DatabaseCtrl");
const CommentCtrl = require("./CommentCtrl");
const axios = require("axios"); 

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
        };
        this.comm_ctrl = new CommentCtrl();
    };
}());

// Declare controller methods

SubmissionCtrl.prototype.createSubmission = async function(title, url, text, googleId, username) {
    let submission, createComment;
    if (url.length === 0) {
        submission = new AskSubmission({title: title, googleId: googleId, username: username, text: text});
        createComment = false;
    } else {
        let valid = true;
        await axios({ method: 'get', url: url })
          .then(response => {
            valid = true;
          })
          .catch(err => {
              valid = false;
          });
        
        if (!valid) return {success: false, existant: false};
        submission = new UrlSubmission({title: title, googleId: googleId, username: username, url: url});
        createComment = text.length > 0;
    }
    let db_sub = await this.db.postRequest("/newSubmission", submission);
    if (db_sub.hasOwnProperty("status") && db_sub.status === this.db.errors.DATA_ALREADY_EXISTS) return {success: false, id: db_sub.data, existant: true};
    if (createComment) {
        this.comm_ctrl.postComment(db_sub.data.id, text, googleId, username);
    }
    return {success: true, id: db_sub.data.id};
}

SubmissionCtrl.prototype.fetchSubmission = async function(id, authId) {
    let upvSubIds = [];
    if (authId !== null) {
        let usrUpvRsp = await this.db.getRequest("/userSubmissions", {"googleId": authId, "type": "up"});
        if (usrUpvRsp.hasOwnProperty("status") && usrUpvRsp.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
        usrUpvRsp.data.forEach(submission => {
            upvSubIds.push(submission._id);
        });
    }
    let upvUsrCom = [];
    if (authId !== null) {
        let usrUpvCom = await this.db.getRequest("/likedComments", {"googleId": authId, "type": "up"});
        if (usrUpvCom.hasOwnProperty("status") && usrUpvCom.status !== this.db.errors.SUCCESS) throw Error("Something went wrong in the database");
        usrUpvCom.data.forEach(comment => upvUsrCom.push(comment._id));
    }
    let resp = await this.db.getRequest("/submission", {"_id": id});
    if (resp.status === this.db.errors.RESOURCE_NOT_FOUND) { throw Error("No such submission"); }
    let submission = this.fromDbSubToDomainSub(resp.data);
    if (upvSubIds.includes(submission.id)) submission.upvoted = true;
    else  submission.upvoted = false;
    submission.comments.forEach(comment => comment.setUpvotedFromUserList(upvUsrCom));
    return submission;
}

SubmissionCtrl.prototype.fetchSubmissionsForParams = async function(limit, offset, type, order, googleId, authId) {
    if (!this.types.includes(type)) throw TypeError("Type of submissions is not supported.");
    if (!this.orders.includes(order)) throw TypeError("Order of submissions is not supported.");
    if (limit < 0 || offset < 0) throw TypeError("Limit and Offset must be >= than zero.");
    // Get logged user upvoted submissions
    let upvSubIds = [];
    if (authId !== null) {
        let usrUpvRsp = await this.db.getRequest("/userSubmissions", {"googleId": authId, "type": "up"});
        if (usrUpvRsp.hasOwnProperty("status") && usrUpvRsp.status !== this.db.errors.SUCCESS) throw Error(usrUpvRsp.message);
        usrUpvRsp.data.forEach(submission => {
            upvSubIds.push(submission._id);
        });
    }
    // Get submissions list
    let params = {limit: (limit !== undefined) ? limit : "", offset: (offset !== undefined) ? offset : "", t: type, o: order};
    if (googleId !== null) params["usr"] = googleId;
    let resp = await this.db.getRequest("/submission_page", params);
    if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) throw Error(resp.message);
    let data = resp.data;
    let result = [];
    for (let i = 0; i < data.length-1; i++) {
        let submission = this.fromDbSubToDomainSub(data[i]);
        if (upvSubIds.includes(submission.id)) submission.upvoted = true;
        else  submission.upvoted = false;
        result.push(submission);
    }
    if(data.length) result.push(data[data.length-1]); // The last element of data list is the number of pages left.
    return result;
}

module.exports = SubmissionCtrl;

