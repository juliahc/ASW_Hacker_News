require("dotenv").config();
const DatabaseCtrl = require("../domain/controllers/DatabaseCtrl");


class auth {
    constructor() {
        this.db = new DatabaseCtrl();
    }
    strict(req, res, next) {
        const apiKey = req.headers['api_key'];
        if (!apiKey) {
            return res.status(403).json({"error_msg":"An apiKey is required for authentication"});
        }
        try {
            let resp = await this.db.getRequest('/apiKey', {"key" : apiKey});
            if (resp.hasOwnProperty("status") && resp.status !== this.db.errors.SUCCESS) {
                return res.status(401).json({"error_msg":"Invalid api key"});
            }
            req.user_auth_id = resp.data.id;
        } catch (err) {
            return res.status(500).json({"error_msg":"Something went wrong while checking api key on database."});
        }
        return next();
    }
}

module.exports = auth;