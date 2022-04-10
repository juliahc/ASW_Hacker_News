// Packages
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(express.static("public"));

app.use(bodyParser.json({ type: "application/json", limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.set('view engine', 'ejs');

// Routes related to serving html/css/js public resources
app.use(require("./routes/views"));

// Routes related to rest operations on submissions
app.use('/submissions', require("./routes/submissions"));
app.use('/users', require("./routes/users"));

function listen() {
    if (app.get("env") === "test") return;
    app.listen(3000);
    console.log("Express app started on port " + 3000);
}

listen();