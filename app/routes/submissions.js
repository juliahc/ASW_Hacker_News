const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const router = express.Router();
module.exports = router;

const sub_ctrl = new SubmissionCtrl();

router.post("/submission", async (req, res) => {
    const {title, url, text/*, author*/} = req.body; // TODO: author may not be given as request param, but in token header.
    try {
        let id = await sub_ctrl.createSubmission(title, url, text, "my_hardcoded_author");
        console.log("submission created with id: " + id); // Do whatever is necessary with id.
        // Recalculate first page of news.
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(1,"any","new");
        res.render("news", {data: sub_page});
    } catch (e) {
        console.log("submission creation failed with code: " + e.message);
        res.render("submit", {error: e.message});
    }
});