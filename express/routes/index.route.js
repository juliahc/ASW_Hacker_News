const express = require("express");
const router = express.Router();
module.exports = router;

//Controllers
const UserController = require("../controllers/user.controller");
const SubmissionController = require("../controllers/submission.controller");
const UrlController = require("../controllers/url.controller");
const AskController = require("../controllers/ask.controller");

/*  User */
router.get(
    "/user",
    UserController.find
);

router.post(
    "/newUser",
    UserController.create
);
/* /User */

/*  Submission  */
router.get(
    "/submission",
    SubmissionController.find
);
router.post(
    "/newSubmission",
    SubmissionController.create
);
/* /Submission */

/* Url */
router.get(
    "/url",
    UrlController.find
);
router.post(
    "/newUrl",
    UrlController.create
);
/* /Url */

/*   Ask  */
router.get(
    "/ask",
    AskController.find
);
router.post(
    "/newAsk",
    AskController.create
)
/*  /ask  */