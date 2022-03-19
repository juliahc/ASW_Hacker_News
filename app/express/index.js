// Packages
const express = require("express");
const bodyParser = require("body-parser");
global.mongoose = require("mongoose");
global.Schema = global.mongoose.Schema;

const path = require("path");

const app = express();
const dotenv = require("dotenv").config({
    path: path.resolve(__dirname, "./.env"),
}); 

app.use("/public", express.static(__dirname + "/public"));

function connect() {
    mongoose.connection
        .on("error", console.log)
        .on("disconnected", connect)
        .once("open", listen);
    return mongoose.connect(process.env.MONGODB_URL, {
        keepAlive: 1,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

app.use(bodyParser.json({ type: "application/json", limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Default Route
app.use("/v1/", function(req, res, next) {
    const contentType = req.headers["content-type"];
    // console.log(contentType);
    next();
});

// V1 Routes
const IndexRoutesV1 = require("./routes/index.route.js");
app.use("/v1/", IndexRoutesV1);

function listen() {
    if (app.get("env") === "test") return;
    app.listen(process.env.PORT);
    console.log("Express app started on port " + process.env.PORT);
}

connect();