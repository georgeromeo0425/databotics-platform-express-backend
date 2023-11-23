const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const multer = require("multer");
var path = require("path");

// Set up mongoose connection
const mongoose = require("mongoose");

//let dev_db_url = 'mongodb://caterpillar:caterpillar123@ds215502.mlab.com:15502/kalyantds';
//let dev_db_url = 'mongodb://caterpillar:cat123@ds223812.mlab.com:23812/caterpillar'
//let mongoDB = "mongodb://databot:databot123@ds143594.mlab.com:43594/test1" || dev_db_url;
// let mongoDB = "mongodb+srv://databotics:Dataagile1@cluster0.dt6sa.mongodb.net/databotics?retryWrites=true&w=majority"
let mongoDB = "mongodb://localhost:27017/test1";
// mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
// // mongoose.connect('mongodb://localhost/CAT', { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.Promise = global.Promise;
// let db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const db = require("./models");
db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

var app = express();

var originsWhitelist = [
  "http://www.dev.databotics.io",
  "https://demo.databotics.io",
  "https://databotics.io",
];

var corsOptions = {
  origin: function (origin, callback) {
    var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
    callback(null, isWhitelisted);
  },
  credentials: true,
};

//Cors options

app.use(cors(corsOptions));

var allowCrossDomain = function (req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,HEAD,POST,PUT,DELETE,OPTIONS"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Access-Control-Allow-Headers, Authorization,X-Requested-With"
  );
  next();
};

app.use(allowCrossDomain);

const userinfo = require("./routes/user.route");
const fileuploadInfo = require("./routes/file.route");
const caterpillar = require("./routes/caterpillar.route");
const qualityRoute = require("./routes/quality.router");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", userinfo);
app.use("/file", fileuploadInfo);
app.use("/caterpillar", caterpillar);
app.use("/project", qualityRoute);

// Use the passport package in our application
app.use(passport.initialize());
const passportMiddleware = require("./middleware/passport");
passport.use(passportMiddleware);

app.use("/", (req, res) => {
  res.send("This is something");
});

// error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    var valErrors = [];
    Object.keys(err.errors).forEach((key) =>
      valErrors.push(err.errors[key].message)
    );
    res.status(422).send(valErrors);
  }
});

let port = process.env.PORT || 4006;
app.listen(port, () => {
  console.log(`Server started on port` + port);
});

module.exports = app;
