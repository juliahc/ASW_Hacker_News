const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const router = express.Router();
const calcTimeAgo = require("../utils/timeAgo")
module.exports = router;

const sub_ctrl = new SubmissionCtrl();

function calcTimeAgoSubmissions(submissions) {
    for(let submission of submissions) {
        let timeAgo = calcTimeAgo(submission.createdAt);
        submission.createdAt = timeAgo;
    }
    return submissions;
}

router.get("/", async (req, res) => {
    try {
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page = calcTimeAgoSubmissions(sub_page);
        res.render("news", { submissions: sub_page, p: p, view: "news", more: more });
    } catch (e) {
        res.render("news", { error: "Hacker News can't connect to his database" });
    }
    
});

router.get("/news", async (req, res) => {
    try {
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page = calcTimeAgoSubmissions(sub_page);
        res.render("news", { submissions: sub_page, p: p, view: "news", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database"});
    }
    
});

router.get("/newest", async (req, res) => {
    try {
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new");
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page = calcTimeAgoSubmissions(sub_page);
        res.render("news", { submissions: sub_page, p: p, view: "newest", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database"});
    }
});

router.get("/user", async (req, res) => {
    res.render("user", {});
});
