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

router.post("/:id/upvotedSubmisisons/:submission_id", auth.strict, async (req, res) => {});  //upvoteSubmission
router.post("/:id/upvotedComments/:comment_id", auth.strict, async (req, res) => {});        //upvoteComment

router.get("/:id/favoriteSubmisisons", async (req, res) => {});
router.get("/:id/favoriteComments", async (req, res) => {});

router.post("/:id/favoriteSubmisisons/:submission_id", auth.strict, async (req, res) => {}); //favoriteSubmission
router.post("/:id/favoriteComments/:comment_id", auth.strict, async (req, res) => {});       //favoriteComment

router.delete("/:id", auth.strict, async (req, res) => {});      //deleteUser??
