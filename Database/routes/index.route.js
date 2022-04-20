const express = require("express");
const router = express.Router();
module.exports = router;

//Middlewares
const validateMiddleware = require("../middlewares/validate.middleware");

//Controllers
const AuthController = require("../controllers/auth.controller");
const UserController = require("../controllers/user.controller");
const SubmissionController = require("../controllers/submission.controller");
const UrlController = require("../controllers/url.controller");
const AskController = require("../controllers/ask.controller");
const CommentController = require("../controllers/comment.controller");

/*  User */
router.get(
    "/user",
    validateMiddleware.validate,
    UserController.find
);

router.post(
    "/register",
    validateMiddleware.validate,
    AuthController.validate("registerUser"),
    AuthController.register
);

router.post(
    "/updateUser",
    validateMiddleware.validate,
    UserController.update
);

router.get(
    "/userSubmissions",
    validateMiddleware.validate,
    UserController.userSubmissions
);
/* /User */

/*  Submission  */
router.get(
    "/submission",
    validateMiddleware.validate,
    SubmissionController.find
);
router.get(
    "/submission_page",
    validateMiddleware.validate,
    SubmissionController.page
);
router.get(
    "/submissionComments",
    validateMiddleware.validate,    
    SubmissionController.comments
);
router.post(
    "/newSubmission",
    validateMiddleware.validate,
    SubmissionController.create
);
/* /Submission */

/* Url */
router.get(
    "/url",
    validateMiddleware.validate,
    UrlController.find
);
router.post(
    "/newUrl",
    validateMiddleware.validate,
    UrlController.create
);
/* /Url */

/*   Ask  */
router.get(
    "/ask",
    validateMiddleware.validate,
    AskController.find
);
router.post(
    "/newAsk",
    validateMiddleware.validate,
    AskController.create
)
/*  /ask  */

/*  comment    */

router.get(
    "/comment",
    validateMiddleware.validate,
    CommentController.find
);

router.post(
    "/newComment",
    validateMiddleware.validate,
    CommentController.create
)

/*  /comment    */