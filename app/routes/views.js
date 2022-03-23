const express = require("express");
const SubmissionCtrl = require("../domain/controllers/SubmissionCtrl");
const router = express.Router();
const calcTimeAgo = require("../utils/timeAgo")
module.exports = router;

const sub_ctrl = new SubmissionCtrl();

function calcTimeAgoSubmissions(submissions) {
    for(let submission of submissions) {
        let timeAgo = calcTimeAgo(submission.createdAt);
        submission.createdAt = timeAgo;
    }
    return submissions;
}

router.get("/", async (req, res) => {
    //let p = req.query.p || 1;
    //res.render("news", { submissions: news, info: "hello_world", p: p+1 }); // FIXME: Hardcoded for testing views.
    
    try {
        let p = req.query.p || 1;
        console.log(p);
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page = calcTimeAgoSubmissions(sub_page);
        console.log(more);
        res.render("news", { submissions: sub_page, p: p, view: "news", more: more }); // FIXME: Hardcoded for testing views.
    } catch (e) {
        console.log(e.message);
        res.render("news", { error: "Hacker News can't connect to his database" }) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
    
});

router.get("/news", async (req, res) => {
    try {
        let p = req.query.p || 1;
        console.log(p);
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        console.log(sub_page[sub_page.length-1]);
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page = calcTimeAgoSubmissions(sub_page);
        console.log(submissionsLeft+" -> more:"+more);
        res.render("news", { submissions: sub_page, p: p, view: "news", more: more });
    } catch (e) {
        console.log(e.message);
        res.render("news", {error: "Hacker News can't connect to his database"}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
    
});

router.get("/newest", async (req, res) => {
    //res.render("news", { submissions: news, info: "hello_world" }); // FIXME: Hardcoded for testing views.
    try {
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new");
        let submissionsLeft = sub_page[sub_page.length-1].submissionsLeft;
        let more = submissionsLeft > 0;
        sub_page.pop();
        sub_page = calcTimeAgoSubmissions(sub_page);
        console.log(more);
        res.render("news", { submissions: sub_page, p: p, view: "newest", more: more });
    } catch (e) {
        
        res.render("news", {error: "Hacker News can't connect to his database"}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
});

router.get("/submit", async (req, res) => {
    res.render("submit", {});
});
