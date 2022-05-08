const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.post("/:id/comments", auth.strict, async (req, res) => {
    const {text} = req.body;

    if (!text || text === "") { 
        res.status(400).json({"error_msg": "No 'text' field in body or it is empty"});
        return; 
    }

    try {
        let db_comment = await comm_ctrl.postComment(req.params.id, text, req.user_auth.id, req.user_auth.username);
        res.status(201).json(db_comment);
    } catch (e) {
        res.status(404).json({"error_msg": "No such submission"});
    }
});