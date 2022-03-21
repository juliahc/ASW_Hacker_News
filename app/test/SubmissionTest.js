const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");


let SC = new SubmissionCtrl();
// Mock the db controller
SC.db = new function() {
    this.postRequest = async function (endpoint, params) {
        if (endpoint === "/submission") {
            return 1;
        }
        throw Error("404 not found");
    }
    this.getRequest = async function (endpoint, query) {
        if (endpoint === "/submission") {
            if (query === 1) {
                return {"title": "Title", "url": "myUrl.me", "author": "MrX"};
            } else if (query === 2) {
                return {"title": "Title", "text": "My text", "author": "MrX"};
            } else {
                throw Error("301 no such submission id");
            }
        }
        if (endpoint === "/submission_page") {
            return [{"title": "Title", "url": "myUrl.me", "author": "MrX"}, {"title": "Title", "text": "My text", "author": "MrX"}]
        }
        throw Error("404 not found");
    }
}();

async function runTestBattery() {
    await SC.createSubmission("Title", "url", "ignored_text", "author").then((r) => console.log("Test 1 answer: ",r));
    await SC.createSubmission("Title", "", "text", "author").then((r) => console.log("Test 2 answer: ",r));
    await SC.fetchSubmission(1).then((r) => console.log("Test 3 answer: ",r));
    await SC.fetchSubmission(2).then((r) => console.log("Test 4 answer: ",r));
    await SC.fetchSubmission(3).then((r) => console.log("Test 5 answer: ",r)).catch((e) => console.log("Test 5 error: ",e.message));
    await SC.fetchSubmissionsForParams(1, "url", "new").then((r) => console.log("Test 6 answer: ",r));
}

console.log("-------------- Tests for Submissions --------------");
runTestBattery().then( _ => 
console.log("---------------------------------------------------"));