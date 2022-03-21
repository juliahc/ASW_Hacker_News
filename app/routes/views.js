const express = require("express");
const router = express.Router();
module.exports = router;

router.get("/", async (_, res) => {
    res.render("news", {});
});

router.get("/news", async (req, res) => {
    try {
        let p = req.params.p; // TODO: No sé com es miren els paràmetres de la request però aquesta és la idea.
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","pts");
        res.render("news", {data: sub_page});
    } catch (e) {
        res.render("news", {}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
});

router.get("/newest", async (_, res) => {
    try {
        let p = req.params.p; // TODO: No sé com es miren els paràmetres de la request però aquesta és la idea.
        let sub_page = await sub_ctrl.fetchSubmissionsForParams(p,"any","new");
        res.render("news", {data: sub_page});
    } catch (e) {
        res.render("news", {}) // TODO: Segurament cal mostrar algun missatge d'error (tipus no connecta a bd).
    }
});

router.get("/submit", async (_, res) => {
    res.render("submit", {});
});