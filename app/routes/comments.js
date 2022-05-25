const express = require("express");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./auth_middleware");
const router = express.Router();
module.exports = router;

const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.post("/:id/replies", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const {text} = req.body;

    if (text === "") { res.redirect("/reply?id="+req.params.id+"&error=NoText"); return; }

    try {
        let db_comment = await comm_ctrl.postReply(req.params.id, text, req.user_auth.id, req.user_auth.username);
        res.redirect("/submission?id="+db_comment.submission+"#"+db_comment.id); //redirect to render context of comment (parent submission)
    } catch (e) {
        res.status(500).send(e.message);
    }
});