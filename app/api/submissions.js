const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.get("/", auth.passthrough, async (req, res) => {

    const {type, order, limit, offset} = req.query;

    if(!type || !order || !limit || !offset) {
        res.status(400).json({"error_msg": "Parameters missing in query. Must contain [type, order, limit, offset]"});
        return;
    }

    if (!(type==="all" || type==="ask" || type==="url") || !(order==="pts" || order==="new") || limit<0 || offset<0 ) {
        res.status(400).json({"error_msg": "Incorrect parameter(s) format. Must be [type={'all','ask','url'}, order={'pts','new'}, limit>=0, offset>=0]"});
        return;
    }

    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(limit, offset,type,order,null,auth_id,auth_id);
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.status(200).json({sub_page});
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});


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
        res.status(500).json({"error_msg": e.message});
    }
});

router.get("/user/:id", auth.passthrough, async (req, res) => {   

    const {limit, offset} = req.query;

    if (!limit || !offset || limit < 0 || offset < 0) {
        res.status(400).json({"error_msg": "No 'limit' or 'offset' param in request or they are < 1"});
    }

    try {
        let auth_id = req.user_auth !== null ? req.user_auth.id : null;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(limit, offset,"any","new",req.params.id, auth_id);
        sub_page.pop();
        sub_page.forEach(submission => submission.formatCreatedAtAsTimeAgo());
        res.status(200).json({sub_page});
    } catch (e) {
        res.status(500).json({"error_msg": "No such user"});
    }
});