const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const url = require('url');

const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();
const auth = new AuthMiddleware();

router.get("/", auth.strict, async (req, res) => {
    if (!req.query || !req.query.id) {
        res.redirect("/user?id=" + req.user_auth_id);
        return;
    }
    try {
        let auth_id = req.user_auth_id;
        let user = await user_ctrl.profile(auth_id, req.query.id);
        res.status(200).json(user);
    } catch {
        res.json({"error_msg": "No such user"});
    }
});