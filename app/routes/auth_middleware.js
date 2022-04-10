const jwt = require("jsonwebtoken");

class auth {
    constructor() { }
    strict(req, res, next) {
        const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.signedCookies.user_auth;

        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            const decoded = jwt.verify(token, process.env.USER_AUTH_SECRET_KEY);
            req.user_auth = decoded;
        } catch (err) {
            return res.status(401).send("Invalid Token");
        }
        return next();
    }
    passthrough() {
        const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.signedCookies.user_auth;

        if (!token) {
            req.user_auth = {id: null, google_tokens: null};
        }
        try {
            const decoded = jwt.verify(token, process.env.USER_AUTH_SECRET_KEY);
            req.user_auth = decoded;
        } catch (err) {
            req.user_auth = {id: null, google_tokens: null};
        }
        return next();
    }
}

module.exports = auth;