const express = require("express");
const UserCtrl = require("../domain/controllers/UserCtrl");
const AuthMiddleware = require("./api_auth_middleware");
const url = require('url');

const router = express.Router();
module.exports = router;

const user_ctrl = new UserCtrl();
const auth = new AuthMiddleware();