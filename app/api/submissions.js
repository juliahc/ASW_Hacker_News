const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();


router.get("/", auth.strict.bind(auth), async (req, res) => {

    const {type, order, limit, offset} = req.query;

    if(!type || !order) {
        res.status(400).json({"error_msg": "Parameters missing in query. Must contain [type, order]. Optional: [limit, offset]"});
        return;
    }

    if (!(type==="any" || type==="ask" || type==="url") || !(order==="pts" || order==="new") || (limit !== undefined && limit<0) || (offset !== undefined && offset<0) ) {
        res.status(400).json({"error_msg": "Incorrect parameter(s) format. Must be [type={'any','ask','url'}, order={'pts','new'}, limit>=0, offset>=0]"});
        return;
    }

    try {
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(limit, offset,type,order,null,req.user_auth.id,req.user_auth.id);
        sub_page.pop();
        res.status(200).json({sub_page});
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});

router.post("/", auth.strict.bind(auth), async (req, res) => {

    let {title, url, text} = req.body;
    
    if (!title || title === "") {
        res.status(400).json({"error_msg": "No 'title' field in body or it is empty"});
        return;
    }

    if (text === undefined) text = "";
    if (url === undefined) url = "";

    try {
        let db_submission =  await sub_ctrl.createSubmission(title, url, text, req.user_auth.id, req.user_auth.username);
        if (db_submission.success) {
            db_submission.message = "Submission created successfully";
            res.status(201).json(db_submission);
        }
        else {
            if (!db_submission.existant) res.status(409).json({"error_msg": "Invalid url!" });
            else res.status(200).json({"error_msg": "This url already exists on a submission!" });
        }
    } catch (e) {
        res.status(500).json({"error_msg": e.message});
    }
});

router.post("/:id/comments", auth.strict.bind(auth), async (req, res) => {
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
  
router.get("/user/:id", auth.strict.bind(auth), async (req, res) => {   

    const {limit, offset} = req.query;
    
    if ((limit && limit < 0) || (offset && offset < 0)) {
        res.status(400).json({"error_msg": " 'limit' or 'offset' are < 0"});
        return;
    }

    try {
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(limit, offset,"any","new",req.params.id, req.user_auth.id);
        sub_page.pop();
        res.status(200).json({sub_page});
    } catch (e) {
        res.status(500).json({"error_msg": "No such user"});
    }
});

router.get("/submission/:id", auth.strict.bind(auth), async (req, res) => {
    if (!req.params || !req.params.id) {
        res.status(400).json({"error_msg": "No 'id' field in query or it is empty"});
        return;
    }
    // Get one submission
    try {
        let submission = await sub_ctrl.fetchSubmission(req.params.id, req.user_auth.id);
        submission.formatCreatedAtAsTimeAgo();
        res.status(200).json(submission);
    } catch (e) {
        res.status(404).json({"error_msg": e.message});
    }
});

