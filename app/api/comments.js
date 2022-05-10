const express = require("express");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.post("/:id/replies", auth.strict.bind(auth), async (req, res) => {
    const {text} = req.body;

    if (text === "") { 
        res.status(400).json( { "error_msg": "No text" } );
        return;
    }

    try {
        let db_comment = await comm_ctrl.postReply(req.params.id, text, req.user_auth.id, req.user_auth.username);
        res.status(200).json(db_comment);
    } catch (e) {
        res.status(404).json( { "error_msg": e.message } );
    }
});

router.get("/user/:id", auth.strict.bind(auth), async (req, res) => {
    try {
        let comment_list = await comm_ctrl.fetchCommentsOfUser(req.params.id, req.user_auth.id);
        comment_list.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
            comment.formatCreatedAtAsTimeAgo();
        });
        res.status(200).json(comment_list);
    } catch {
        res.status(404).json( { "error_msg": "No such user" } );
    }
});