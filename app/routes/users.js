const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const AuthMiddleware = require("./auth_middleware");
const googleAuth = require("../utils/googleAuth.js");
const url = require('url');

const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();
const auth = new AuthMiddleware();

router.get("/login", async (req, res) => {
    // Get the user info
    try {
        res.redirect(googleAuth.googleLoginUrl);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.get("/logout", async (req, res) => {
    let goto = req.query.goto || '/';
    res.clearCookie("access_token");
    res.redirect(goto);
});

router.get("/google/auth", async (req, res) => {
    // Get the user info
    try {
        const queryObject = url.parse(req.url,true).query;

        let token = await googleAuth.getAccessTokenFromCode(queryObject.code);
        let userInfo = await googleAuth.getGoogleUserInfo(token);
        let access_token = await user_ctrl.login_or_register(userInfo.id, userInfo.name, userInfo.email);
        res.cookie('access_token' , access_token);
        res.redirect('/user?id='+userInfo.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/", auth.strict, async (req, res) => {
    let {about, showdead, noprocrast, maxvisit, minaway, delay} = req.body;
    try {
        showdead = showdead === "yes";
        noprocrast = noprocrast === "yes";
        maxvisit = parseInt(maxvisit);
        minaway = parseInt(minaway);
        delay = parseInt(delay);
    } catch (e) {
        res.status(400).send("Form values are not in correct format");
        return;
    }
    const authId = req.user_auth.id;
    try {
        await user_ctrl.update(authId, about, showdead, noprocrast, maxvisit, minaway, delay);
        res.redirect("/user?id="+authId);
    } catch (e) {
        res.render("update", { error: "Hacker News can't connect to its database", message: e.message });
    }

});

router.post("/upvoteSubmission/:submission_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.upvoteSubmission(authId, submissionId);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
    return;
});

router.post("/downvoteSubmission/:submission_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.downvoteSubmission(authId, submissionId);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.post("/upvoteComment/:comment_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.upvoteComment(authId, commentId);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.post("/downvoteComment/:comment_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.downvoteComment(authId, commentId);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.post("/favoriteSubmissions/:submission_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.favoriteSubmission(authId, submissionId);
        res.redirect("/favoriteSubmissions?id="+auth_id);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.post("/unfavoriteSubmissions/:submission_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.unfavoriteSubmissions(authId, submissionId);
        res.redirect("/favoriteSubmissions?id="+auth_id);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.post("/favoriteComments/:comment_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.favoriteSubmission(authId, commentId);
        res.redirect("/favoriteComments?id="+auth_id);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.post("/unfavoriteComments/:comment_id", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.unfavoriteComments(authId, commentId);
        res.redirect("/favoriteComments?id="+auth_id);
        res.status(200);
        let goto = req.query.goto || "/" ;
        res.redirect(goto);
    } catch (e) {
        res.status(500);
    }
});

router.delete("/:id", auth.strict, async (req, res) => { res.send("Can't delete users yet ;)"); });      //deleteUser??
