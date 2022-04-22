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
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts",null,auth_id,auth_id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/news", more: more });
    } catch (e) {
        res.render("news", { error: "Hacker News can't connect to his database: "+e.message });
    }
    
});

router.get("/news", auth.passthrough, async (req, res) => {
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts",null,auth_id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/news", more: more });
    } catch (e) {
        res.render("news", {error: "Hacker News can't connect to his database: "+e.message});
    }
    
});

router.get("/newest", auth.passthrough, async (req, res) => {
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new",null,auth_id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
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
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"ask","pts",null,auth_id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/ask", more: more });
    } catch (e) {
        res.send("Error!");
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
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new",req.query.id,auth_id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/submitted?id=" + req.query.id, more: more });
    } catch {
        res.send("No such user");
    }
});

router.get("/submission", auth.passthrough, async (req, res) => {
    if (!req.query || !req.query.id) {
        res.send("No such submission");
        return;
    }
    // Get one submission
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let submission = await sub_ctrl.fetchSubmission(req.query.id, auth_id);
        submission.formatCreatedAtAsTimeAgo();
        submission.comments.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
            comment.formatCreatedAtAsTimeAgo();
        });
        res.render("submission", { user_auth: req.user_auth, submission: submission, view: "/submission?id="+req.query.id });
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
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let comment_list = await comm_ctrl.fetchCommentsOfUser(req.query.id, auth_id);
        comment_list.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
            comment.formatCreatedAtAsTimeAgo();
        });
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
        let loggedProfile = req.user_auth !== null && req.user_auth.id === user.googleId;
        
        res.render("user", { user_auth: req.user_auth, user: user, loggedProfile: loggedProfile,  view: "/user?id=" + req.query.id });
    } catch {
        res.send("No such user");
    }
});

router.get("/submit", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    let submitData = {};
    if (req.query && req.query.err === "badtitle") submitData.error = "That's not a valid title."
    if (req.query && req.query.err === "unknown") submitData.error = "Something went wrong, most likely connecting to the DB."
    res.render("submit", submitData);
});

router.get("/upvotedSubmissions", auth.strict, async (req, res) => {
    try {
        let auth_id = req.user_auth.id;
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await user_ctrl.getUpvotedSubmissions(p, auth_id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/upvotedSubmissions", more: more });
    } catch {
        res.send("Something went wrong");
    }
});

router.get("/upvotedComments", auth.strict, async (req, res) => {
    try {
        let comment_list = await user_ctrl.getUpvotedComments(req.user_auth.id);
        comment_list.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
            comment.formatCreatedAtAsTimeAgo();
        });
        res.render("threads", { user_auth: req.user_auth, comments: comment_list, view: "/upvotedComments" });
    } catch {
        res.send("Something went wrong");
    }
});

router.get("/favoriteSubmissions", auth.passthrough, async (req, res) => {
    if (!req.query || !req.query.id) {
        if (req.user_auth !== null) res.redirect("/favoriteSubmissions?id=" + req.user_auth.id);
        else res.send("No such user");
        return;
    }
    try {
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await user_ctrl.getFavoriteSubmissions(p, req.query.id);
        let submissionsLeft = [];
        if (sub_page.length) submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.render("news", { user_auth: req.user_auth, submissions: sub_page, p: p, view: "/favoriteSubmissions?id=" + req.query.id, more: more });
    } catch {
        res.send("Something went wrong");
    }
});
router.get("/favoriteComments", async (req, res) => {});

router.get("/reply", auth.passthrough , async (req, res) => {
    if (!req.query || !req.query.id) {
        res.send("No such reply");
        return;
    }
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let comment = await comm_ctrl.fetchComment(req.query.id, auth_id);
        comment.formatCreatedAtAsTimeAgo();
        console.log("comment: ", comment)
        res.render("reply", { user_auth: req.user_auth, comment: comment, view: "/reply?id="+req.query.id });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

