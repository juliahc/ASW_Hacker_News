const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.post("/", auth.strict, async (req, res) => {
    const {title, url, text} = req.body;
    
    if (title === "") {
        res.status(400).json({"error_msg": "No 'title' field in body or it is empty"});
        return;
    }

    try {
        let db_submission =  await sub_ctrl.createSubmission(title, url, text, req.user_auth.id, req.user_auth.username);
        res.status(201).json(db_submission);
    } catch (e) {
        res.status(400).json({"error_msg": "Error"});
    }
});

router.get("/submission", auth.passthrough, async (req, res) => {
    if (!req.query || !req.query.id) {
        res.status(400).json({"error_msg": "No 'id' field in query or it is empty"});
        return;
    }
    // Get one submission
    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let submission = await sub_ctrl.fetchSubmission(req.query.id, auth_id);
        submission.formatCreatedAtAsTimeAgo();
        submission.comments.forEach(comment => {
            comment.addNavigationalIdentifiers(null, 0);
            comment.formatCreatedAtAsTimeAgo();
        });
        /* if (req.query.error === "NoText") res.status(400).json({"error_msg": "Form missing values"}) ("submission", { user_auth: req.user_auth, submission: submission, error: "The text field must contain characters", view: "/submission?id="+req.query.id}); */
        res.status(200).json(submission);
    } catch (e) {
        res.status(400).json({"error_msg": e.message});
    }
});