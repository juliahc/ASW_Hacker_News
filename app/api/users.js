const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const url = require('url');

const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();
const auth = new AuthMiddleware();

router.get("/:id", auth.strict.bind(auth), async (req, res) => {
    try {
        let user = await user_ctrl.profile(req.user_auth.id, req.params.id);
        res.status(200).json(user);
    } catch {
        res.status(404).json({"error_msg": "No such user"});
    }
});

router.put("/:id", auth.strict.bind(auth), async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can update its profile"});
        return;
    }

    let {about, showdead, noprocrast, maxvisit, minaway, delay} = req.body;
    
    try {
        if (maxvisit !== undefined)     maxvisit = parseInt(maxvisit);
        if (minaway !== undefined)      minaway = parseInt(minaway);
        if (delay !== undefined)        delay = parseInt(delay);
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

router.post("/:id/upvoteSubmission/:submission_id", auth.strict.bind(auth), async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can upvote a submission"});
        return;
    }
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.upvoteSubmission(req.user_auth.id, submissionId);
        res.status(200).json({"success": "The upvote have been submitted successfully"});
    } catch (e) {
        if (e.message === "Resource not found") res.status(404).json({"error_msg": "No such submission"});
        else if (e.message === "Already upvoted") res.status(409).json({"error_msg": "You have already upvoted this submission"});
        else res.status(500).json({"error_msg": e.message});
    }
    return;
});

router.post("/:id/downvoteSubmission/:submission_id", auth.strict.bind(auth), async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can downvote a submission"});
        return;
    }
    const authId = req.user_auth.id;
    const submissionId = req.params.submission_id;
    try {
        await user_ctrl.downvoteSubmission(authId, submissionId);
        res.status(200).json({"success": "The downvote have been submitted successfully"});
    } catch (e) {
        if (e.message === "Resource not found") res.status(404).json({"error_msg": "No such submission"});
        else if (e.message === "The submission was not upvoted!") res.status(409).json({"error_msg": "The submission was not upvoted!"});
        else res.status(500).json({"error_msg": e.message});
    }
});

router.get("/:id/upvotedSubmissions", auth.strict.bind(auth), async (req, res) => {
    let {limit, offset} = req.query;

    if (limit === undefined) {
        limit = "";
    } if (offset === undefined) {
        offset = "";
    }

    try {
        let sub_page = await user_ctrl.getUpvotedSubmissions(limit, offset, req.user_auth.id);
        sub_page.pop();
        res.status(200).json({sub_page});
    } catch {
        res.status(404).json({"error_msg": "No upvoted submissions or not user"});
    }
});

router.post("/:id/upvoteComment/:comment_id", auth.strict.bind(auth), async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can upvote a comment"});
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.upvoteComment(authId, commentId);
        res.status(200).json({"success": "The upvote have been submitted successfully"});
    } catch (e) {
        if (e.message == "Resource not found") {
            res.status(404).json({"error_msg": "No such comment"});
        } else if (e.message == "Already upvoted") res.status(409).json({"error_msg": "You have already upvoted this comment"});
        else res.status(500).json({"error_msg": e.message});
    }
});

router.post("/:id/downvoteComment/:comment_id", auth.strict.bind(auth), async (req, res) => {
    if (req.params.id !== req.user_auth.id) {
        res.status(403).json({"error_msg": "Only the owner of the account can downvote a comment"});
        return;
    }
    const authId = req.user_auth.id;
    const commentId = req.params.comment_id;
    try {
        await user_ctrl.downvoteComment(authId, commentId);
        res.status(200).json({"success": "The downvote have been submitted successfully"});
    } catch (e) {
        if (e.message == "Resource not found") res.status(404).json({"error_msg": "No such comment"});
        else if (e.message == "The comment was not upvoted!") res.status(409).json({"error_msg": e.message});
        else res.status(500).json({"error_msg": e.message});
    }
}); 

router.get("/:id/upvotedComments", auth.strict.bind(auth), async (req, res) => {
    try {
        let comment_list = await user_ctrl.getUpvotedComments(req.user_auth.id);
        comment_list.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
        });
        res.status(200).json({comment_list});
    } catch {
        res.status(404).json({"error_msg": "No upvoted comments or not user"});
    }
});