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
    
    if (!title || title === "") {
        res.status(400).json({"error_msg": "No 'title' field in body or it is empty"});
        return;
    }

    try {
        let db_submission =  await sub_ctrl.createSubmission(title, url, text, req.user_auth.id, req.user_auth.username);
        res.status(201).json(db_submission);
    } catch (e) {
        res.status(404).json({"error_msg": "Error"});
    }
});

router.get("/user/:id", auth.passthrough, async (req, res) => {   

    if (!req.query.p || req.query.p < 1) {
        res.status(400).json({"error_msg": "No 'page' param in request or it is < 1"});
    }

    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let p = 1;
        if (req.query && req.query.p) p = req.query.p;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new",req.params.id,auth_id);
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.status(200).json({sub_page});
    } catch {
        res.status(401).json({"error_msg": "No such user"});
    }
});