const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const router = express.Router();
const calcTimeAgo = require("../utils/timeAgo");
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();

const AuthMiddleware = require("./auth_middleware");
const auth = new AuthMiddleware();

router.get("/", async (req, res) => {
    try {
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
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
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
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
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { submissions: sub_page, p: p, view: "newest", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database"});
    }
});

router.get("/user", async (req, res) => {
    res.render("user", {});
});

router.get("/threads", auth.passthrough, async (req, res) => {
    if (!req.query.id) {
        if (req.user_auth.id !== null) res.redirect("/threads?id=" + req.user_auth.id);
        else res.send("No such user");
    }
    try {
        let id = req.query.id;
        let comment_list = await comm_ctrl.fetchCommentsOfUser(id);
        comment_list.forEach(comment => comment.formatCreatedAtAsTimeAgo());
        res.render("threads", {comments: comment_list});
    } catch {
        res.send("No such user");
    }
});
