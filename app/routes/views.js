const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const router = express.Router();

const AuthMiddleware = require("./auth_middleware");
const UserCtrl = require("../domain/controllers/UserCtrl");
const auth = new AuthMiddleware();

module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const user_ctrl = new UserCtrl();

router.get("/", auth.passthrough, async (req, res) => {
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts",null,auth_id,auth_id);
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/news", more: more });
    } catch (e) {
        res.render("news", { error: "Hacker News can't connect to his database" });
    }
    
});

router.get("/news", auth.passthrough, async (req, res) => {
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts",null,auth_id);
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/news", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database"});
    }
    
});

router.get("/newest", auth.passthrough, async (req, res) => {
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new",null,auth_id);
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/newest", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database"});
    }
});

router.get("/ask", auth.passthrough, async (req, res) => {
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"ask","pts",null,auth_id);
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/ask", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database"});
    }
});

router.get("/submitted", auth.passthrough, async (req, res) => {
    if (!req.query || !req.query.id) {
        if (req.user_auth !== null) res.redirect("/submitted?id=" + req.user_auth.id);
        else res.send("No such user");
        return;
    }
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new",req.query.id,auth_id);
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/submitted?id=" + req.query.id, more: more });
    } catch {
        res.send("No such user");
    }
});

router.get("/submission", async (req, res) => {
    if (!req.query || !req.query.id) {
        res.send("No such submission");
        return;
    }
    // Get one submission
    try {
        let submission = await sub_ctrl.fetchSubmission(req.query.id);
        submission.comments.forEach(comment => comment.addNavigationalIdentifiers(null, 0));
        res.render("submission", { user_auth: req.user_auth, submission: submission });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/threads", auth.passthrough, async (req, res) => {
    if (!req.query || !req.query.id) {
        if (req.user_auth !== null) res.redirect("/threads?id=" + req.user_auth.id);
        else res.send("No such user");
        return;
    }
    try {
        let comment_list = await comm_ctrl.fetchCommentsOfUser(req.query.id);
        comment_list.forEach(comment => comment.formatCreatedAtAsTimeAgo());
        res.render("threads", { user_auth: req.user_auth, comments: comment_list, view: "/threads?id=" + req.query.id });
    } catch {
        res.send("No such user");
    }
});

router.get("/user", auth.passthrough, async (req, res) => {

    if (!req.query || !req.query.id) {
        if (req.user_auth !== null) res.redirect("/user?id=" + req.user_auth.id);
        else res.send("No such user");
        return;
    }
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let user = await user_ctrl.profile(auth_id, req.query.id);
        res.render("user", { user_auth: req.user_auth, user: user,  view: "/user?id=" + req.query.id });
    } catch {
        res.send("No such user");
    }
});

router.get("/submit", async (req, res) => {
    res.render("submit", {});
});

router.get("/upvotedSubmisisons", auth.strict, async (req, res) => {});
router.get("/upvotedComments", auth.strict, async (req, res) => {});

router.get("/favoriteSubmisisons", async (req, res) => {});
router.get("/favoriteComments", async (req, res) => {});