const express = require("express");
const router = express.Router();
module.exports = router;

router.get("/", async (_, res) => {
    res.render("news", {});
});

router.get("/news", async (_, res) => {
    res.render("news", {});
});

router.get("/newest", async (_, res) => {
    res.render("newest", {});
});

router.get("/submit", async (_, res) => {
    res.render("submit", {});
});