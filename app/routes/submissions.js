const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.post("/", auth.strict, async (req, res) => {
    const {title, url, text} = req.body;
    
    if (title === "") {
        res.redirect("/submit?err=badtitle");
        return;
    }
    try {
        let created =  await sub_ctrl.createSubmission(title, url, text, req.user_auth.id, req.user_auth.username);
        console.log("created: ", created)
        if (created.success) res.redirect("/newest");
        else if (!created.existant) res.redirect("/submit?err=url_not_found");
        else res.redirect("/submission?id="+created.id);
    } catch (e) {
        res.redirect("/submit?err=unknown");
    }
});

router.post("/:id/comments", auth.passthrough, async (req, res) => {
    if (req.user_auth === null) {
        res.redirect("/users/login");
        return;
    }
    const {text} = req.body;

    if (text === "") { res.send("Error: text is empty."); }

    try {
        let db_comment = await comm_ctrl.postComment(req.params.id, text, req.user_auth.id, req.user_auth.username);
        res.redirect("/submission?id="+req.params.id+"#"+db_comment.id); //redirect to render context of comment (parent submission)
    } catch (e) {
        res.status(500).send(e.message);
    }
});

router.patch("/:id", async (req, res) => {
    // Modify some elements of a submission
});

router.delete("/:id", async (req, res) => {
    // Delete one submission
});

