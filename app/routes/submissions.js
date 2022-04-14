const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const AuthMiddleware = require("./auth_middleware");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();
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
    
    try {
        let id = await sub_ctrl.createSubmission(title, url, text, req.user_auth.id, req.user_auth.username);
        console.log("submission created with id: " + id); // Do whatever is necessary with id.
        res.redirect("/news");
    } catch (e) {
        console.log("submission creation failed with code: " + e.message);
        res.render("submit", { error: "Hacker News can't connect to his database", message: e.message });
    }
    
});

router.patch("/:id", async (req, res) => {
    // Modify some elements of a submission
});

router.delete("/:id", async (req, res) => {
    // Delete one submission
});