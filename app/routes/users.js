const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const AuthMiddleware = require("./auth_middleware");
const googleAuth = require("../utils/googleAuth.js");
const url = require('url');

const nodeCookie = require('node-cookie');
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

router.get("/google/auth", async (req, res) => {
    // Get the user info
    try {
        const queryObject = url.parse(req.url,true).query;

        let token = await googleAuth.getAccessTokenFromCode(queryObject.code);
        let userInfo = await googleAuth.getGoogleUserInfo(token);
        let user_auth = await user_ctrl.login_or_register(userInfo.id, userInfo.name, userInfo.email, token);
        nodeCookie.create(res, 'access_token', user_auth);
        res.redirect('/user?id='+userInfo.id);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.patch("/:id", auth.strict, async (req, res) => {
    const {about, showdead, noprocrast, maxvisit, minaway, delay} = req.body;
    const authId = req.user_auth.id;
    try {
        let user = await user_ctrl.update(authId, about, showdead, noprocrast, maxvisit, minaway, delay);
        res.redirect("/user?id="+authId);
    } catch (e) {
        res.render("update", { error: "Hacker News can't connect to its database", message: e.message });
    }

});

router.get("/:id/upvotedSubmisisons", auth.strict, async (req, res) => {});
router.get("/:id/upvotedComments", auth.strict, async (req, res) => {});

router.post("/:id/upvoteSubmisison/:submission_id", auth.strict, async (req, res) => {
    const authId = req.user_auth.id;
    const submissionId = req.submissionId;
    try {
        user_ctrl.upvoteSubmission(authId, submissionId);
    } catch (e) {
        res.render("upvoteSubmisison", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.post("/:id/downvoteSubmisison/:submission_id", auth.strict, async (req, res) => {
    const authId = req.user_auth.id;
    const submissionId = req.submissionId;
    try {
        user_ctrl.downvoteSubmission(authId, submissionId);
    } catch (e) {
        res.render("downvoteSubmisison", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.post("/:id/upvoteComment/:comment_id", auth.strict, async (req, res) => {
    const authId = req.user_auth.id;
    const commentId = req.commentId;
    try {
        user_ctrl.upvoteComment(authId, commentId);
    } catch (e) {
        res.render("upvoteComment", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.post("/:id/downvoteComment/:comment_id", auth.strict, async (req, res) => {
    const authId = req.user_auth.id;
    const commentId = req.commentId;
    try {
        user_ctrl.downvoteComment(authId, commentId);
    } catch (e) {
        res.render("downvoteComment", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.get("/:id/favoriteSubmisisons", async (req, res) => {
    const authId = req.user_auth.id;
    const submissionId = req.submissionId;
    try {
        user_ctrl.favoriteSubmission(authId, submissionId);
    } catch (e) {
        res.render("favoriteSubmisisons", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.get("/:id/unfavoriteSubmisisons", async (req, res) => {
    const authId = req.user_auth.id;
    const submissionId = req.submissionId;
    try {
        user_ctrl.unfavoriteSubmisisons(authId, submissionId);
    } catch (e) {
        res.render("unfavoriteSubmisisons", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.get("/:id/favoriteComments", async (req, res) => {
    const authId = req.user_auth.id;
    const commentId = req.commentId;
    try {
        user_ctrl.favoriteSubmission(authId, commentId);
    } catch (e) {
        res.render("favoriteComments", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.get("/:id/unfavoriteComments", async (req, res) => {
    const authId = req.user_auth.id;
    const commentId = req.commentId;
    try {
        user_ctrl.unfavoriteComments(authId, commentId);
    } catch (e) {
        res.render("unfavoriteComments", { error: "Hacker News can't connect to its database", message: e.message });
    }
});

router.post("/:id/favoriteSubmisisons/:submission_id", auth.strict, async (req, res) => {}); //favoriteSubmission
router.post("/:id/favoriteComments/:comment_id", auth.strict, async (req, res) => {});       //favoriteComment

router.delete("/:id", auth.strict, async (req, res) => {});      //deleteUser??
