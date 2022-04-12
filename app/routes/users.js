const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const Auth_middleware = require("./auth_middleware");
const GoogleAuth = require("../utils/googleAuth");

const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();
const google_auth = new GoogleAuth();
const auth = new Auth_middleware();

router.get("/:id", auth.passthrough, async (req, res) => {
    // Get the user info
    try {
        let user = await user_ctrl.profile (req.user_auth.id, req.params.id);
        res.status(200).json(user);
        res.render("user", { user: user });
    } catch (e) {
        res.status(500).json({ message: e.message });
        res.render("user", { user: user });
    }
});

router.get("/"+process.env.GOOGLE_REDIRECT_URL, async (req, res) => {
    // Get the user info
    try {
        let userInfo = await google_auth.getGoogleAccountFromCode(req.query.code);
        let token = await user_ctrl.login_or_register(userInfo.id, userInfo.username, userInfo.email, userInfo.tokens);
        res.cookie("access_token", token).status(200);
        res.redirect("/news");
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

//router.patch("/:id", auth.strict, async (req, res) => {})
router.patch("/:id", async (req, res) => {
    //Desencriptar token 
    const {about, showdead, noprocrast, maxvisit, minaway, delay} = req.body;

    try {
        let user = await user_ctrl.update(authId, about, email, showdead, noprocrast, maxvisit, minaway, delay);
        console.log("user updated successfully " + authId); // Do whatever is necessary with id.
        res.redirect("/:authId");
    } catch (e) {
        console.log("user update failed with code: " + e.message);
        res.render("update", { error: "Hacker News can't connect to its database", message: e.message });
    }

});

router.get("/:id/upvotedSubmisisons", auth.passthrough, async (req, res) => {})
router.get("/:id/upvotedComments", auth.passthrough, async (req, res) => {})

router.post("/:id", auth.passthrough, async (req, res) => {})   //upvoteSubmission
router.post("/:id", auth.passthrough, async (req, res) => {})   //upvoteComment

router.get("/:id/favoriteSubmisisons", async (req, res) => {})
router.get("/:id/favoriteComments", async (req, res) => {})

router.post("/:id", auth.passthrough, async (req, res) => {})   //favoriteSubmission
router.post("/:id", auth.passthrough, async (req, res) => {})   //favoriteComment

router.delete("/:id", auth.strict, async (req, res) => {})      //deleteUser??