const express = require("express");
const router = express.Router();
module.exports = router;


// hardcoded to test views:
const news = [
    {
        id: "0001",
        title: "Documenting Sony Memory Stick",
        author: "elvis70",
        url: "https://meet.google.com",
        points: 78,
        comments: 8,
        published: "2022-03-22"
    },
    {
        id: "0002",
        title: "RePalm",
        author: "racarmo",
        url: "https://www.getcruise.com/news/a-new-kind-of-equity-program/",
        points: 30,
        comments: 5,
        published: "2022-02-15"
    },
    {
        id: "0003",
        title: "Reverse Engineering an Unknown Microcontroller",
        author: "maria",
        url: "https://manifold.markets/Austin/what-database-will-manifold-be-prim",
        points: 25,
        comments: 0,
        published: "2022-02-13"
    },
    {
        id: "0004",
        title: "Linux on an 8-Bit Micro? ",
        author: "pepe",
        url: "https://textslashplain.com/2017/01/14/the-line-of-death/",
        points: 16,
        comments: 8,
        published: "2022-01-30"
    }
]



router.get("/", async (_, res) => {
    try {
        let p = req.query.p || 1;
        console.log(p);
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        res.render("news", { submissions: news, info: "hello_world" }); // FIXME: Hardcoded for testing views.
    } catch (e) {
        res.render("news", {}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
});

router.get("/news", async (req, res) => {
    try {
        let p = req.query.p || 1;
        console.log(p);
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        res.render("news", { submissions: news, info: "hello_world" });
    } catch (e) {
        res.render("news", {}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
});

router.get("/newest", async (_, res) => {
    try {
        let p = req.query.p || 1;
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new");
        res.render("newest", { submissions: news, info: "hello_world" });
    } catch (e) {
        res.render("newest", {}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
});

router.get("/submit", async (_, res) => {
    res.render("submit", {});
});
