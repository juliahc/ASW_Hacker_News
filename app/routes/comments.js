const express = require("express");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./auth_middleware");
const router = express.Router();
module.exports = router;

const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.get("/:id", async (req, res) => {
    // Get one comment and its replies
    try {
        let comment = await comm_ctrl.fetchComment(req.params.id);
        res.status(200).json(comment);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/:id/replies", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const {text} = req.body;

    if (text === "") { res.send("Error: text is empty."); }

    try {
        let db_comment = await comm_ctrl.postReply(req.params.id, text, req.user_auth.id, req.user_auth.username);
        res.redirect("/submission?id="+db_comment.submission+"#"+db_comment.id); //redirect to render context of comment (parent submission)
    } catch (e) {
        res.status(500).send(e.message);
    }
});