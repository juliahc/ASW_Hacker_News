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

router.post("/:id/replies", auth.strict, async (req, res) => {
    const {text} = req.body;
    
    if (text === "") { res.send("Error: text is empty."); } // TODO: redirect to submit comment (with error message)
    
    try {
        await comm_ctrl.postReply(id, text, req.user_auth.id, req.user_auth.username);
        res.redirect("/newest"); // TODO: redirect to render context of comment (parent comment)
    } catch (e) {
        res.redirect("/news"); // TODO: redirect to error view
    }
});