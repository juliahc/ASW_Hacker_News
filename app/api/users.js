const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const url = require('url');

const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();
const auth = new AuthMiddleware();

router.get("/:id", auth.strict, async (req, res) => {
    try {
        let user = await user_ctrl.profile(req.user_auth.id, req.params.id);
        res.status(200).json(user);
    } catch {
        res.status(404).json({"error_msg": "No such user"});
    }
});

router.put("/:id", auth.strict, async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can update its profile"});
        return;
    }

    let {about, showdead, noprocrast, maxvisit, minaway, delay} = req.body;
    if (!about || !showdead || !noprocrast || !maxvisit || !minaway || !delay) {
        res.status(400).json({"error_msg": "Form missing values. Must contain: [about, showdead, noprocrast, maxvisit, minaway, delay]"});
        return;
    }
    try {
        showdead = showdead === "yes";
        noprocrast = noprocrast === "yes";
        maxvisit = parseInt(maxvisit);
        minaway = parseInt(minaway);
        delay = parseInt(delay);
    } catch (e) {
        res.status(400).json({"error_msg": "Form values are not in correct format"});
        return;
    }

    if (maxvisit < 0 || minaway < 0 || delay < 0) {
        res.status(409).json({"error_msg": "Form integers must be greater or equal than zero"});
        return;
    }

    try {
        let user = await user_ctrl.update(req.params.id, about, showdead, noprocrast, maxvisit, minaway, delay);
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});

router.post(":id/upvoteSubmisison/:submission_id", auth.passthrough, async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can upvote a comment"});
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.upvoteSubmission(authId, submissionId);
        res.status(200);
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
    return;
});

router.post(":id/downvoteSubmisison/:submission_id", auth.passthrough, async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can upvote a comment"});
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.downvoteSubmission(authId, submissionId);
        res.status(200);
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});

router.get(":id/upvotedSubmissions", auth.strict, async (req, res) => {
    try {
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let upvotedSubmissions = await user_ctrl.getUpvotedSubmissions(p, req.user_auth.id);
        res.status(200).json(upvotedSubmissions);
    } catch {
        res.status(404).json({"error_msg": "No upvoted submissions or not user"});
    }
});

router.post(":id/upvoteComment/:comment_id", auth.passthrough, async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can upvote a comment"});
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.upvoteComment(authId, commentId);
        res.status(200);
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});

router.post(":id/downvoteComment/:comment_id", auth.passthrough, async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can downvote a comment"});
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.downvoteComment(authId, commentId);
        res.status(200);
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});

router.get(":id/upvotedComments", auth.strict, async (req, res) => {
    try {
        let upvotedComments = await user_ctrl.getUpvotedComments(req.user_auth.id);
        res.status(200).json(upvotedComments);
    } catch {
        res.status(404).json({"error_msg": "No upvoted comments or not user"});
    }
});