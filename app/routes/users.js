const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();

router.get("/:username", async (req, res) => {
    // Get the user info
    try {
        let user = await user_ctrl.fetchUser(req.params.username);
        res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

router.post("/", async (req, res) => {
    const {username, password, createdAt, karma, about, email, sowdead, noprocrast}
})