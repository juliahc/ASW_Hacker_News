const express = require("express");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.post("/comments/:id/replies", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.status(401).json( { "error_msg": "Not logged in" } );
        return;
    }
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

router.get("/threads", auth.passthrough, async (req, res) => {
    if (!req.query || !req.query.id) {
        if (req.user_auth !== null) res.redirect("/threads?id=" + req.user_auth.id);
        else res.status(400).json( { "error_msg": "Missing id" } );
        return;
    }
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let comment_list = await comm_ctrl.fetchCommentsOfUser(req.query.id, auth_id);
        comment_list.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
            comment.formatCreatedAtAsTimeAgo();
        });
        res.status(200).json(comment_list);
    } catch {
        res.status(404).json( { "error_msg": "No such user" } );
    }
});