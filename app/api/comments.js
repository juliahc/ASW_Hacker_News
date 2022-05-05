const express = require("express");
const CommentCtrl = require("../domain/controllers/CommentCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const router = express.Router();
module.exports = router;

const comm_ctrl = new CommentCtrl();
const auth = new AuthMiddleware();