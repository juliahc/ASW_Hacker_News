const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();

router.get("/:id", async (req, res) => {
    // Get one submission
    try {
        let submission = await sub_ctrl.fetchSubmission(req.params.id);
        res.status(200).json(submission);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});


router.get('/', async (req, res) => {
    // Get all submissions
    res.send("You should visit /news to get the view of submissions")
});


router.post("/", auth.strict, async (req, res) => {
    const {title, url, text} = req.body;
    
    //Mirar si title està buit i enviar un error indicant-ho es fa aqui???
    if (title === "") res.render("submit", { error: "You have to introduce a title" });
    if (url != "" && text != "") res.render("submit", { error: "Not implemented yet" });
    
    try {
        await sub_ctrl.createSubmission(title, url, text, req.user_auth.id, req.user_auth.username);
        res.redirect("/newest");
    } catch (e) {
        res.render("submit", { error: "Hacker News can't connect to his database", message: e.message });
    }
});

router.post("/:id/comments", auth.strict, async (req, res) => {
    const {text} = req.body;

    if (text === "") { res.send("Error: text is empty."); }

    try {
        await comm_ctrl.postComment(id, "sub", text, req.user_auth.id, req.user_auth.username);
        res.redirect("/newest"); //redirect to render context of comment (parent submission)
    } catch (e) {
        res.render("submit", { error: "Hacker News can't connect to his database", message: e.message });
    }
});

router.patch("/:id", async (req, res) => {
    // Modify some elements of a submission
});

router.delete("/:id", async (req, res) => {
    // Delete one submission
});