// Packages
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(express.static("public"));
app.use(cookieParser());

app.use(cors());

app.use(bodyParser.json({ type: "application/json", limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.set('view engine', 'ejs');

// Routes related to serving html/css/js public resources
app.use(require("./routes/views"));

// Routes related to rest operations on submissions, users, etc.
app.use('/submissions', require("./routes/submissions"));
app.use('/comments', require("./routes/comments"));
app.use('/users', require("./routes/users"));

// Api routes
app.use('/api/submissions', require("./api/submissions"));
app.use('/api/comments', require("./api/comments"));
app.use('/api/users', require("./api/users"));

function listen() {
    app.listen(3000);
    console.log("Express app started on port " + 3000);
}

listen();