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

app.use(express.static("public"));

function db_connect() {
    mongoose.connection
        .on("error", console.log)
        .on("disconnected", db_connect)
        .once("open", listen);
    return mongoose.connect(process.env.MONGODB_URL, {
        keepAlive: 1,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

app.use(bodyParser.json({ type: "application/json", limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.set('view engine', 'ejs');

// Routes related to serving html/css/js public resources
app.use(require("./routes/views.js"));

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

listen();
//db_connect();